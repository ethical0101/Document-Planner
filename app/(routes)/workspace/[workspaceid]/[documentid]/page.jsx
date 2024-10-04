"use client"

import React from 'react'
import SideNav from '../../_components/SideNav'
import DocumentEditorSection from '../../_components/DocumentEditorSection'


const WorkspaceDocument = ({params}) => {
  console.log("WorkspaceDocument params",params)
  return (
    <div className='flex w-full'>
      
      <div className='z-10'>
      <SideNav params={params}/>
      </div>
      
      <div className='w-full'>
        <DocumentEditorSection params={params}/>
      </div>
    </div>
  )
}

export default WorkspaceDocument
