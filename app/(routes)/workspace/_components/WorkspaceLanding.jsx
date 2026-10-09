"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { collection, getDocs, limit, query, where } from "firebase/firestore";
import { FilePlus, Loader2Icon, Menu } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { db } from "@/config/firebaseConfig";
import { createDocument } from "@/lib/documents";
import { workspaceIdVariants } from "@/lib/workspace";
import { useSidebar } from "./WorkspaceShell";

/**
 * Shown at /workspace/[id]: opens the first document, or offers to create one
 * when the workspace is empty.
 */
function WorkspaceLanding({ workspaceId }) {
  const router = useRouter();
  const { user } = useUser();
  const { setOpen } = useSidebar();
  const [empty, setEmpty] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const snap = await getDocs(
        query(
          collection(db, "workspaceDocuments"),
          where("workspaceId", "in", workspaceIdVariants(workspaceId)),
          limit(1)
        )
      );
      if (cancelled) return;
      if (snap.empty) setEmpty(true);
      else router.replace(`/workspace/${workspaceId}/${snap.docs[0].id}`);
    })();
    return () => {
      cancelled = true;
    };
  }, [workspaceId, router]);

  const onCreate = async () => {
    setCreating(true);
    try {
      const docId = await createDocument({
        workspaceId,
        createdBy: user?.primaryEmailAddress?.emailAddress,
      });
      router.replace(`/workspace/${workspaceId}/${docId}`);
    } catch {
      toast.error("Could not create the document");
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="p-3 md:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="p-2 rounded-md hover:bg-gray-100"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>
      <div className="flex flex-col items-center justify-center gap-4 px-6 text-center min-h-[70vh]">
        {empty ? (
          <>
            <FilePlus className="w-12 h-12 text-primary" />
            <h2 className="text-xl font-semibold">This workspace has no documents yet</h2>
            <p className="text-gray-500">Create your first document to start collaborating.</p>
            <Button onClick={onCreate} disabled={creating}>
              {creating && <Loader2Icon className="w-4 h-4 mr-2 animate-spin" />} New document
            </Button>
          </>
        ) : (
          <Loader2Icon className="w-6 h-6 text-gray-400 animate-spin" />
        )}
      </div>
    </div>
  );
}

export default WorkspaceLanding;
