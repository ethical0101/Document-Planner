"use client"

import React from 'react'
import SideNav from '../../_components/SideNav'

const WorkspaceDocument = (params) => {
  return (
    <div>
      <div>
      <SideNav params={params}/>
      </div>
      <div className='md:ml-72'>
        Document
      </div>
      
    </div>
  )
}

export default WorkspaceDocument
