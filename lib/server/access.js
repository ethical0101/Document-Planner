import "server-only";
import { clerkClient } from "@clerk/nextjs/server";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/config/firebaseConfig";

const ROOM_ID_PATTERN = /^[A-Za-z0-9_-]{1,128}$/;
const MAX_MEMBERS = 500;

export function isValidRoomId(roomId) {
  return typeof roomId === "string" && ROOM_ID_PATTERN.test(roomId);
}

const isOrganizationId = (id) => typeof id === "string" && id.startsWith("org_");

/**
 * Loads the workspace that owns a document (Liveblocks room).
 */
export async function getWorkspaceForRoom(roomId) {
  const documentSnap = await getDoc(doc(db, "workspaceDocuments", roomId));
  if (!documentSnap.exists()) return null;

  const workspaceId = documentSnap.data()?.workspaceId;
  if (workspaceId === undefined || workspaceId === null) return null;

  const workspaceSnap = await getDoc(doc(db, "Workspace", String(workspaceId)));
  return workspaceSnap.exists() ? workspaceSnap.data() : null;
}

/**
 * A user can access a workspace they own (personal workspace) or one that
 * belongs to an organization they are a member of.
 */
export async function canAccessWorkspace(workspace, { userId, email, orgId }) {
  if (!workspace) return false;
  if (workspace.orgId === email || workspace.createdBy === email) return true;
  if (orgId && workspace.orgId === orgId) return true;

  if (isOrganizationId(workspace.orgId)) {
    const client = await clerkClient();
    const memberships = await client.users.getOrganizationMembershipList({
      userId,
      limit: 100,
    });
    return memberships.data.some((m) => m.organization.id === workspace.orgId);
  }
  return false;
}

function toMember(publicUserData) {
  const email = publicUserData?.identifier;
  if (!email) return null;
  const name = [publicUserData.firstName, publicUserData.lastName].filter(Boolean).join(" ");
  return { email, name: name || email, avatar: publicUserData.imageUrl ?? null };
}

/**
 * Lists the members of a Clerk organization.
 */
export async function getOrganizationMembers(organizationId) {
  const client = await clerkClient();
  const members = [];
  for (let offset = 0; offset < MAX_MEMBERS; offset += 100) {
    const page = await client.organizations.getOrganizationMembershipList({
      organizationId,
      limit: 100,
      offset,
    });
    for (const membership of page.data) {
      const member = toMember(membership.publicUserData);
      if (member) members.push(member);
    }
    if (page.data.length < 100) break;
  }
  return members;
}

/**
 * The people who can collaborate in a workspace: the organization's members,
 * or just the owner for a personal workspace.
 */
export async function getWorkspaceMembers(workspace, currentUser) {
  if (isOrganizationId(workspace?.orgId)) {
    return getOrganizationMembers(workspace.orgId);
  }
  const email = currentUser?.primaryEmailAddress?.emailAddress;
  return email
    ? [{ email, name: currentUser.fullName ?? email, avatar: currentUser.imageUrl ?? null }]
    : [];
}
