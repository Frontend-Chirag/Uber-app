

import { cn } from '@/lib/utils'
import React from 'react'

interface NavbarProps {
  children?: React.ReactNode
  className?: string
}

export const Navbar = ({ children, className }: NavbarProps) => {

  return (
    <div className='w-full h-[64px] '>
      <header className={cn('w-full h-full flex px-14 justify-between items-center', className)}>
        {children}
      </header>
    </div>
  )
}

