"use client";

import React, { useState } from 'react'
import { FaCalendar } from 'react-icons/fa';
import { IoTime } from 'react-icons/io5';

import { formatDate, generateTimeSlots, isValidDate } from '@/lib/utils';

import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Input } from '../ui/input'
import { Calendar } from '../ui/calendar';


export const PickupDateTimeSelector = () => {

    const timeSlots = generateTimeSlots();

    const [openDatePicker, setOpenDatePicker] = useState(false);
    const [date, setDate] = useState<Date | undefined>()
    const [month, setMonth] = useState<Date | undefined>(date)
    const [value, setValue] = useState(formatDate(date));
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