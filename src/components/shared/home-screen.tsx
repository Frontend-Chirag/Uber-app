import { cn } from '@/lib/utils';
import Image from 'next/image';
import React from 'react'


interface HomescreenProps {
  title: string;
  image: {
    src: string;
    width: number;
    height: number;
    alt: string;
    className?: string
  };
}


export const Homescreen = ({ title, image }: HomescreenProps) => {
  return (
    <main className='h-screen w-full flex p-16 '>
      <div className='w-1/2 h-full flex justify-center items-center'>
        <h1 className='font-Rubik-Semibold text-[52px] leading-[64px]'>{title}</h1>
      </div>
      <div className='w-1/2 h-full hidden lg:flex  '>
        <Image
          {...image}
          className={cn(`object-cover rounded-md`, image.className)}
        />
      </div>
    </main>
  )
}
