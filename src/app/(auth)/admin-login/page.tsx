import React from 'react'
import { AuthFlowProvider } from '@/features/auth/auth-flow-provider';
import { AuthFormLayout } from '@/features/auth/auth-form-layout';


export default function AdminLoginPage() {
  return (
    <div className='flex flex-col gap-y-4 w-full max-h-screen px-4  sm:px-0'>
      <AuthFlowProvider role={'super_admin'}>
        <AuthFormLayout />
      </AuthFlowProvider>
    </div>
  )
}

