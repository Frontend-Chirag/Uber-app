
import { Header } from '@/components/shared/nav-bar';
import { isUserLoggedIn } from '@/lib/user-logged-in';
import { getSessionManager } from '@/server/services/session/session-service'
import { cookies, headers } from 'next/headers';
import Link from 'next/link'
import { redirect } from 'next/navigation';
import React from 'react'


export default async function RiderHome() {


  return (
    <div className='w-screen h-screen'>
      <Link href={'/looking'}>rider</Link>
    </div>
  )
}
