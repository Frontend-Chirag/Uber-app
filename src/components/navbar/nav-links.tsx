"use client";

import React from 'react';
import Link from 'next/link';
import { link } from '@/lib/types';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';


interface NavLinksProps {
    type: 'Public' | 'Private';
    links: link[];
    className?: string;
}

export const NavLinks = ({ type, links, className }: NavLinksProps) => {

    const pathname = usePathname();

    const activeClassName = type === 'Public' ? 'bg-neutral-700' : "after:content-[''] after:absolute after:w-full after:h-1 after:bg-primary after:bottom-[-4px] after:left-0";

    return (
        <nav className='flex-1 h-full flex justify-start items-center'>
            <ul className='flex justify-start items-center gap-x-2'>
                <h1 className='text-3xl font-Rubik-SemiBold mr-4'>Uber</h1>
                {links.map((link) => {
                    const isActive = pathname === link.link;
                    const Icon = link?.icon;
                    return (
                        <li key={link.name}>
                            <Link href={link.link} className={cn(className, isActive && activeClassName)}>
                                {Icon &&
                                    <Icon className="mr-2 size-6" />
                                }
                                {link.name}
                            </Link>
                        </li>
                    )
                })}
            </ul>
        </nav>
    )
}
