import ImageTool from '@editorjs/image';
import Quote from '@editorjs/quote';
import Table from '@editorjs/table'
import CodeTool from '@editorjs/code';

import SimpleImage from "@editorjs/simple-image";
import List from "@editorjs/list";
import Header from '@editorjs/header';
import Checklist from '@editorjs/checklist'
import React, { useEffect, useRef } from 'react'
import EditorJS from '@editorjs/editorjs';
const RichDocumentEditor = () => {
    const ref = useRef();
    let editor;

    useEffect(()=>{
        InitEditor();
    },[]);
    
    const InitEditor=()=>{
        if(!editor?.current){
            editor = new EditorJS({
                holder:'editorjs',
                tools:{
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
                          defaultStyle: 'unordered'
                        }
                      },
                      image: {
                        class: ImageTool,
                        config: {
                          endpoints: {
                            byFile: 'http://localhost:8008/uploadFile', // Your backend file uploader endpoint
                            byUrl: 'http://localhost:8008/fetchUrl', // Your endpoint that provides uploading by Url
                          }
                        }
                      },
                      quote: Quote,
                      code: CodeTool,
                }
            });
            ref.current = editor;
        }
    }

    
  return (
    <div className='ml-[-100px]'>
      <div id='editorjs'>
        
      </div>
    </div>
  )
}

export default RichDocumentEditor
