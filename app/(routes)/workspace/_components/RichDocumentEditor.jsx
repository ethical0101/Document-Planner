import React, { useEffect, useRef } from "react";
import EditorJS from "@editorjs/editorjs";
import Quote from "@editorjs/quote";
import Table from "@editorjs/table";
import CodeTool from "@editorjs/code";
import List from "@editorjs/list";
import Header from "@editorjs/header";
import Checklist from "@editorjs/checklist";
import ImageTool from "@editorjs/image";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "@/config/firebaseConfig";
import { useUser } from "@clerk/nextjs";

function RichDocumentEditor({ params }) {

  console.log("This is rich doc params->",params)
  const editorRef = useRef(null); // Reference for the editor instance
  const { user } = useUser();
  let isFetched = false;

  // Initialize the editor only once when the user is available
  useEffect(() => {
    if (user && !editorRef.current) {
      initEditor(); // Initialize EditorJS
    }
  }, [user]);

  const saveDocument = async () => {
    const outputData = await editorRef.current.save();
    console.log(outputData);
    const docRef = doc(db, 'documentOutput', params?.documentid);
    await updateDoc(docRef, {
      output: outputData,
      EditedBy: user?.primaryEmailAddress?.emailAddress,
    });
  };

  const getDocumentOutput = () => {
    const unsubscribe = onSnapshot(
      doc(db, 'documentOutput', params?.documentid),
      (doc) => {
        const data = doc.data()?.output;
        if (!isFetched || data?.EditedBy !== user?.primaryEmailAddress?.emailAddress) {
          if (data) {
            editorRef.current.render(data); // Pass the object directly, not wrapped in an array
          }
          isFetched = true;
        }
      }
    );
  };

  const initEditor = () => {
    editorRef.current = new EditorJS({
      onChange: () => {
        saveDocument(); // Save directly without debounce
      },
      onReady: () => {
        getDocumentOutput();
      },
      holder: "editorjs",
      tools: {
        header: Header,
        table: Table,
        checklist: {
          class: Checklist,
          inlineToolbar: true,
        },
        list: {
          class: List,
          inlineToolbar: true,
          config: {
            defaultStyle: "unordered",
          },
        },
        image: {
          class: ImageTool,
          config: {
            endpoints: {
              byFile: "http://localhost:8008/uploadFile", // Your backend file uploader endpoint
              byUrl: "http://localhost:8008/fetchUrl", // Your endpoint that provides uploading by URL
            },
          },
        },
        quote: Quote,
        code: CodeTool,
      },
    });
  };

  return (
    <div className="mr-20 lg:-ml-40">
      <div id="editorjs"></div>
    </div>
  );
}

export default RichDocumentEditor;
