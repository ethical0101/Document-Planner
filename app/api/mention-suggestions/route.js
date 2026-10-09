import { auth, currentUser } from "@clerk/nextjs/server";
import {
  canAccessWorkspace,
  getWorkspaceForRoom,
  getWorkspaceMembers,
  isValidRoomId,
} from "@/lib/server/access";

const MAX_SUGGESTIONS = 20;

/**
 * Returns the ids (emails) of workspace members matching the search text,
 * used for @mention suggestions in comments.
 */
export async function GET(request) {
  const { userId, orgId } = await auth();
  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress;
  if (!userId || !email) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const roomId = searchParams.get("roomId");
  const text = (searchParams.get("text") ?? "").trim().toLowerCase();

  if (!isValidRoomId(roomId)) {
    return Response.json({ error: "Invalid room" }, { status: 400 });
  }

  const workspace = await getWorkspaceForRoom(roomId);
  if (!(await canAccessWorkspace(workspace, { userId, email, orgId }))) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const members = await getWorkspaceMembers(workspace, user);
  const matches = members
    .filter(
      (m) => !text || m.name.toLowerCase().includes(text) || m.email.toLowerCase().includes(text)
    )
    .slice(0, MAX_SUGGESTIONS);

  return Response.json({ users: matches });
}
