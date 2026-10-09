"use client";

import React from "react";
import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import { Menu, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { copyDocumentLink } from "./DocumentOptions";
import { useSidebar } from "./WorkspaceShell";

function DocumentHeader({ workspaceId, documentId }) {
  const { setOpen } = useSidebar();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-2 p-3 bg-white shadow-md sm:px-7">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="p-2 -ml-1 rounded-md hover:bg-gray-100 md:hidden"
        aria-label="Open sidebar"
      >
        <Menu className="w-5 h-5" />
      </button>
      <div className="hidden md:block" />

      <div className="min-w-0 overflow-hidden">
        <OrganizationSwitcher
          afterLeaveOrganizationUrl="/dashboard"
          afterCreateOrganizationUrl="/dashboard"
          afterSelectOrganizationUrl="/dashboard"
          afterSelectPersonalUrl="/dashboard"
        />
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Button
          size="sm"
          onClick={() => copyDocumentLink(workspaceId, documentId)}
          aria-label="Copy share link"
        >
          <Share2 className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:inline">Share</span>
        </Button>
        <UserButton />
      </div>
    </header>
  );
}

export default DocumentHeader;
