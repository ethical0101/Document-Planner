import React from 'react'
import DocumentHeader from './DocumentHeader'
import DocumentInfo from './Documentinfo'
import RichDocumentEditor from './RichDocumentEditor'

function DocumentEditorSection(params) {
    console.log("sgfrsdsfg",params)
  return (
    <div >
      <DocumentHeader />
      <DocumentInfo documentid={params.params.params.documentid}/>
      <RichDocumentEditor />
    </div>
  )
}

export default DocumentEditorSection
