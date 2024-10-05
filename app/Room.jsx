"use client";

import { ReactNode } from "react";
import {
  LiveblocksProvider,
  RoomProvider,
  ClientSideSuspense,
} from "@liveblocks/react/suspense";
import { collection, doc, getDocs, query, QuerySnapshot, where } from "firebase/firestore";
import { db } from "@/config/firebaseConfig";

export function Room({ params , children}) {
  console.log("Room jsx params->",params);
  console.log("Room jsx children->",children);
  return (
    <LiveblocksProvider 
    authEndpoint="/api/liveblocks-auth"
    resolveUsers={async ( { userIds }) => {
        console.log("Room jsx UserId's==>",userIds);
        const q=query(collection(db,'DocPlannerUsers'),where('email','in',userIds))
        const querySnapshot= await getDocs(q);
        const userList=[];
        querySnapshot.forEach((doc)=>{
            console.log(doc.data());
            userList.push(doc.data());
        })
        console.log("Before UserList-->",userList);
        return userList
      }}
      resolveMentionSuggestions={async ({ text, roomId }) => {
        // The text the user is searching for, e.g. "mar"
        const q=query(collection(db,'DocPlannerUsers'),where('email','!=',null))
        const querySnapshot= await getDocs(q);
        let userList=[];
        querySnapshot.forEach((doc)=>{
            console.log(doc.data());
            userList.push(doc.data());
        })
    
        if (text) {
            // Filter any way you'd like, e.g. checking if the name matches
            userList = userList.filter((user) => user.name.includes(text));
          }
        // Return a list of user IDs that match the query
        console.log("User List",userList);
        return userList.map((user) => user.email);
      }}
    >
      <RoomProvider id={params?.documentid}>
        <ClientSideSuspense fallback={<div>Loading…</div>}>
          {children}
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  );
}