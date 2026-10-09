"use client";

import React, { useEffect } from "react";
import { doc, onSnapshot, runTransaction } from "firebase/firestore";
import { useUser } from "@clerk/nextjs";
import { db } from "@/config/firebaseConfig";
import { blocksEqual, hasLocalChanges, mergeBlocks, parseBlocks } from "@/lib/blockSync";

const SAVE_DELAY_MS = 500;

async function loadTools() {
  const [
    { default: Header },
    { default: Delimiter },
    { default: Alert },
    { default: List },
    { default: Checklist },
    { default: SimpleImage },
    { default: Table },
    { default: CodeTool },
    { default: Paragraph },
  ] = await Promise.all([
    import("@editorjs/header"),
    import("@editorjs/delimiter"),
    import("editorjs-alert"),
    import("@editorjs/list"),
    import("@editorjs/checklist"),
    import("simple-image-editorjs"),
    import("@editorjs/table"),
    import("@editorjs/code"),
    import("@editorjs/paragraph"),
  ]);

  return {
    header: Header,
    delimiter: Delimiter,
    paragraph: Paragraph,
    alert: {
      class: Alert,
      inlineToolbar: true,
      shortcut: "CMD+SHIFT+A",
      config: {
        alertTypes: ["primary", "secondary", "info", "success", "warning", "danger", "light", "dark"],
        defaultType: "primary",
        messagePlaceholder: "Enter something",
      },
    },
    table: Table,
    list: {
      class: List,
      inlineToolbar: true,
      shortcut: "CMD+SHIFT+L",
      config: { defaultStyle: "unordered" },
    },
    checklist: {
      class: Checklist,
      shortcut: "CMD+SHIFT+C",
      inlineToolbar: true,
    },
    image: SimpleImage,
    code: {
      class: CodeTool,
      shortcut: "CMD+SHIFT+P",
    },
  };
}

/**
 * Id of the block that holds the caret, or null when the editor is not focused.
 */
function getFocusedBlockId(holder) {
  if (!holder || !holder.contains(document.activeElement)) return null;
  const node = window.getSelection()?.anchorNode;
  const element = node?.nodeType === Node.ELEMENT_NODE ? node : node?.parentElement;
  const blockElement = element?.closest?.(".ce-block");
  return blockElement && holder.contains(blockElement) ? blockElement.dataset.id ?? null : null;
}

function indexOfBlock(api, id) {
  const index = api.getBlockIndex(id);
  return typeof index === "number" && index >= 0 ? index : -1;
}

/**
 * Brings the editor in line with `target` using block-level operations, so
 * the block being edited keeps its caret (and the mobile keyboard stays open).
 * Returns the ids of blocks that were left untouched because they are focused.
 */
async function reconcile(editor, target, { localById, baseIds, focusedId }) {
  const api = editor.blocks;
  const targetIds = new Set(target.map((b) => b.id));
  const skipped = new Set();

  // Remove blocks that were deleted remotely. Never remove the focused block
  // or new blocks that only exist locally (e.g. an empty line just added).
  for (let i = api.getBlocksCount() - 1; i >= 0; i--) {
    const id = api.getBlockByIndex(i)?.id;
    if (id && !targetIds.has(id) && baseIds.has(id) && id !== focusedId) {
      api.delete(i);
    }
  }

  let prevIndex = -1;
  for (const block of target) {
    try {
      const position = prevIndex + 1;
      let index = indexOfBlock(api, block.id);

      if (index === -1) {
        api.insert(block.type, block.data, undefined, position, false, false, block.id);
        prevIndex = position;
        continue;
      }

      const isFocused = block.id === focusedId;
      if (index !== position && !isFocused) {
        const to = index > position ? position : position - 1;
        api.move(to, index);
        index = to;
      }

      const current = localById.get(block.id);
      if (!current || !blocksEqual(current, block)) {
        if (isFocused) {
          skipped.add(block.id);
        } else if (current && current.type !== block.type) {
          api.delete(index);
          api.insert(block.type, block.data, undefined, index, false, false, block.id);
        } else {
          await api.update(block.id, block.data);
        }
      }
    } catch {
      // A block that cannot be applied (e.g. unknown tool) is skipped so the
      // rest of the document still updates.
    }
    const index = indexOfBlock(api, block.id);
    if (index !== -1) prevIndex = index;
  }

  return skipped;
}

