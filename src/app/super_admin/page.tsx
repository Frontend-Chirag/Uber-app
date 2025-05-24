import { Button } from '@/components/ui/button';
import { getServerSession } from '@/lib/auth';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import React from 'react'

export default async function SuperAdmin() {
    const { session } = await getServerSession();

    if (!session || session?.role !== 'super_admin') {
        redirect('/')
    };

    return (
        <div>
            <h1>Super Admin</h1>
            <Link href='/super_admin/registration-template'>
                <Button>
                    <span className='text-sm font-Rubik-Medium'>Registration Template</span>
                    <Plus className='size-4' />
                </Button>
            </Link>
        </div>
    )
}
