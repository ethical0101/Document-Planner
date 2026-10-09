"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { doc, onSnapshot } from "firebase/firestore";
import { FileX, Loader2Icon, MessageCircle, X } from "lucide-react";
import { Room } from "@/app/Room";
import { Button } from "@/components/ui/button";
import { db } from "@/config/firebaseConfig";
import CommentBox from "./CommentBox";
import DocumentHeader from "./DocumentHeader";
import DocumentInfo from "./DocumentInfo";
import RichDocumentEditor from "./RichDocumentEditor";
import RoomSubscriptions from "./RoomSubscriptions";

function DocumentEditorSection({ workspaceId, documentId }) {
  const [openComment, setOpenComment] = useState(false);
  // undefined = loading, null = missing or no access, object = document data
  const [documentInfo, setDocumentInfo] = useState(undefined);

  // Live document details; also confirms the user may open this document.
  useEffect(() => {
    return onSnapshot(
      doc(db, "workspaceDocuments", documentId),
      (snap) => setDocumentInfo(snap.exists() ? snap.data() : null),
      () => setDocumentInfo(null)
    );
  }, [documentId]);

  // Links from comment notifications end with a thread or comment anchor.
  useEffect(() => {
    if (/^#(th|cm)_/.test(window.location.hash)) setOpenComment(true);
  }, []);

  return (
    <div className="relative">
      <DocumentHeader workspaceId={workspaceId} documentId={documentId} />

      {documentInfo === undefined && (
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2Icon className="w-6 h-6 text-gray-400 animate-spin" aria-label="Loading" />
        </div>
      )}

      {documentInfo === null && (
        <div className="flex flex-col items-center justify-center gap-4 px-6 text-center h-[60vh]">
          <FileX className="w-12 h-12 text-gray-400" />
          <h2 className="text-xl font-semibold">Document not found</h2>
          <p className="text-gray-500">
            It may have been deleted, or you don&apos;t have access to it.
          </p>
          <Link href={`/workspace/${workspaceId}`}>
            <Button>Back to workspace</Button>
          </Link>
        </div>
      )}

      {documentInfo && (
        <Room roomId={documentId}>
          <RoomSubscriptions />

          <DocumentInfo documentId={documentId} documentInfo={documentInfo} />

          <div className="px-4 pb-32 sm:px-10 md:px-16 lg:px-20">
            <RichDocumentEditor documentId={documentId} />
          </div>

          <div className="fixed z-30 flex flex-col items-end gap-3 right-4 bottom-4 sm:right-8 sm:bottom-8">
            {openComment && <CommentBox />}
            <Button
              onClick={() => setOpenComment(!openComment)}
              className="w-12 h-12 rounded-full shadow-lg"
              aria-label={openComment ? "Close comments" : "Open comments"}
            >
              {openComment ? <X /> : <MessageCircle />}
            </Button>
          </div>
        </Room>
      )}
    </div>
  );
}

export default DocumentEditorSection;
