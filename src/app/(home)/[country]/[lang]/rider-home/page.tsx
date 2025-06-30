
import { getSessionManager } from '@/server/services/session/session-service'
import Link from 'next/link'
import React from 'react'


export default async function RiderHome() {

  const userSession = getSessionManager('USER_SESSION');

  const session = await userSession.getSession('0919487d-f5ae-4893-b12a-1e1702abe9f6')

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
