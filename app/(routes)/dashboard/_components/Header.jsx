"use client";

import React, { useEffect } from "react";
import { OrganizationSwitcher, UserButton, useUser } from "@clerk/nextjs";
import { doc, setDoc } from "firebase/firestore";
import Logo from "@/app/_components/Logo";
import { db } from "@/config/firebaseConfig";

function Header() {
  const { user } = useUser();

  // Keep a public profile (name, avatar, email) for @mentions and comments.
  useEffect(() => {
    const email = user?.primaryEmailAddress?.emailAddress;
    if (!email) return;
    setDoc(doc(db, "DocPlannerUsers", email), {
      name: user.fullName ?? email,
      avatar: user.imageUrl ?? null,
      email,
    }).catch(() => {});
  }, [user]);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-2 p-3 bg-white shadow-sm sm:px-6">
      <Logo />
      <div className="flex items-center min-w-0 gap-2 sm:gap-4">
        <div className="hidden min-w-0 sm:block">
          <OrganizationSwitcher
            afterLeaveOrganizationUrl="/dashboard"
            afterCreateOrganizationUrl="/dashboard"
            afterSelectOrganizationUrl="/dashboard"
            afterSelectPersonalUrl="/dashboard"
          />
        </div>
        <UserButton />
      </div>
    </header>
  );
}

export default Header;
