"use client"

import CoverPicker from '@/app/_components/CoverPicker'
import EmojiPickerComponent from '@/app/_components/EmojiPickerComponent';
import { db } from '@/config/firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

import { SmilePlus } from 'lucide-react';
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner';

function DocumentInfo({params}) {
    const [coverImage,setCoverImage]=useState('/cover3.jpg');
    const [emoji,setEmoji]=useState();
    const [documentInfo,setDocumentInfo]=useState();
    useEffect(()=>{
        params&&GetDocumentInfo();
    },[params])

    /**
     * Used to get document info
     */
    const GetDocumentInfo=async()=>{
        const docRef=doc(db,'workspaceDocuments',params?.documentid);
        const docSnap=await getDoc(docRef);

        if(docSnap.exists())
        {
            console.log(docSnap.data())
            setDocumentInfo(docSnap.data())
            setEmoji(docSnap.data()?.emoji);
            docSnap.data()?.coverImage&&setCoverImage(docSnap.data()?.coverImage)
        }
    }

    const updateDocumentInfo=async(key,value)=>{
        const docRef=doc(db,'workspaceDocuments',params?.documentid);
        await updateDoc(docRef,{
            [key]:value
        })
        toast('Document Updated!')
    }


  return (
    <div>
        {/* Cover  */}
        <CoverPicker setNewCover={(cover)=>{
            setCoverImage(cover);
            updateDocumentInfo('coverImage',cover)
            }}>
        <div className='relative cursor-pointer group'>
                    <h2 className='absolute items-center justify-center hidden w-full h-full p-4 group-hover:flex '>Change Cover</h2>
                    <div className='group-hover:opacity-40'>
                        <Image src={coverImage.startsWith('/Assets/coverImages/') ? coverImage : `/Assets/coverImages/${coverImage.replace(/^.*[\\\/]/, '')}`}
                        width={400} height={400}
                        className='w-full h-[200px] object-cover '
                        alt='Cover Image'
                        />
                    </div>
                </div>
        </CoverPicker>
        {/* Emoji Picker  */}
        <div className='absolute ml-10 px-20 mt-[-40px] cursor-pointer'>
            <EmojiPickerComponent
            setEmojiIcon={(emoji)=>{
                setEmoji(emoji);
                updateDocumentInfo('emoji',emoji)
                }}>
            <div className='bg-[#ffffffb0] p-4 rounded-md'>
                {emoji?<span className='text-5xl'>{emoji}</span>: <SmilePlus className='w-10 h-10 text-gray-500'/>}
            </div>
            </EmojiPickerComponent>
        </div>
        {/* File Name  */}
        <div className='p-10 px-20 mt-10 ml-10'>
            <input type="text"
            placeholder='Untitled Document'
            defaultValue={documentInfo?.documentName}
            className='text-4xl font-bold outline-none'
            onBlur={(event)=>updateDocumentInfo('documentName',event.target.value)}
            />
        </div>
    </div>
  )
}

export default DocumentInfo
