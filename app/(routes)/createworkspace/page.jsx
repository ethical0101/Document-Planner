"use client";

import React, { useState, useEffect } from "react";
import CoverPicker from "@/app/_components/CoverPicker";
import EmojiPickerComponents from "@/app/_components/EmojiPickerComponents";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUser, useOrganization } from "@clerk/nextjs";
import { Loader2Icon, SmilePlus } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import uuid4 from "uuid4";

export const dynamic = "force-dynamic"; // Ensures this runs dynamically

const CreateWorkspace = () => {
  const [coverImage, setCoverImage] = useState("/Assets/coverImages/cover3.jpg");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [workSpaceName, setWorkspaceName] = useState("");
  const [Emoji, setEmoji] = useState();
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { user } = useUser();
  const { organization } = useOrganization();
  const orgId = organization ? organization.id : null;

  // Lazy-load Firebase only on the client
  const [db, setDb] = useState(null);
  useEffect(() => {
    import("@/config/firebaseConfig").then((firebase) => {
      setDb(firebase.db);
    });
  }, []);

  // Prevent build-time errors by waiting for Firebase and user data
  if (!user || !db) return null;

  const onCreateWorkspace = async () => {
    setLoading(true);
    try {
      const workspaceId = Date.now().toString();
      const createdBy = user?.primaryEmailAddress?.emailAddress;

      const { doc, setDoc } = await import("firebase/firestore");

      // Firestore: Create workspace document
      await setDoc(doc(db, "workspace", workspaceId), {
        workSpaceName,
        coverImage,
        Emoji,
        createdBy,
        id: workspaceId,
        orgId: orgId || createdBy,
      });

      // Generate document ID
      const docId = uuid4();

      // Firestore: Create workspace document entry
      await setDoc(doc(db, "workspacedocuments", docId), {
        workspaceId,
        createdBy,
        coverImage: null,
        Emoji: null,
        id: docId,
        documentName: "Untitled Document",
        documentOutput: [],
      });

      // Firestore: Initialize document output
      await setDoc(doc(db, "documentOutput", docId), {
        docId,
        output: [],
      });

      // Redirect to the new workspace
      router.replace(`/workspace/${workspaceId}/${docId}`);
    } catch (error) {
      console.error("Error creating workspace:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10 py-28 md:px-36 lg:px-64 xl:px-96">
      <div className="shadow-2xl rounded-xl">
        <CoverPicker setNewCover={(url) => setCoverImage(url)}>
          <div className="relative cursor-pointer group">
            <h2 className="absolute items-center justify-center hidden w-full h-full p-4 group-hover:flex">
              Change Cover
            </h2>
            <div className="group-hover:opacity-70">
              <Image
                src={coverImage}
                alt="CoverImage"
                width={400}
                height={400}
                className="w-full h-[150px] object-cover rounded-t-xl"
              />
            </div>
          </div>
        </CoverPicker>
        <div className="p-12">
          <h2 className="text-xl font-medium">Create a new workspace</h2>
          <h2 className="mt-2 text-sm">
            This is a shared workspace where you can rename it later.
          </h2>
          <div className="flex items-center gap-2 mt-8">
            <EmojiPickerComponents showPicker={showEmojiPicker} setEmoji={(emoji) => {
              setEmoji(emoji);
              setShowEmojiPicker(false);
            }}>
              <Button variant="outline" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                {Emoji ? <h3 className="text-2xl">{Emoji}</h3> : <SmilePlus />}
              </Button>
            </EmojiPickerComponents>
            <Input
              placeholder="Workspace Name"
              onChange={(e) => setWorkspaceName(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2 mt-10">
            <Button disabled={!workSpaceName?.length || loading} onClick={onCreateWorkspace}>
              Create {loading && <Loader2Icon className="animate-spin" />}
            </Button>
            <Button variant="outline">Cancel</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateWorkspace;
