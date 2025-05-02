"use client";

import React from 'react';
import Link from 'next/link';

import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Links } from '@/types';

interface NavLinksProps {
    type: 'Public' | 'Private';
    links: Links[];
    className?: string;
}

export const NavLinks = ({ type, links, className }: NavLinksProps) => {
    const pathname = usePathname();
    const activeClassName = type === 'Public' ? 'bg-neutral-700' : "after:content-[''] after:absolute after:w-full after:h-1 after:bg-primary after:bottom-[-4px] after:left-0";

    // Memoize the links mapping
    const renderLinks = React.useMemo(() => (
        links.map((link) => {
            const isActive = pathname === link.link;
            const Icon = link?.icon;
            return (
                <li key={link.name}>
                    <Link href={link.link} className={cn(className, isActive && activeClassName)}>
                        {Icon && <Icon className="mr-2 size-6" />}
                        {link.name}
                    </Link>
                </li>
            );
        })
    ), [links, pathname, className, activeClassName]);

    return (
        <nav className='flex-1 h-full flex justify-start items-center'>
            <ul className='flex justify-start items-center gap-x-2'>
                <h1 className='text-3xl font-Rubik-SemiBold mr-4'>Uber</h1>
                {renderLinks}
            </ul>
        </nav>
    );
};
