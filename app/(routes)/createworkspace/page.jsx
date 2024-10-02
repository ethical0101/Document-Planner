"use client";

import CoverPicker from "@/app/_components/CoverPicker";
import EmojiPickerComponents from "@/app/_components/EmojiPickerComponents";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SmilePlus } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";

const CreateWorkspace = () => {
  const [coverImage, setCoverImage] = useState(
    "/Assets/coverImages/cover3.jpg"
  );
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [workSpaceName, setWorkspaceName] = useState("");
  const [Emoji, setEmoji] = useState();
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
                alt={"CoverImage"}
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
            This is a shared workspace where You can rename it later.
          </h2>
          <div className="flex items-center gap-2 mt-8">
            <EmojiPickerComponents showPicker={showEmojiPicker} setEmoji={(emoji)=>setEmoji(emoji)}>
              <Button variant="outline" onClick={()=>{setShowEmojiPicker(!showEmojiPicker)}}>
                {Emoji?
                <h3 className="text-2xl">
                    {Emoji}
                </h3>:<SmilePlus />}
              </Button>
            </EmojiPickerComponents>
            <Input
              placeholder="Workspace Name"
              onChange={(e) => setWorkspaceName(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2 mt-10">
            <Button disabled={!workSpaceName?.length}>Create</Button>
            <Button variant="outline">Cancel</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateWorkspace;
