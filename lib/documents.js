import { doc, writeBatch } from "firebase/firestore";
import { db } from "@/config/firebaseConfig";

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

