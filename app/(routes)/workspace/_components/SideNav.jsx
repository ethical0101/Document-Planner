"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { ClientSideSuspense } from "@liveblocks/react/suspense";
import { collection, doc, onSnapshot, query, where } from "firebase/firestore";
import { ArrowLeft, Bell, Loader2Icon, Plus, X } from "lucide-react";
import { toast } from "sonner";
import Logo from "@/app/_components/Logo";
import { Button } from "@/components/ui/button";
import { db } from "@/config/firebaseConfig";
import { createDocument } from "@/lib/documents";
import { workspaceIdVariants } from "@/lib/workspace";
import DocumentList from "./DocumentList";
import NotificationBox from "./NotificationBox";

const MAX_DOCUMENTS = 50;

function SideNav({ workspaceId, onClose }) {
  const { documentid } = useParams();
  const { user } = useUser();
  const router = useRouter();
  const [documentList, setDocumentList] = useState([]);
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(false);

  // Live list of documents in this workspace.
  useEffect(() => {
    if (!workspaceId) return;
    const q = query(
      collection(db, "workspaceDocuments"),
      where("workspaceId", "in", workspaceIdVariants(workspaceId))
    );
    return onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map((d) => d.data());
      docs.sort((a, b) => (a.documentName ?? "").localeCompare(b.documentName ?? ""));
      setDocumentList(docs);
    });
  }, [workspaceId]);

  // Live workspace details (name, emoji).
  useEffect(() => {
    if (!workspaceId) return;
    return onSnapshot(doc(db, "Workspace", String(workspaceId)), (snap) => {
      setWorkspace(snap.exists() ? snap.data() : null);
    });
  }, [workspaceId]);

  const onCreateDocument = async () => {
    if (documentList.length >= MAX_DOCUMENTS) {
      toast.error(`A workspace can hold up to ${MAX_DOCUMENTS} documents.`);
      return;
    }
    setLoading(true);
    try {
      const docId = await createDocument({
        workspaceId,
        createdBy: user?.primaryEmailAddress?.emailAddress,
      });
      router.push(`/workspace/${workspaceId}/${docId}`);
    } catch (e) {
      toast.error("Could not create the document. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full p-5 overflow-y-auto shadow-md bg-blue-50">
      <div className="flex items-center justify-between gap-2">
        <Logo />
        <div className="flex items-center gap-1">
          <ClientSideSuspense fallback={<Bell className="w-5 h-5 text-gray-400" />}>
            <NotificationBox>
              <Bell className="w-5 h-5 text-gray-500" />
            </NotificationBox>
          </ClientSideSuspense>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-gray-500 rounded-md hover:bg-gray-200 md:hidden"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <hr className="my-5" />

      <Link
        href="/dashboard"
        className="flex items-center gap-2 mb-4 text-sm text-gray-600 hover:text-primary"
      >
        <ArrowLeft className="w-4 h-4" /> All workspaces
      </Link>

      <div className="flex items-center justify-between gap-2">
        <h2 className="font-medium truncate" title={workspace?.workspaceName}>
          {workspace?.emoji} {workspace?.workspaceName ?? "Workspace"}
        </h2>
        <Button size="sm" onClick={onCreateDocument} disabled={loading} aria-label="New document">
          {loading ? <Loader2Icon className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
        </Button>
      </div>

      <div className="flex-1 mt-2">
        <DocumentList
          documentList={documentList}
          workspaceId={workspaceId}
          activeDocumentId={documentid}
        />
      </div>

      <p className="mt-4 text-xs text-gray-500">
        {documentList.length} / {MAX_DOCUMENTS} documents
      </p>
    </div>
  );
}

export default SideNav;
