"use client";
import Logo from "@/app/_components/Logo";
import { db } from "@/config/firebaseConfig";
import {
  OrganizationSwitcher,
  useAuth,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import { doc, setDoc } from "firebase/firestore";
import React, { useEffect } from "react";




const Header = () => {
  const { orgId } = useAuth();
  const { user } = useUser();

  console.log(orgId);
  const docId = user?.primaryEmailAddress?.emailAddress;

  useEffect(()=>{
    user && saveUserData();  
  },[user])
  
  const saveUserData = async () => {
    try {
      await setDoc(doc(db, "DocPlannerUsers", docId), {
        name: user?.fullName,
        avatar: user?.imageUrl,
        email: user?.primaryEmailAddress?.emailAddress,
      });
    } catch (e) {
      
    }
  };

  return (
    <div className="flex items-center justify-between px-5 py-3 shadow-sm">
      <Logo />

      <OrganizationSwitcher
        afterCreateOrganizationUrl={"/dashboard"}
        afterLeaveOrganizationUrl={"/dashboard"}
      />
      <UserButton />
    </div>
  );
};

export default Header;
