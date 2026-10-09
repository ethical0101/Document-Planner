"use client";

import React, { useEffect } from "react";
import { OrganizationSwitcher, UserButton, useUser } from "@clerk/nextjs";
import { ClientSideSuspense } from "@liveblocks/react/suspense";
import { doc, setDoc } from "firebase/firestore";
import { Bell } from "lucide-react";
import Logo from "@/app/_components/Logo";
import NotificationBox from "@/app/_components/NotificationBox";
import { LiveblocksClientProvider } from "@/app/Room";
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
        <LiveblocksClientProvider>
          <ClientSideSuspense fallback={<Bell className="w-5 h-5 text-gray-400" />}>
            <NotificationBox />
          </ClientSideSuspense>
        </LiveblocksClientProvider>
        <UserButton />
      </div>
    </header>
  );
}

export default Header;
