
import { Navbar } from '@/components/shared/nav-bar'
import Link from 'next/link'
import React from 'react'


const Dashboard = () => {
  return (
    <div className='w-screen h-screen'>
      <Navbar
        theme='LIGHT'

      />
      <Link href={'/looking'}>rider</Link>
    </div>
  )
}

export default Dashboard
