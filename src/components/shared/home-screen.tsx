import { cn } from '@/lib/utils';
import Image, { StaticImageData } from 'next/image';
import React from 'react'


interface HomescreenProps {
  title: string;
  src: string | StaticImageData;
  className?: string;
}


export const Homescreen = ({ title, src, className }: HomescreenProps) => {
  return (
    <main className={cn('h-screen w-full justify-between flex p-16 mt-[64px]', className)}>
      <div className='w-[544px] h-full flex justify-center items-start'>
        <h1 className='font-Rubik-Semibold text-[52px] leading-[64px]'>{title}</h1>
      </div>
      <div className='min-w-16 h-full' />
      <div className='w-[576] h-[384] hidden lg:flex  '>
        <Image
          src={src}
          alt={'image'}
          objectFit='cover'
          className='rounded-md'
        />
      </div>
    </main>
  )
}
