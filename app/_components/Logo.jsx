import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

function Logo() {
  return (
    <Link href={'/dashboard'} className='flex items-center gap-2'>
        <Image src={'/Assets/logo.png'} alt='logo'
        width={30} height={30} />
        <h2 className='text-xl font-bold'>Document Planner</h2>
    </Link>
  )
}

export default Logo
