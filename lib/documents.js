import { collection, deleteDoc, doc, getDocs, query, where, writeBatch } from "firebase/firestore";
import { db } from "@/config/firebaseConfig";
import { workspaceIdVariants } from "@/lib/workspace";

/**
 * Creates an empty document (metadata + editor output) inside a workspace
 * and returns its id.
 */
export async function createDocument({ workspaceId, createdBy }) {
  const docId = crypto.randomUUID();
  const batch = writeBatch(db);

  batch.set(doc(db, "workspaceDocuments", docId), {
    workspaceId: String(workspaceId),
    createdBy: createdBy ?? null,
    coverImage: null,
    emoji: null,
    id: docId,
    documentName: "Untitled Document",
    documentOutput: [],
  });
  batch.set(doc(db, "documentOutput", docId), {
    docId,
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
 * Deletes a workspace together with all of its documents and their content.
 */
export async function deleteWorkspace(workspaceId) {
  const snapshot = await getDocs(
    query(
      collection(db, "workspaceDocuments"),
      where("workspaceId", "in", workspaceIdVariants(workspaceId))
    )
  );

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
