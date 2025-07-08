"use client";
import { UserProfile } from '@/components/shared/user-profile';
import React from 'react'
import FingerprintJS from '@fingerprintjs/fingerprintjs';

export default function RideHome() {

  
  const fpPromise = FingerprintJS.load();
  (async () => {
    // Get the visitor identifier when you need it.
    const fp = await fpPromise
    const result = await fp.get()
    console.log('Finger print js', result.visitorId)
  })()


  return (
    <div>
      Home
      <UserProfile />
    </div>
  )
};
