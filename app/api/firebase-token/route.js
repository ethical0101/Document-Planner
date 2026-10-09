import { auth, currentUser } from "@clerk/nextjs/server";
import { adminAuth } from "@/lib/server/firebaseAdmin";
import { getUserOrganizationIds } from "@/lib/server/access";

/**
 * Exchanges the Clerk session for a Firebase custom token. The token carries
 * the user's email and organization ids, which the Firestore security rules
 * use to decide which workspaces and documents the user may access.
 */
export async function POST() {
  const { userId } = await auth();
  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress;

  if (!userId || !email) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const orgs = await getUserOrganizationIds(userId);
    const token = await adminAuth().createCustomToken(userId, {
      userEmail: email,
      orgs,
    });
    return Response.json({ token }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Failed to create Firebase token", error);
    return Response.json({ error: "Could not create Firebase token" }, { status: 500 });
  }
}
