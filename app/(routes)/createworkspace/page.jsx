"use client"
import CoverPicker from '@/app/_components/CoverPicker';
import EmojiPickerComponent from '@/app/_components/EmojiPickerComponent';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { db } from '@/config/firebaseConfig';
import { useAuth, useUser } from '@clerk/nextjs';
import { doc, setDoc } from 'firebase/firestore';
import { Loader2Icon, SmilePlus } from 'lucide-react';
import Image from 'next/image'
import { useRouter } from 'next/navigation';
import React, { useState } from 'react'
import uuid4 from 'uuid4';

function CreateWorkspace() {

    const [coverImage, setCoverImage] = useState("/Assets/coverImages/cover3.jpg");
    const [workspaceName,setWorkspaceName]=useState();
    const [emoji,setEmoji]=useState();
    const {user}=useUser();
    const {orgId}=useAuth();
    const [loading,setLoading]=useState(false);
    const router=useRouter();

    /**
     * Used to create new workspace and save data in database
     */
    const OnCreateWorkspace=async()=>{
        setLoading(true);
        const workspaceId=Date.now();
        const result=await setDoc(doc(db,'Workspace',workspaceId.toString()),{
            workspaceName:workspaceName,
            emoji:emoji,
            coverImage:coverImage,
            createdBy:user?.primaryEmailAddress?.emailAddress,
            id:workspaceId,
            orgId:orgId?orgId:user?.primaryEmailAddress?.emailAddress
        });

        const docId=uuid4();
        await setDoc(doc(db,'workspaceDocuments',docId.toString()),{
            workspaceId:workspaceId,
            createdBy:user?.primaryEmailAddress?.emailAddress,
            coverImage:null,
            emoji:null,
            id:docId,
            documentName:'Untitled Document',
            documentOutput:[]
        })

        await setDoc(doc(db,'documentOutput',docId.toString()),{
            docId:docId,
            output:[]
        })

        setLoading(false);
        router.replace('/workspace/'+workspaceId+"/"+docId);

    }
  return (
    <div className='p-10 md:px-36 lg:px-64 xl:px-96 py-28'>
        <div className='shadow-2xl rounded-xl'>
            {/* Cover Image  */}
            {/* <CoverPicker setNewCover={(v)=>setCoverImage(v)}>
                <div className='relative cursor-pointer group'>
                    <h2 className='absolute items-center justify-center hidden w-full h-full p-4 group-hover:flex '>Change Cover</h2>
                    <div className='group-hover:opacity-40'>
                        <Image src={coverImage.startsWith('/Assets/coverImages/') ? coverImage : `/Assets/coverImages/${coverImage.replace(/^.*[\\\/]/, '')}`}
                            width={400} height={400}
                            className='w-full h-[180px] object-cover rounded-t-xl'
                            alt='Cover Image'
                        />
                    </div>
                </div>
            </CoverPicker> */}
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

            {/* Input Section  */}
            <div className='p-12'>
                <h2 className='text-xl font-medium'>Create a new workspace</h2>
                <h2 className='mt-2 text-sm'>This is a shared space where you can collaborate wth your team.
                    You can always rename it later.
                </h2>
                <div className='flex items-center gap-2 mt-8'>
                    <EmojiPickerComponent setEmojiIcon={(v)=>setEmoji(v)}>
                        <Button variant="outline">
                           {emoji?emoji: <SmilePlus/>}
                        </Button>
                    </EmojiPickerComponent>
                    <Input placeholder="Workspace Name"
                    onChange={(e)=>setWorkspaceName(e.target.value)}
                    />
                </div>
                <div className='flex justify-end gap-6 mt-7'>
                    <Button disabled={!workspaceName?.length||loading}
                    onClick={OnCreateWorkspace}
                    >Create {loading&&<Loader2Icon className='ml-2 animate-spin' />} </Button>
                    <Button variant="outline">Cancel</Button>

                </div>
            </div>

        </div>
    </div>
  )
}

export default CreateWorkspace
