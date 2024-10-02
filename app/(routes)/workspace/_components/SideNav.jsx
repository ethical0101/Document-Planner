

import Logo from "@/app/_components/Logo";
import { Button } from "@/components/ui/button";
import { db } from "@/config/firebaseConfig";
import { onSnapshot, QuerySnapshot, collection, where, query} from "firebase/firestore";
import { Bell } from "lucide-react";
import React, { useEffect } from "react";

const SideNav = (params) => {
    params = params.params.params;

    useEffect(()=>{
        params&&GetDocumentList();
    },[params]);

    const GetDocumentList=()=>{
        const q=query(collection(db, 'workspacedocuments'),
            where('workspaceId','==',Number(params?.workspaceid)));

        const unsubscribe = onSnapshot(q, (QuerySnapshot)=>{
            QuerySnapshot.forEach((doc)=>{
                console.log(doc.data());
            })
        })
    }


    
  return (
    <div className="fixed hidden h-screen p-5 shadow-md md:w-72 md:block bg-blue-50">
      <div className="flex items-center justify-between">
        <Logo />
        <Bell className="w-5 h-5 text-gray-500" />
      </div>
      <hr className="my-5"></hr>
      <div>
        <div className="flex items-center justify-between">
          <h2 className="font-medium">Workspace Name</h2>
          <Button size="sm">+</Button>
        </div>
      </div>
    </div>
  );
};

export default SideNav;
