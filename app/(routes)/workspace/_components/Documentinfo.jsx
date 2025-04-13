"use client";

import CoverPicker from "@/app/_components/CoverPicker";
import EmojiPickerComponents from "@/app/_components/EmojiPickerComponents";
import { db } from "@/config/firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { SmilePlus } from "lucide-react";
import Image from "next/image";
import React, { useState, useEffect } from "react";

function DocumentInfo({ documentid }) {
  const [coverImage, setCoverImage] = useState(
    "/Assets/coverImages/cover1.jpg"
  );
  const [documentInfo, setDocumentInfo] = useState(null);
  const [emoji, setEmoji] = useState();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  useEffect(() => {
    if (documentid) {
      GetDocumentInfo();
    }
  }, [documentid]);

  const GetDocumentInfo = async () => {
    const docRef = doc(db, "workspacedocuments", documentid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const docData = docSnap.data();
      console.log(docData);
      setDocumentInfo(docData);
      setEmoji(docData?.Emoji);
      setCoverImage(docData?.coverImage || coverImage);
    }
  };

  const updateDocumentInfo = async(key, value) => { 
    const docRef=doc(db, "workspacedocuments",documentid);
    await updateDoc(docRef,{
        [key]:value,
    })
  }
  
  return (
    <div>
      <CoverPicker setNewCover={(url) => {setCoverImage(url);
        updateDocumentInfo("coverImage",url);
      }
      }>
        <div className="relative cursor-pointer group">
          <h2 className="absolute items-center justify-center hidden w-full h-full p-4 group-hover:flex">
            Change Cover
          </h2>
          <div className="group-hover:opacity-70">
            <Image
              src={coverImage}
              alt={"Cover Image"}
              width={400}
              height={400}
              className="w-full h-[200px] object-cover rounded-t-xl"
            />
          </div>
        </div>
      </CoverPicker>
      <div className="absolute ml-10 mt-[-40px] cursor-pointer">
        <EmojiPickerComponents
          showPicker={showEmojiPicker}
          setEmoji={(emoji) => {
            setEmoji(emoji);
            setShowEmojiPicker(false);
            updateDocumentInfo("Emoji",emoji);
          }}
        >
          <div
            className="bg-[#ffffffb0] p-4 rounded-md"
            onClick={() => {
              setShowEmojiPicker(!showEmojiPicker);
            }}
          >
            {emoji ? (
              <h3 className="text-5xl">{emoji}</h3>
            ) : (
              <SmilePlus className="w-10 h-10 text-gray-500" />
            )}
          </div>
        </EmojiPickerComponents>
      </div>
      <div className="p-10 mt-10">
        <input
          type="text"
          placeholder="Untitled Document"
          defaultValue={documentInfo?.documentName || ""}
          className="text-4xl font-bold outline-none"
          onChange={(e)=>{updateDocumentInfo("documentName",e.target.value);}}
        />
      </div>
    </div>
  );
}

export default DocumentInfo;
