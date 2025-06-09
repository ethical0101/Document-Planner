import React, { useEffect, useRef, useState } from 'react'
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import Delimiter from '@editorjs/delimiter';
import Alert from 'editorjs-alert';
import List from "@editorjs/list";
import NestedList from '@editorjs/nested-list';
import Checklist from '@editorjs/checklist'
import Embed from '@editorjs/embed';
import SimpleImage from 'simple-image-editorjs';
import Table from '@editorjs/table'
import CodeTool from '@editorjs/code';
import { TextVariantTune } from '@editorjs/text-variant-tune';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import { useUser } from '@clerk/nextjs';
import Paragraph from '@editorjs/paragraph';


function RichDocumentEditor({ params }) {

  const ref = useRef();
  let editorRef = useRef(null);
  let editor;
  const { user } = useUser();
  const [documentOutput, setDocumentOutput] = useState([]);
  let isFetched = useRef(false);
  useEffect(() => {
    if (user) {
      InitEditor();
    }
    return () => {
      if (editorRef.current) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
      isFetched.current = false;
    };
  }, [user])

  /**
   * Used to save Document
   */
  const SaveDocument = () => {
    if (!editorRef.current) return;
    editorRef.current.save().then(async (outputData) => {
      const docRef = doc(db, 'documentOutput', params?.documentid);
      await updateDoc(docRef, {
        output: JSON.stringify(outputData),
        editedBy: user?.primaryEmailAddress?.emailAddress
      })
    })
  }

  const GetDocumentOutput = () => {
    return onSnapshot(doc(db, 'documentOutput', params?.documentid),
      (docSnap) => {
        if (!docSnap.exists()) return;
        const data = docSnap.data();
        if ((data?.editedBy !== user?.primaryEmailAddress?.emailAddress || !isFetched.current) && data?.output) {
          try {
            editorRef.current && editorRef.current.render(JSON.parse(data.output));
            isFetched.current = true;
          } catch (e) {
            // handle parse/render error
          }
        }
      });
  }

  const InitEditor = () => {
    if (!editorRef.current) {
      editorRef.current = new EditorJS({
        onChange: (api, event) => {
          SaveDocument();
        },
        onReady: () => {
          // Subscribe to Firestore updates and clean up on destroy
          if (editorRef.current._unsubscribe) editorRef.current._unsubscribe();
          editorRef.current._unsubscribe = GetDocumentOutput();
        },
        holder: 'editorjs',
        tools: {
          header: Header,
          delimiter: Delimiter,
          paragraph:Paragraph,
          alert: {
            class: Alert,
            inlineToolbar: true,
            shortcut: 'CMD+SHIFT+A',
            config: {
              alertTypes: ['primary', 'secondary', 'info', 'success', 'warning', 'danger', 'light', 'dark'],
              defaultType: 'primary',
              messagePlaceholder: 'Enter something',
            }
          },
          table: Table,
          list: {
            class: List,
            inlineToolbar: true,
            shortcut: 'CMD+SHIFT+L',
            config: {
              defaultStyle: 'unordered'
            },
          },
          checklist: {
            class: Checklist,
            shortcut: 'CMD+SHIFT+C',
            inlineToolbar: true,
          },
          image: SimpleImage,
          code: {
            class: CodeTool,
            shortcut: 'CMD+SHIFT+P'
          },
          //   textVariant: TextVariantTune


        },

      });
    }
  }
  return (
    <div className=''>
      <div id='editorjs' className='w-[70%]'></div>
    </div>
  )
}

export default RichDocumentEditor
