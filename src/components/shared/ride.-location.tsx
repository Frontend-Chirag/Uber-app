"use client";

import React, { useState } from 'react'
import { Input } from '../ui/input'
import { PiNavigationArrowFill } from 'react-icons/pi';
import { FaCalendar, FaCircle, FaRegSquare } from 'react-icons/fa';
import { IoTime } from 'react-icons/io5';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';
import { Calendar } from '../ui/calendar';
import Link from 'next/link';



function formatDate(date: Date | undefined) {
    if (!date) {
        return ""
    }
    return date.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    })
};

function isValidDate(date: Date | undefined) {
    if (!date) {
        return false
    }
    return !isNaN(date.getTime())
}

function generateTimeSlots() {
    const now = new Date();

    // Round up to the next 15-minute slot
    const minutes = now.getMinutes();
    const roundedMinutes = Math.ceil(minutes / 15) * 15;
    now.setMinutes(roundedMinutes);
    now.setSeconds(0);
    now.setMilliseconds(0);

    const slots: string[] = ['Now'];

    const slotCount = (9 * 60) / 15; // 9 hours = 36 slots

    for (let i = 0; i < slotCount; i++) {
        const slotTime = new Date(now.getTime() + i * 15 * 60 * 1000);
        const formatted = slotTime.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
        slots.push(formatted);
    }

    return slots;
}

const timeSlots = generateTimeSlots();



export const RideLocation = () => {



    return (
        <div className='w-full flex flex-col'>
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

                <DateTimePicker />

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
        </div >
    )
}


export const DateTimePicker = () => {

    const [openDatePicker, setOpenDatePicker] = useState(false);
    const [date, setDate] = React.useState<Date | undefined>()
    const [month, setMonth] = React.useState<Date | undefined>(date)
    const [value, setValue] = React.useState(formatDate(date));
    const [selected, setSelected] = useState(timeSlots?.[0] || 'Now');;

    return (
        <div className='flex gap-x-2  '>
            <div
                onClick={(e) => {
                    e.preventDefault()
                    setOpenDatePicker(true);
                    document.getElementById('date')?.focus()
                }}
                className='w-1/2 flex items-center justify-start gap-x-2 px-4 py-[6px] bg-neutral-100 rounded-lg  focus-within:ring-2 focus-within:ring-black focus-within:bg-white  transition '>
                <Popover open={openDatePicker} onOpenChange={setOpenDatePicker}>
                    <PopoverTrigger asChild>
                        <FaCalendar className="size-4.5" />
                    </PopoverTrigger>

                    <PopoverContent
                        className="w-auto overflow-hidden p-0"
                    >
                        <Calendar
                            mode='single'
                            selected={date ?? new Date(Date.now())}
                            captionLayout='dropdown'
                            month={month}
                            onMonthChange={setMonth}
                            onSelect={(date) => {
                                setDate(date)
                                setValue(formatDate(date))
                                setOpenDatePicker(false)
                            }}
                        />
                    </PopoverContent>

                </Popover>
                <Input
                    id='date'
                    value={value}
                    placeholder='Today'
                    onChange={(e) => {
                        const date = new Date(e.target.value)
                        setValue(e.target.value)
                        if (isValidDate(date)) {
                            setDate(date)
                            setMonth(date);
                        }
                    }}
                    className='p-0 font-Rubik-Regular text-xl text-black placeholder:text-[16px] bg-transparent  placeholder:text-neutral-600 outline-none border-none shadow-none focus-visible:ring-0'
                />
            </div>

            <div></div>
            <Popover>
                <PopoverTrigger asChild className='flex items-center justify-start gap-x-2'>
                    <div className='w-1/2 flex items-center justify-start px-4 p-[6px] bg-neutral-100 rounded-lg focus-within:ring-2 focus-within:ring-black focus-within:bg-white transition cursor-pointer'>
                        <IoTime className='size-4.5 mr-2' />
                        <p className=' font-Rubik-Regular text-lg text-neutral-600 '>
                            {selected}
                        </p>
                    </div>
                </PopoverTrigger>


                <PopoverContent className='w-52 max-h-32 overflow-auto px-0 py-2 rounded-lg space-y-1'>
                    {timeSlots?.map((slot) => (
                        <button
                            key={slot}
                            onClick={() => setSelected(slot)}
                            className={`w-full text-left px-2 py-1 ${selected === slot ? 'bg-neutral-100 font-medium' : 'hover:bg-neutral-100'
                                }`}
                        >
                            {slot}
                        </button>
                    ))}
                </PopoverContent>
            </Popover>

        </div>
    )
}