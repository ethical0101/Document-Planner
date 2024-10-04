

import Logo from "@/app/_components/Logo";
import { Button } from "@/components/ui/button";
import { db } from "@/config/firebaseConfig";
import { onSnapshot, collection, where, query, setDoc, doc} from "firebase/firestore";
import { Bell, Loader2Icon } from "lucide-react";
import React, { useEffect, useState } from "react";
import DocumentList from "./DocumentList";
import uuid4 from "uuid4";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

const SideNav = ({params}) => {
    console.log(params);

    const [documentList, setDocumentList] = useState([]);
    const {user} = useUser();
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    
    useEffect(()=>{
        params&&GetDocumentList();
    },[params]);

    const GetDocumentList=()=>{
      // const workId = (params)=>(params?.workspaceid)?params?.workspaceid:params.params?.workspaceid
        const q=query(collection(db, 'workspacedocuments'),
            where('workspaceId','==',params.workspaceid));
            
        const unsubscribe = onSnapshot(q, (querySnapshot)=>{
          setDocumentList([]);
            querySnapshot.forEach((doc)=>{
                setDocumentList(documentList=>[...documentList,doc.data()]);
            })
        })
    }

    const CreateNewDocument = async () => {
      setLoading(true);
      const docId = uuid4();
      
      // Check if params are defined and log the value
      console.log("Creating document with workspace ID:", params?.workspaceid);
    
      // Ensure workspaceId is accessed correctly
      await setDoc(doc(db, "workspacedocuments", docId.toString()), {
        workspaceId: params?.workspaceid,  // Use workspaceid consistently
        createdBy: user?.primaryEmailAddress?.emailAddress,
        coverImage: null,
        Emoji: null,
        id: docId,
        documentName: "Untitled Document",
        documentOutput: []
      });
      
      await setDoc(doc(db, "documentOutput",docId.toString()),{
        docId:docId,
        output:[]
      });
        
      // Ensure to use workspaceid here too
      router.replace('/workspace/' + params?.workspaceid + "/" + docId);
      setLoading(false);
    };
    
    
  return (
    <div className="h-screen p-5 shadow-md fixedhidden md:w-72 md:block bg-blue-50">
      <div className="flex items-center justify-between">
        <Logo />
        <Bell className="w-5 h-5 text-gray-500" />
      </div>
      <hr className="my-5"></hr>
      <div>
        <div className="flex items-center justify-between">
          <h2 className="font-medium">Workspace Name</h2>
          <Button size="sm" onClick={CreateNewDocument}>
          {loading?(<Loader2Icon className="w-4 h-4 animate-spin"/>)
            :'+'
          }
          </Button>
        </div>
      </div>
      <DocumentList documentList={documentList} 
      params={params}/>
    </div>
  );
};

export default SideNav;
