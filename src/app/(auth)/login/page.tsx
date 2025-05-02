import React from 'react'
import { AuthFlowProvider } from '@/features/auth/auth-flow-provider';
import { AuthFormLayout } from '@/features/auth/auth-form-layout';
import { Role } from '@prisma/client';

export const metadata = {
    title: 'Log In',
    description: 'Log In to your account',
}

export default async function LoginPage({
    searchParams
}: {
    searchParams: Promise<{ role?: string }>
}) {
    const { role } = (await searchParams);

    return (
        <div className='flex flex-col gap-y-4 w-full max-h-screen px-4  sm:px-0'>
            <AuthFlowProvider role={role as Role}>
                <AuthFormLayout />
            </AuthFlowProvider>
        </div>
    )
}

