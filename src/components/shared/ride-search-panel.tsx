import React from 'react'
import Link from 'next/link';

import { Button } from '../ui/button';

import { PickupDateTimeSelector } from './pickup-date-time-selector';
import { LocationInput } from './location-input';




export const RideSearchPanel = () => {

    return (
        <section className='w-full flex flex-col'>
            <div className=' flex flex-col gap-y-4 relative '>
                <div className='w-full flex flex-col gap-y-4 relative'>
                    <LocationInput
                        type={'pickup'}
                        placeholder='Enter location'
                    />
                    <LocationInput
                        type={'destination'}
                        placeholder='Enter destination'
                    />
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
