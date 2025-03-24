
import { Navbar } from '@/components/navbar/nav-bar';
import React from 'react'

interface RiderLayoutProps {
  children: React.ReactNode;
}

const RiderLayout = ({ children }: RiderLayoutProps) => {
  return (
    <div>
      <Navbar
        className='bg-primary text-white'
      />
      {children}
    </div>
  )
}

export default RiderLayout;