
import { getSessionManager } from '@/server/services/session/session-service'
import { headers } from 'next/headers';
import Link from 'next/link'
import { redirect } from 'next/navigation';
import React from 'react'


export default async function RiderHome() {

  const userSession = getSessionManager('USER_SESSION');
  const headerList = await headers()
  const uberSession = headerList.get('x-uber-session');

  if (uberSession === null) redirect('/login')

  const session = await userSession.getSession(uberSession)

  console.log('session', session)

  return (
    <div className='w-screen h-screen'>
      {/* <Navbar
        theme='LIGHT'

      /> */}
      <Link href={'/looking'}>rider</Link>
    </div>
  )
}
