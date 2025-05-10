import { CreateDriverRegirationDoc } from '@/features/admin/driver-registration-document/create-registration-document';
import { getServerSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import React from 'react'

export default async function SuperAdmin() {
    const { session } = await getServerSession();

    if (!session || session?.role !== 'super_admin') {
        redirect('/')
    };

    return (
        <div>
            <CreateDriverRegirationDoc />
        </div>
    )
}
