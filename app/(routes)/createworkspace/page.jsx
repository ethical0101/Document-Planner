"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import { doc, writeBatch } from "firebase/firestore";
import { Loader2Icon, SmilePlus } from "lucide-react";
import { toast } from "sonner";
import CoverPicker from "@/app/_components/CoverPicker";
import EmojiPickerComponent from "@/app/_components/EmojiPickerComponent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { db } from "@/config/firebaseConfig";

function CreateWorkspace() {
  const [coverImage, setCoverImage] = useState("/Assets/coverImages/cover3.jpg");
  const [workspaceName, setWorkspaceName] = useState("");
  const [emoji, setEmoji] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const { orgId } = useAuth();
  const router = useRouter();

  /**
   * Creates the workspace together with its first document.
   */
  const onCreateWorkspace = async (e) => {
    e?.preventDefault();
    const name = workspaceName.trim();
    const email = user?.primaryEmailAddress?.emailAddress;
    if (!name || !email) return;

    setLoading(true);
    try {
      const workspaceId = String(Date.now());
      const docId = crypto.randomUUID();
      const batch = writeBatch(db);

      batch.set(doc(db, "Workspace", workspaceId), {
        workspaceName: name,
        emoji,
        coverImage,
        createdBy: email,
        id: workspaceId,
        orgId: orgId ?? email,
      });
      batch.set(doc(db, "workspaceDocuments", docId), {
        workspaceId,
        createdBy: email,
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
      router.replace(`/workspace/${workspaceId}/${docId}`);
    } catch {
      toast.error("Could not create the workspace. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="flex items-start justify-center min-h-screen px-4 py-10 sm:items-center sm:py-16">
      <div className="w-full max-w-2xl overflow-hidden bg-white shadow-2xl rounded-xl">
        {/* Cover image */}
        <CoverPicker setNewCover={(url) => url && setCoverImage(url)}>
          <div className="relative cursor-pointer group">
            <h2 className="absolute inset-0 z-10 items-center justify-center hidden w-full h-full p-4 font-medium group-hover:flex">
              Change Cover
            </h2>
            <div className="group-hover:opacity-70">
              <Image
                src={coverImage}
                alt="Cover image"
                width={800}
                height={300}
                priority
                className="w-full h-[150px] object-cover"
              />
            </div>
          </div>
        </CoverPicker>

        {/* Form */}
        <form onSubmit={onCreateWorkspace} className="p-6 sm:p-12">
          <h2 className="text-xl font-medium">Create a new workspace</h2>
          <p className="mt-2 text-sm text-gray-600">
            This is a shared space where you can collaborate with your team. You can always rename
            it later.
          </p>
          <div className="flex items-center gap-2 mt-8">
            <EmojiPickerComponent setEmojiIcon={(v) => setEmoji(v)}>
              <Button type="button" variant="outline" aria-label="Pick an emoji">
                {emoji ? emoji : <SmilePlus />}
              </Button>
            </EmojiPickerComponent>
            <Input
              placeholder="Workspace Name"
              value={workspaceName}
              maxLength={80}
              onChange={(e) => setWorkspaceName(e.target.value)}
            />
          </div>
          <div className="flex flex-col-reverse justify-end gap-3 mt-7 sm:flex-row sm:gap-6">
            <Link href="/dashboard">
              <Button type="button" variant="outline" className="w-full sm:w-auto">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={!workspaceName.trim() || loading}>
              Create {loading && <Loader2Icon className="w-4 h-4 ml-2 animate-spin" />}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateWorkspace;
