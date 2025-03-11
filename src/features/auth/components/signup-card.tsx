import React from 'react'
import { AuthFormLayout } from './form/auth-form-layout'
import { AuthFlowProvider } from '@/components/auth-flow-provider'

export const SignupCard = () => {
  return (
    <div className='flex flex-col gap-y-4 max-h-screen bg-neutral-400 w-full overflow-hidden px-4 border sm:px-0'>
      <AuthFlowProvider>
        <AuthFormLayout />
      </AuthFlowProvider>
    </div>
  )
}
