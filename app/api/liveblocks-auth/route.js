import { auth, currentUser } from "@clerk/nextjs/server";
import { Liveblocks } from "@liveblocks/node";
import { canAccessWorkspace, getWorkspaceForRoom, isValidRoomId } from "@/lib/server/access";

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCK_SK,
});

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
    if (!isValidRoomId(room)) {
      return Response.json({ error: "Invalid room" }, { status: 400 });
    }
    const workspace = await getWorkspaceForRoom(room);
    if (!(await canAccessWorkspace(workspace, { userId, email, orgId }))) {
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
