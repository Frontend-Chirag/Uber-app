"use client"

import React from 'react'
import { Button } from '../ui/button'
import { Loader2Icon, LogOutIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useLogout } from '@/hooks/use-auth'


export const LogoutButton = () => {

    const { mutateAsync, isPending } = useLogout();


    const logout = async () => {
        await mutateAsync({})
    }


    return (
        <Button
            title='Log out'
            onClick={logout}
        >
            {isPending ? (
                <Loader2Icon className='size-6 animate-spin'/>
            ) : (
                <>
                    Log out
                    <LogOutIcon className='size-6' />
                </>
            )

            }
        </Button>
    )
}
