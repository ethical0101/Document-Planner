"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { OrganizationSwitcher, useAuth, useUser } from "@clerk/nextjs";
import { collection, getDocs, query, where } from "firebase/firestore";
import { AlignLeft, LayoutGrid, Loader2Icon, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { db } from "@/config/firebaseConfig";
import WorkspaceItemList from "./WorkspaceItemList";

function WorkspaceList() {
  const { user } = useUser();
  const { orgId } = useAuth();
  const [workspaceList, setWorkspaceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("grid");

  const owner = orgId ?? user?.primaryEmailAddress?.emailAddress;

  useEffect(() => {
    if (!owner) return;
    let cancelled = false;
    setLoading(true);
    getDocs(query(collection(db, "Workspace"), where("orgId", "==", owner)))
      .then((snapshot) => {
        if (cancelled) return;
        const list = snapshot.docs.map((d) => d.data());
        list.sort((a, b) => Number(b.id) - Number(a.id));
        setWorkspaceList(list);
      })
      .catch(() => !cancelled && setWorkspaceList([]))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [owner]);

  return (
    <div className="px-4 py-8 sm:px-10 md:px-16 lg:px-28 xl:px-40">
      {/* The organization switcher lives in the header on larger screens */}
      <div className="mb-6 sm:hidden">
        <OrganizationSwitcher
          afterLeaveOrganizationUrl="/dashboard"
          afterCreateOrganizationUrl="/dashboard"
          afterSelectOrganizationUrl="/dashboard"
          afterSelectPersonalUrl="/dashboard"
        />
      </div>

      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-bold sm:text-2xl">
          Hello, {user?.firstName ?? user?.fullName ?? "there"}
        </h2>
        <Link href="/createworkspace">
          <Button aria-label="Create workspace">
            <Plus className="w-4 h-4 sm:mr-1" />
            <span className="hidden sm:inline">New Workspace</span>
          </Button>
        </Link>
      </div>

      <div className="flex items-center justify-between mt-10">
        <h2 className="font-medium text-primary">Workspaces</h2>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setView("grid")}
            aria-label="Grid view"
            aria-pressed={view === "grid"}
            className={`p-1.5 rounded-md ${view === "grid" ? "bg-gray-200" : "hover:bg-gray-100"}`}
          >
            <LayoutGrid className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => setView("list")}
            aria-label="List view"
            aria-pressed={view === "list"}
            className={`p-1.5 rounded-md ${view === "list" ? "bg-gray-200" : "hover:bg-gray-100"}`}
          >
            <AlignLeft className="w-5 h-5" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center my-16">
          <Loader2Icon className="w-6 h-6 text-gray-400 animate-spin" />
        </div>
      ) : workspaceList.length === 0 ? (
        <div className="flex flex-col items-center justify-center my-10 text-center">
          <Image src="/Assets/workspace.jpg" width={200} height={200} alt="Workspace" />
          <h2>Create a new workspace</h2>
          <Link href="/createworkspace">
            <Button className="my-3">+ New Workspace</Button>
          </Link>
        </div>
      ) : (
        <WorkspaceItemList workspaceList={workspaceList} view={view} />
      )}
    </div>
  );
}

export default WorkspaceList;
