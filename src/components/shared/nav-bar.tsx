"use client";

import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import React, { useEffect } from 'react'

type Theme = 'DARK' | 'LIGHT';

interface NavbarProps {
    // navlinks: [];
    theme: Theme
    icon?: {
        image?: {
            src: string;
            alt: string;
            width: number;
            height: number;
            className?: string;
        };
        name?: {
            text: string;
            className?: string;
        }
    }
}

interface navlinks {
    type: 'button' | 'link' | 'dropdown';
    name: string;
    icon?: string;
    href?: string;
    dropdownOptions: {
        name: string;
        href: string;
    }[];
    
    children?: navlinks[];
}


export const Navbar = ({ theme, icon }: NavbarProps) => {

    const { setTheme, theme: currentTheme } = useTheme();

    useEffect(() => {
        setTheme(theme === 'DARK' ? 'dark' : 'light')
    }, []);


    return (
        <div className='w-full h-[64px] border-b fixed top-0 left-0 px-16 flex items-center justify-between bg-white text-black dark:bg-black dark:text-white '>
            <div className='flex items-start justify-center '>
                {icon && icon.image
                    ? <Image
                        {...icon.image}
                        className={cn(icon.image.className, 'w-10 h-10')}
                    />
                    : <h1 className={cn('text-black dark:text-gray-200 text-3xl', icon?.name?.className)} > {icon?.name?.text || 'Uber'}</h1>
                }

            </div>
        </div >
    )
}
