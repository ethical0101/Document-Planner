"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { SmilePlus } from "lucide-react";
import { toast } from "sonner";
import CoverPicker from "@/app/_components/CoverPicker";
import EmojiPickerComponent from "@/app/_components/EmojiPickerComponent";
import { db } from "@/config/firebaseConfig";
import { coverImageSrc } from "@/lib/workspace";

function DocumentInfo({ documentId }) {
  const [documentInfo, setDocumentInfo] = useState(null);
  const [documentName, setDocumentName] = useState("");
  // While the title is being edited, remote updates must not overwrite it.
  const editingName = useRef(false);

  useEffect(() => {
    if (!documentId) return;
    return onSnapshot(doc(db, "workspaceDocuments", documentId), (snap) => {
      if (!snap.exists()) return;
      const data = snap.data();
      setDocumentInfo(data);
      if (!editingName.current) setDocumentName(data?.documentName ?? "");
    });
  }, [documentId]);

  const updateDocumentInfo = async (key, value) => {
    try {
      await updateDoc(doc(db, "workspaceDocuments", documentId), { [key]: value });
      toast("Document updated");
    } catch {
      toast.error("Could not update the document");
    }
  };

  const onNameBlur = () => {
    editingName.current = false;
    const name = documentName.trim();
    if (name && name !== documentInfo?.documentName) {
      updateDocumentInfo("documentName", name);
    } else if (!name) {
      setDocumentName(documentInfo?.documentName ?? "");
    }
  };

  return (
    <div>
      {/* Cover */}
      <CoverPicker setNewCover={(cover) => cover && updateDocumentInfo("coverImage", cover)}>
        <div className="relative cursor-pointer group">
          <h2 className="absolute inset-0 z-10 items-center justify-center hidden w-full h-full p-4 font-medium group-hover:flex">
            Change Cover
          </h2>
          <div className="group-hover:opacity-40">
            <Image
              src={coverImageSrc(documentInfo?.coverImage)}
              width={1200}
              height={400}
              priority
              className="w-full h-[140px] sm:h-[200px] object-cover"
              alt="Cover image"
            />
          </div>
        </div>
      </CoverPicker>

      {/* Emoji */}
      <div className="relative px-4 sm:px-10 md:px-16 lg:px-20">
        <div className="absolute -top-10 sm:-top-12">
          <EmojiPickerComponent setEmojiIcon={(emoji) => updateDocumentInfo("emoji", emoji)}>
            <div className="bg-[#ffffffb0] p-3 sm:p-4 rounded-md cursor-pointer">
              {documentInfo?.emoji ? (
                <span className="text-4xl sm:text-5xl">{documentInfo.emoji}</span>
              ) : (
                <SmilePlus className="w-8 h-8 text-gray-500 sm:w-10 sm:h-10" />
              )}
            </div>
          </EmojiPickerComponent>
        </div>
      </div>

      {/* Title */}
      <div className="px-4 pt-14 pb-6 sm:px-10 md:px-16 lg:px-20 sm:pt-16">
        <input
          type="text"
          aria-label="Document name"
          placeholder="Untitled Document"
          value={documentName}
          maxLength={120}
          onFocus={() => (editingName.current = true)}
          onChange={(e) => setDocumentName(e.target.value)}
          onBlur={onNameBlur}
          onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
          className="w-full text-2xl font-bold bg-transparent outline-none sm:text-4xl"
        />
      </div>
    </div>
  );
}

export default DocumentInfo;
