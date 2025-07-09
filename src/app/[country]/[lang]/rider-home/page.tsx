import Link from 'next/link'
import React from 'react'


export default async function RiderHome() {


  return (
    <div className='w-screen h-screen'>
      <Link href={'/looking'}>rider</Link>
    </div>
  )
}
