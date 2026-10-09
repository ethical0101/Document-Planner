"use client";

import React, { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { Room } from "@/app/Room";
import { Button } from "@/components/ui/button";
import CommentBox from "./CommentBox";
import DocumentHeader from "./DocumentHeader";
import DocumentInfo from "./DocumentInfo";
import RichDocumentEditor from "./RichDocumentEditor";
import RoomSubscriptions from "./RoomSubscriptions";

function DocumentEditorSection({ workspaceId, documentId }) {
  const [openComment, setOpenComment] = useState(false);

  return (
    <div className="relative">
      <DocumentHeader workspaceId={workspaceId} documentId={documentId} />

      <Room roomId={documentId}>
        <RoomSubscriptions />

        <DocumentInfo documentId={documentId} />

        <div className="px-4 pb-32 sm:px-10 md:px-16 lg:px-20">
          <RichDocumentEditor documentId={documentId} />
        </div>

        <div className="fixed z-30 flex flex-col items-end gap-3 right-4 bottom-4 sm:right-8 sm:bottom-8">
          {openComment && <CommentBox />}
          <Button
            onClick={() => setOpenComment(!openComment)}
            className="rounded-full shadow-lg w-12 h-12"
            aria-label={openComment ? "Close comments" : "Open comments"}
          >
            {openComment ? <X /> : <MessageCircle />}
          </Button>
        </div>
      </Room>
    </div>
  );
}

export default DocumentEditorSection;
