"use client";

import React, { useEffect } from "react";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { useUser } from "@clerk/nextjs";
import { db } from "@/config/firebaseConfig";

const SAVE_DELAY_MS = 600;

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

function parseOutput(output) {
  if (!output || typeof output !== "string") return null;
  try {
    const data = JSON.parse(output);
    return Array.isArray(data?.blocks) ? data : null;
  } catch {
    return null;
  }
}

function RichDocumentEditor({ documentId }) {
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress;
  const holderId = `editorjs-${documentId}`;

  useEffect(() => {
    if (!email || !documentId) return;

    let editor = null;
    let unsubscribe = null;
    let saveTimer = null;
    let disposed = false;
    let initialised = false;
    const docRef = doc(db, "documentOutput", documentId);

    // Debounced save so every keystroke does not hit Firestore.
    const save = () => {
      clearTimeout(saveTimer);
      saveTimer = setTimeout(async () => {
        if (!editor || disposed) return;
        try {
          const outputData = await editor.save();
          await updateDoc(docRef, {
            output: JSON.stringify(outputData),
            editedBy: email,
          });
        } catch {
          // Saving failed (e.g. offline); the next change will retry.
        }
      }, SAVE_DELAY_MS);
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
        onChange: save,
        onReady: () => {
          if (disposed) return;
          // Load the saved content, then render changes made by collaborators.
          unsubscribe = onSnapshot(docRef, (snap) => {
            if (!snap.exists() || !editor) return;
            const data = snap.data();
            if (initialised && data?.editedBy === email) return;
            initialised = true;
            const parsed = parseOutput(data?.output);
            if (parsed) editor.render(parsed).catch(() => {});
          });
        },
      });
    })();

    return () => {
      disposed = true;
      clearTimeout(saveTimer);
      unsubscribe?.();
      if (editor) {
        editor.isReady.then(() => editor.destroy()).catch(() => {});
      }
    };
  }, [email, documentId, holderId]);

  return <div id={holderId} className="w-full min-h-[300px]" />;
}

export default RichDocumentEditor;
