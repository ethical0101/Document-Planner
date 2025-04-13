import { Button } from '@/components/ui/button'
import { OrganizationSwitcher, UserButton } from '@clerk/nextjs'
import React from 'react'

function DocumentHeader() {
  return (
    <div className="flex items-center justify-between w-full p-5 shadow-md px-7">
      <div></div>
      <OrganizationSwitcher />
      <div className='flex gap-2'>
        <Button>Share</Button>
        <UserButton />
      </div>
    </div>
  )
}

export default DocumentHeader
