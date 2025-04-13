"use client"

import React from 'react'
import SideNav from '../_components/SideNav'

function Workspace({params}) {
    console.log("Workspace params",params)
  return (
    <div>
      <SideNav params={params}/>
    </div>
  )
}

export default Workspace
