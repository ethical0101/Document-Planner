"use client"

import React from 'react'
import SideNav from '../../_components/SideNav'
import DocumentEditorSection from '../../_components/DocumentEditorSection'
import { Room } from '@/app/Room'


const WorkspaceDocument = ({params}) => {
  console.log("WorkspaceDocument params",params)



  return (
    <Room params={params}>
      <div className='flex w-full'>

        <div className='z-50'>
        <SideNav params={params}/>
        </div>

        <div className='w-full'>
          <DocumentEditorSection params={params}/>
        </div>
      </div>
    </Room>
  )
}

export default WorkspaceDocument
