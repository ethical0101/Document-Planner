import React from 'react'
import DocumentHeader from './DocumentHeader'
import DocumentInfo from './Documentinfo'
import RichDocumentEditor from './RichDocumentEditor'

function DocumentEditorSection({params}) {
    console.log("sgfrsdsfg",params)
  return (
    <div >
      <DocumentHeader />
      <DocumentInfo documentid={params.documentid}/>
      <RichDocumentEditor params={params}/>
    </div>
  )
}

export default DocumentEditorSection
