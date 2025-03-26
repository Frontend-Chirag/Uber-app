import { AuthFlowProvider } from '@/components/auth/auth-flow-provider'
import { AuthFormLayout } from '@/components/auth/auth-form-layout'
import React from 'react'

export const LoginCard = () => {
  
  return (
    <div className='flex flex-col gap-y-4 w-full max-h-screen px-4  sm:px-0'>
      <AuthFlowProvider>
        <AuthFormLayout />
      </AuthFlowProvider>
    </div>
  )
}
