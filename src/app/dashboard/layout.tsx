
import { Navbar } from '@/components/shared/navbar/nav-bar';
import React from 'react'

interface AuthLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div>
      {children}
    </div>
  )
}

export default DashboardLayout