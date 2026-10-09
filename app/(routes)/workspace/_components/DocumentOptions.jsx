"use client";

import React, { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { Link2Icon, MoreVertical, PenBox, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { db } from "@/config/firebaseConfig";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export async function copyDocumentLink(workspaceId, documentId) {
  const url = `${window.location.origin}/workspace/${workspaceId}/${documentId}`;
  try {
    await navigator.clipboard.writeText(url);
    toast("Link copied to clipboard");
  } catch {
    toast.error("Could not copy the link");
  }
}

function DocumentOptions({ document, workspaceId, onDelete }) {
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [name, setName] = useState(document?.documentName ?? "");

  const onRename = async (e) => {
    e.preventDefault();
    const documentName = name.trim();
    if (!documentName) return;
    try {
      await updateDoc(doc(db, "workspaceDocuments", document.id), { documentName });
      toast("Document renamed");
      setRenameOpen(false);
    } catch {
      toast.error("Could not rename the document");
    }
  };

  return (
    // Keep clicks inside the menu and dialogs from opening the document.
    <div onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
      <DropdownMenu>
        <DropdownMenuTrigger
          className="p-1 rounded-md hover:bg-gray-300"
          aria-label="Document options"
        >
          <MoreVertical className="w-4 h-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            className="flex gap-2"
            onClick={() => copyDocumentLink(workspaceId, document.id)}
          >
            <Link2Icon className="w-4 h-4" /> Share Link
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex gap-2"
            onClick={() => {
              setName(document?.documentName ?? "");
              setRenameOpen(true);
            }}
          >
            <PenBox className="w-4 h-4" /> Rename
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex gap-2 text-red-500"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="w-4 h-4" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent>
          <form onSubmit={onRename} className="grid gap-4">
            <DialogHeader>
              <DialogTitle>Rename document</DialogTitle>
              <DialogDescription>Give this document a new name.</DialogDescription>
            </DialogHeader>
            <Input
              autoFocus
              value={name}
              maxLength={120}
              onChange={(e) => setName(e.target.value)}
              placeholder="Document name"
            />
            <DialogFooter className="gap-2">
              <Button type="button" variant="secondary" onClick={() => setRenameOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!name.trim()}>
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete document?</DialogTitle>
            <DialogDescription>
              &quot;{document?.documentName || "Untitled Document"}&quot; and its content will be
              permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button type="button" variant="secondary" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                setDeleteOpen(false);
                onDelete();
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default DocumentOptions;
