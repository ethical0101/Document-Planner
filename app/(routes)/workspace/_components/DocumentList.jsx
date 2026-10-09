"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { StickyNote } from "lucide-react";
import { toast } from "sonner";
import { deleteDocument } from "@/lib/documents";
import DocumentOptions from "./DocumentOptions";

function DocumentList({ documentList, workspaceId, activeDocumentId }) {
  const router = useRouter();

  const onDeleteDocument = async (docId) => {
    try {
      await deleteDocument(docId);
      toast("Document deleted");
      if (docId === activeDocumentId) {
        const next = documentList.find((d) => d.id !== docId);
        router.replace(`/workspace/${workspaceId}${next ? `/${next.id}` : ""}`);
      }
    } catch (e) {
      toast.error("Could not delete the document.");
    }
  };

  if (!documentList.length) {
    return <p className="mt-4 text-sm text-gray-500">No documents yet.</p>;
  }

  return (
    <ul>
      {documentList.map((document) => (
        <li key={document.id}>
          <div
            role="link"
            tabIndex={0}
            onClick={() => router.push(`/workspace/${workspaceId}/${document.id}`)}
            onKeyDown={(e) => {
              if (e.key === "Enter") router.push(`/workspace/${workspaceId}/${document.id}`);
            }}
            className={`flex items-center justify-between gap-2 p-2 px-3 mt-2 rounded-lg cursor-pointer hover:bg-gray-200 ${
              document.id === activeDocumentId ? "bg-white shadow-sm" : ""
            }`}
          >
            <div className="flex items-center min-w-0 gap-2">
              {document.emoji ? (
                <span className="shrink-0">{document.emoji}</span>
              ) : (
                <StickyNote className="w-5 h-5 shrink-0" />
              )}
              <span className="truncate">{document.documentName || "Untitled Document"}</span>
            </div>
            <DocumentOptions
              document={document}
              workspaceId={workspaceId}
              onDelete={() => onDeleteDocument(document.id)}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

export default DocumentList;
