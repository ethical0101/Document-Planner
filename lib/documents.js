import { collection, deleteDoc, doc, getDocs, query, where, writeBatch } from "firebase/firestore";
import { db } from "@/config/firebaseConfig";
import { workspaceIdVariants } from "@/lib/workspace";

/**
 * Creates an empty document (metadata + editor output) inside a workspace
 * and returns its id. `orgId` is copied from the workspace so Firestore rules
 * can authorize access to each document directly.
 */
export async function createDocument({ workspaceId, orgId, createdBy }) {
  const docId = crypto.randomUUID();
  const batch = writeBatch(db);

  batch.set(doc(db, "workspaceDocuments", docId), {
    workspaceId: String(workspaceId),
    orgId,
    createdBy: createdBy ?? null,
    coverImage: null,
    emoji: null,
    id: docId,
    documentName: "Untitled Document",
    documentOutput: [],
  });
  batch.set(doc(db, "documentOutput", docId), {
    docId,
    orgId,
    output: null,
  });

  await batch.commit();
  return docId;
}

/**
 * Deletes a document and its stored editor output.
 */
export async function deleteDocument(docId) {
  const batch = writeBatch(db);
  batch.delete(doc(db, "workspaceDocuments", docId));
  batch.delete(doc(db, "documentOutput", docId));
  await batch.commit();
}


/**
 * Queries the documents of a workspace. Filtering on `orgId` lets Firestore
 * rules verify that the user may read every result.
 */
export function workspaceDocumentsQuery(workspace, ...constraints) {
  return query(
    collection(db, "workspaceDocuments"),
    where("orgId", "==", workspace.orgId),
    where("workspaceId", "in", workspaceIdVariants(workspace.id)),
    ...constraints
  );
}

/**
 * Deletes a workspace together with all of its documents and their content.
 */
export async function deleteWorkspace(workspace) {
  const snapshot = await getDocs(workspaceDocumentsQuery(workspace));
  const workspaceId = workspace.id;

  // Firestore batches are limited to 500 writes; stay well below that.
  const ids = snapshot.docs.map((d) => d.id);
  for (let i = 0; i < ids.length; i += 200) {
    const batch = writeBatch(db);
    ids.slice(i, i + 200).forEach((id) => {
      batch.delete(doc(db, "workspaceDocuments", id));
      batch.delete(doc(db, "documentOutput", id));
    });
    await batch.commit();
  }

  await deleteDoc(doc(db, "Workspace", String(workspaceId)));
}
