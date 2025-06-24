"use client";

import React from 'react'
import Link from 'next/link';
import { PiNavigationArrowFill } from 'react-icons/pi';
import { FaCircle, FaRegSquare } from 'react-icons/fa';

import { Input } from '../ui/input'
import { Button } from '../ui/button';

import { PickupDateTimeSelector } from './pickup-date-time-selector';



export const RideSearchPanel = () => {


    return (
        <section className='w-full flex flex-col'>
            <div className=' flex flex-col gap-y-4 relative '>
                <div className='w-full flex flex-col gap-y-4 relative'>
                    <div className='flex items-center justify-start gap-x-2 px-4 py-[6px] bg-neutral-100 rounded-lg focus-within:ring-2 focus-within:ring-black focus-within:bg-white transition'>
                        <FaCircle
                            className='size-[10px]'
                        />
                        <Input
                            placeholder='Pickup location'
                            className='px-2 font-Rubik-Regular text-xl text-black placeholder:text-[16px]  bg-transparent  placeholder:text-neutral-600 outline-none border-none shadow-none focus-visible:ring-0'
                        />
                        <PiNavigationArrowFill
                            className='size-8 rotate-90'
                        />
                    </div>

                    <div className='flex items-center justify-start gap-x-2 px-4 py-[6px] bg-neutral-100 rounded-lg  focus-within:ring-2 focus-within:ring-black focus-within:bg-white  transition'>
                        <FaRegSquare
                            className='size-[8px] ring-1 ring-neutral-400 bg-black'
                        />
                        <Input
                            placeholder='Dropoff location'
                            className='px-2 font-Rubik-Regular text-xl text-black placeholder:text-[16px] bg-transparent  placeholder:text-neutral-600 outline-none border-none shadow-none focus-visible:ring-0'
                        />
                    </div>

                    <div className='absolute top-1/2 left-5 size-6 w-[1px] h-[48px] -translate-y-1/2 bg-black' />
                </div>

                <PickupDateTimeSelector />

                <div className='flex items-center justify-start gap-x-4'>
                    <Button
                        variant='default'
                        style={{ padding: '24px  20px' }}
                        className='font-Rubik-Regular bg-black text-lg rounded-md'
                    >
                        See prices
                    </Button>
                    <Link
                        href="/looking"
                        className="relative inline-block pb-1 after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[1px] after:w-full after:bg-neutral-300
                                   before:content-[''] before:absolute before:left-0 before:bottom-0 before:h-[1px] before:w-0 before:bg-black
                                   before:transition-all before:duration-300 hover:before:w-full before:z-10"
                    >
                        Log in to see your recent activity
                    </Link>
                </div>
            </div>
        </section >
    )
}
