
import { Navbar } from '@/components/shared/navbar/nav-bar';
import React from 'react'

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div>
      <Navbar
        className='bg-primary text-white'
      />
      {children}
    </div>
  )
}

export default AuthLayout