import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { Liveblocks } from "@liveblocks/node";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/config/firebaseConfig";

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCK_SK,
});

const ROOM_ID_PATTERN = /^[A-Za-z0-9_-]{1,128}$/;

/**
 * Checks that the signed-in user may open the given document (room).
 * A user can access a document when its workspace belongs to them
 * (personal workspace) or to an organization they are a member of.
 */
async function canAccessRoom(roomId, { userId, email, orgId }) {
  const documentSnap = await getDoc(doc(db, "workspaceDocuments", roomId));
  if (!documentSnap.exists()) return false;

  const workspaceId = documentSnap.data()?.workspaceId;
  if (workspaceId === undefined || workspaceId === null) return false;

  const workspaceSnap = await getDoc(doc(db, "Workspace", String(workspaceId)));
  if (!workspaceSnap.exists()) return false;

  const workspace = workspaceSnap.data();
  if (workspace.orgId === email || workspace.createdBy === email) return true;
  if (orgId && workspace.orgId === orgId) return true;

  if (typeof workspace.orgId === "string" && workspace.orgId.startsWith("org_")) {
    const client = await clerkClient();
    const memberships = await client.users.getOrganizationMembershipList({
      userId,
      limit: 100,
    });
    return memberships.data.some((m) => m.organization.id === workspace.orgId);
  }

  return false;
}

export async function POST(request) {
  if (!process.env.LIVEBLOCK_SK) {
    return Response.json({ error: "Liveblocks is not configured" }, { status: 500 });
  }

  const { userId, orgId } = await auth();
  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress;

  if (!userId || !user || !email) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let room;
  try {
    ({ room } = await request.json());
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const session = liveblocks.prepareSession(email, {
    userInfo: {
      name: user.fullName ?? email,
      avatar: user.imageUrl,
    },
  });

  // A token without a room is requested for user-level features such as the
  // notifications inbox. Only grant room access after an ownership check.
  if (room !== undefined && room !== null) {
    if (typeof room !== "string" || !ROOM_ID_PATTERN.test(room)) {
      return Response.json({ error: "Invalid room" }, { status: 400 });
    }
    const allowed = await canAccessRoom(room, { userId, email, orgId });
    if (!allowed) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }
    session.allow(room, session.FULL_ACCESS);
  }

  const { status, body } = await session.authorize();
  return new Response(body, {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
