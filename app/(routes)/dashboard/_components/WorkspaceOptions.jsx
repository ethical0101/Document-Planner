"use client";

import React, { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { Loader2Icon, MoreVertical, PenBox, Trash2 } from "lucide-react";
import { toast } from "sonner";
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
import { db } from "@/config/firebaseConfig";
import { deleteWorkspace } from "@/lib/documents";

/**
 * Rename / delete menu for a workspace card.
 */
function WorkspaceOptions({ workspace, onRenamed, onDeleted, className = "" }) {
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [name, setName] = useState(workspace.workspaceName ?? "");
  const [busy, setBusy] = useState(false);

  const onRename = async (e) => {
    e.preventDefault();
    const workspaceName = name.trim();
    if (!workspaceName) return;
    setBusy(true);
    try {
      await updateDoc(doc(db, "Workspace", String(workspace.id)), { workspaceName });
      onRenamed?.(workspaceName);
      toast("Workspace renamed");
      setRenameOpen(false);
    } catch {
      toast.error("Could not rename the workspace");
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async () => {
    setBusy(true);
    try {
      await deleteWorkspace(workspace.id);
      toast("Workspace deleted");
      setDeleteOpen(false);
      onDeleted?.();
    } catch {
      toast.error("Could not delete the workspace");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
      className={className}
    >
      <DropdownMenu>
        <DropdownMenuTrigger
          className="p-1.5 rounded-md bg-white/80 hover:bg-white shadow-sm"
          aria-label={`Options for ${workspace.workspaceName}`}
        >
          <MoreVertical className="w-4 h-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            className="flex gap-2"
            onClick={() => {
              setName(workspace.workspaceName ?? "");
              setRenameOpen(true);
            }}
          >
            <PenBox className="w-4 h-4" /> Rename
          </DropdownMenuItem>
          <DropdownMenuItem className="flex gap-2 text-red-500" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="w-4 h-4" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent>
          <form onSubmit={onRename} className="grid gap-4">
            <DialogHeader>
              <DialogTitle>Rename workspace</DialogTitle>
              <DialogDescription>Give this workspace a new name.</DialogDescription>
            </DialogHeader>
            <Input
              autoFocus
              value={name}
              maxLength={80}
              onChange={(e) => setName(e.target.value)}
              placeholder="Workspace name"
            />
            <DialogFooter className="gap-2">
              <Button type="button" variant="secondary" onClick={() => setRenameOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!name.trim() || busy}>
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={(open) => !busy && setDeleteOpen(open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete workspace?</DialogTitle>
            <DialogDescription>
              &quot;{workspace.workspaceName}&quot; and all of its documents will be permanently
              deleted. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="secondary"
              disabled={busy}
              onClick={() => setDeleteOpen(false)}
            >
              Cancel
            </Button>
            <Button type="button" variant="destructive" disabled={busy} onClick={onDelete}>
              {busy && <Loader2Icon className="w-4 h-4 mr-2 animate-spin" />} Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default WorkspaceOptions;
