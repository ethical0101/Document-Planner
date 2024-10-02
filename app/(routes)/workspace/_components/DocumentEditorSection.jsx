import React from 'react'
import DocumentHeader from './DocumentHeader'
import DocumentInfo from './Documentinfo'

function DocumentEditorSection(params) {
    console.log("sgfrsdsfg",params)
  return (
    <div >
      <DocumentHeader />
      <DocumentInfo documentid={params.params.params.documentid}/>
    </div>
  )
}

export default DocumentEditorSection
