"use client"
import Logo from '@/app/_components/Logo'
import { OrganizationSwitcher, useAuth, UserButton } from '@clerk/nextjs'
import React from 'react'

const Header = () => {
    const {orgId}=useAuth();
    console.log(orgId);
  return (
    <div className='flex items-center justify-between px-5 py-3 shadow-sm'>
      <Logo />

      <OrganizationSwitcher 
      afterCreateOrganizationUrl={'/dashboard'}
      afterLeaveOrganizationUrl={'/dashboard'}
      />
      <UserButton />
    </div>
  )
}

export default Header