function RichDocumentEditor({ documentId }) {
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress;
  const holderId = `editorjs-${documentId}`;

  useEffect(() => {
    if (!email || !documentId) return;

    const docRef = doc(db, "documentOutput", documentId);
    let editor = null;
    let unsubscribe = null;
    let saveTimer = null;
    let disposed = false;
    let loaded = false;
    let pendingRemote = false;
    // Blocks as last synced with the server (common ancestor for merges).
    let base = [];
    // Latest blocks received from the server.
    let remote = [];
    // Serialize saves and remote updates so they never interleave.
    let queue = Promise.resolve();
    const enqueue = (task) => {
      queue = queue.then(() => (disposed ? undefined : task())).catch(() => {});
      return queue;
    };

    const holder = () => document.getElementById(holderId);
    const readLocal = async () => (await editor.save()).blocks;

    /**
     * Merges the latest server state into the editor, block by block.
     */
    const applyRemote = async () => {
      const local = await readLocal();
      const target = mergeBlocks(base, local, remote);
      const localById = new Map(local.map((b) => [b.id, b]));
      const focusedId = getFocusedBlockId(holder());

      const skipped = await reconcile(editor, target, {
        localById,
        baseIds: new Set(base.map((b) => b.id)),
        focusedId,
      });

      // Skipped blocks still show their old content, so keep their old version
      // as the base; they are updated once the caret leaves them.
      base = remote.map((b) => (skipped.has(b.id) && localById.has(b.id) ? localById.get(b.id) : b));
      pendingRemote = skipped.size > 0;
    };

    /**
     * Saves local edits, merging them with concurrent edits from others.
     */
    const saveLocal = async () => {
      const local = await readLocal();
      if (!hasLocalChanges(base, local)) return;

      const merged = await runTransaction(db, async (transaction) => {
        const snap = await transaction.get(docRef);
        const serverBlocks = parseBlocks(snap.exists() ? snap.data()?.output : null);
        const blocks = mergeBlocks(base, local, serverBlocks);
        transaction.set(
          docRef,
          {
            docId: documentId,
            output: JSON.stringify({ time: Date.now(), blocks }),
            editedBy: email,
          },
          { merge: true }
        );
        return blocks;
      });

      remote = merged;
      await applyRemote();
    };

    const scheduleSave = () => {
      if (!loaded) return;
      clearTimeout(saveTimer);
      saveTimer = setTimeout(() => enqueue(saveLocal), SAVE_DELAY_MS);
    };

    // Apply remote changes that were held back while the caret was in a block.
    const onFocusOut = () => {
      if (pendingRemote) setTimeout(() => enqueue(applyRemote), 0);
    };

    (async () => {
      const [{ default: EditorJS }, tools] = await Promise.all([
        import("@editorjs/editorjs"),
        loadTools(),
      ]);
      if (disposed) return;

      editor = new EditorJS({
        holder: holderId,
        placeholder: "Start writing here...",
        tools,
        onChange: scheduleSave,
        onReady: () => {
          if (disposed) return;
          holder()?.addEventListener("focusout", onFocusOut);

          unsubscribe = onSnapshot(docRef, (snap) => {
            remote = parseBlocks(snap.exists() ? snap.data()?.output : null);

            if (!loaded) {
              // First load: render the saved document once.
              enqueue(async () => {
                if (remote.length) await editor.render({ blocks: remote });
                base = await readLocal();
                loaded = true;
              });
              return;
            }
            enqueue(applyRemote);
          }, () => {
            // No access or offline; the page shows the access state.
          });
        },
      });
    })();

    return () => {
      clearTimeout(saveTimer);
      unsubscribe?.();
      holder()?.removeEventListener("focusout", onFocusOut);
      const instance = editor;
      // Flush unsaved edits before tearing the editor down.
      const flush = loaded && instance ? queue.then(saveLocal).catch(() => {}) : queue;
      disposed = true;
      if (instance) {
        flush.then(() => instance.isReady).then(() => instance.destroy()).catch(() => {});
      }
    };
  }, [email, documentId, holderId]);

  return <div id={holderId} className="w-full min-h-[300px]" />;
}

export default RichDocumentEditor;
