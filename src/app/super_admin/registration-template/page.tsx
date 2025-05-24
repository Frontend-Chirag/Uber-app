
import React from 'react'
import { RegistrationTemplateCard } from '@/features/admin/registration-template-card';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default function RegistrationTemplate() {
    return (
        <div className='flex flex-col w-full  gap-4 px-8 py-4 overflow-y-auto scrollbar-hide'>
            <div className='flex justify-between items-center'>
                <h1 className='text-2xl font-Rubik-Semibold'>Registration Template</h1>
                <Link
                    href='/super_admin/registration-template/create-template'
                    className="border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground flex justify-center  items-center gap-2 no-underline text-black rounded-md px-4 py-2"
                >
                    <span className='text-sm font-Rubik-Medium'>Create Template</span>
                    <Plus className='size-4' />
                </Link>
            </div>
            <div className='grid grid-cols-3 gap-4'>
                <RegistrationTemplateCard />
                <RegistrationTemplateCard />
                <RegistrationTemplateCard />
                <RegistrationTemplateCard />
            </div>
        </div>
    )
}
