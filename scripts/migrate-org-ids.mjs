/**
 * One-time migration for data created before Firestore security rules were
 * introduced.
 *
 * - Copies each workspace's `orgId` onto its documents (`workspaceDocuments`)
 *   and their editor content (`documentOutput`).
 * - Normalizes numeric workspace ids to strings.
 * - Reports documents whose workspace no longer exists (orphans).
 *
 * Usage (requires the FIREBASE_* service account variables in .env.local):
 *
 *   node --env-file=.env.local scripts/migrate-org-ids.mjs           # dry run
 *   node --env-file=.env.local scripts/migrate-org-ids.mjs --apply   # write changes
 *   node --env-file=.env.local scripts/migrate-org-ids.mjs --apply --delete-orphans
 */
import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const apply = process.argv.includes("--apply");
const deleteOrphans = process.argv.includes("--delete-orphans");

const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = process.env;
if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
  console.error("Missing FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL or FIREBASE_PRIVATE_KEY.");
  process.exit(1);
}

initializeApp({
  credential: cert({
    projectId: FIREBASE_PROJECT_ID,
    clientEmail: FIREBASE_CLIENT_EMAIL,
    privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  }),
});
const db = getFirestore();

const workspaces = new Map();
(await db.collection("Workspace").get()).forEach((snap) => {
  workspaces.set(snap.id, snap.data());
});

const writer = db.bulkWriter();
let updated = 0;
let orphans = 0;

const documents = await db.collection("workspaceDocuments").get();
for (const snap of documents.docs) {
  const data = snap.data();
  const workspaceId = String(data.workspaceId ?? "");
  const workspace = workspaces.get(workspaceId);
  const outputRef = db.collection("documentOutput").doc(snap.id);

  if (!workspace?.orgId) {
    orphans++;
    console.log(`orphan document ${snap.id} (workspace "${workspaceId}" not found)`);
    if (apply && deleteOrphans) {
      writer.delete(snap.ref);
      writer.delete(outputRef);
    }
    continue;
  }

  if (data.orgId === workspace.orgId && data.workspaceId === workspaceId) continue;

  updated++;
  console.log(`document ${snap.id} -> orgId ${workspace.orgId}`);
  if (apply) {
    writer.set(snap.ref, { orgId: workspace.orgId, workspaceId }, { merge: true });
    writer.set(outputRef, { docId: snap.id, orgId: workspace.orgId }, { merge: true });
  }
}

// Workspace ids stored as numbers are normalized to strings.
for (const [id, workspace] of workspaces) {
  if (typeof workspace.id !== "string") {
    console.log(`workspace ${id} -> string id`);
    if (apply) writer.set(db.collection("Workspace").doc(id), { id }, { merge: true });
  }
}

await writer.close();

console.log(
  `\n${documents.size} documents checked, ${updated} to update, ${orphans} orphaned.` +
    (apply ? " Changes applied." : " Dry run: re-run with --apply to write changes.")
);
