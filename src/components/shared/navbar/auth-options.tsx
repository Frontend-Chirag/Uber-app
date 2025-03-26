"use client";

import Link from 'next/link';
import { ArrowRightIcon } from 'lucide-react';
import { FaTimes } from 'react-icons/fa';
import React from 'react';

import { cn } from '@/lib/utils/utils';

import { Drawer, DrawerClose, DrawerContent, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';


interface AuthOptionsProps {
    Options: { name: string; type: 'Rider' | 'Driver' }[];
    path: string;
    name: string;
    className?: string;
}

export const AuthOptions = ({ Options, name, className, path }: AuthOptionsProps) => {
    // Memoize the options mapping since it doesn't need to re-render unless Options change
    const renderOptions = React.useMemo(() => (
        Options.map((option) => (
            <div
                key={option.type}
                className='flex-1 justify-start items-center p-2'
            >
                <div className='text-4xl font-Rubik-SemiBold text-primary hover:text-neutral-500 bg-white hover:bg-white'>
                    <Link
                        href={`/${path}?role=${option.type}`}
                        className='flex-1 flex justify-between items-center cursor-pointer'
                    >
                        {option.name}
                        <ArrowRightIcon className='size-10' />
                    </Link>
                </div>
                <div className='w-full h-0.5 bg-primary mt-16 mb-8' />
            </div>
        ))
    ), [Options, path]);

    return (
        <Drawer>
            <DrawerTrigger asChild>
                <Button className={cn('text-md px-6 font-Rubik-Medium rounded-full', className)}>
                    {name}
                </Button>
            </DrawerTrigger>
            <DrawerContent>
                <DrawerTitle>

                </DrawerTitle>
                <div className='flex justify-end items-center px-8 mb-14'>
                    <DrawerClose asChild>
                        <FaTimes className='size-10 cursor-pointer' />
                    </DrawerClose>
                </div>
                <div className='w-full flex justify-between items-center px-8 gap-x-16'>
                    {renderOptions}
                </div>
            </DrawerContent>
        </Drawer>
    );
};
