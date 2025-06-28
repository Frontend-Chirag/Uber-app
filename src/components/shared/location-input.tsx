"use client";

import React, { useEffect, useRef, useState } from 'react';
import { PiNavigationArrowFill } from 'react-icons/pi';
import { FaCircle, FaRegSquare, FaTimesCircle } from 'react-icons/fa';

import { Input } from '../ui/input';
import { Button } from '../ui/button';

import { debounce } from 'lodash';
import { useLocations } from '@/hooks/use-location';
import { useParams } from 'next/navigation';
import { CircleX } from 'lucide-react';
import { LiaTimesCircleSolid } from 'react-icons/lia'
import { Label } from '../ui/label';

interface LocationInputProps {
    type: 'pickup' | 'destination';
    placeholder: string;
}

export const LocationInput = ({ type, placeholder }: LocationInputProps) => {
    const params = useParams();
    const { lang } = params as { lang: string };

    const [q, setQ] = useState('');
    const [isChanging, setIsChanging] = useState(false);
    const [candidates, setCandidates] = useState<{
        addressLine1: string;
        addressLine2: string;
        categories: string;
        id: string;
        provider: string;
    }[]>([]);

    const containerRef = useRef<HTMLDivElement | null>(null);

    const { mutateAsync } = useLocations();

    useEffect(() => {
        if (q === '') {
            setIsChanging(false);
        }
    }, [q]);

    const debounceChange = debounce(async (value: string) => {
        const response = await mutateAsync({
            json: {
                q: value,
                locale: lang,
                type,
                lat: 28.6139,
                long: 77.2090,
            },
        });

        setCandidates(response.data.candidates);
    }, 300);

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQ(value);
        setIsChanging(true);
        debounceChange(value);
    };

    return (
        <div ref={containerRef} className='relative w-full flex items-center group '>
            {type === 'pickup' ? (
                <FaCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-black size-[10px]" />
            ) : (
                <FaRegSquare className="absolute left-4 top-1/2 bg-black  -translate-y-1/2 text-neutral-200 size-[10px]" />
            )}
            {isChanging && q !== '' && (
                <FaTimesCircle className='absolute right-4 top-1/2 -translate-y-1/2 text-black size-5 cursor-pointer hover:text-neutral-700'
                    onClick={() => setQ('')}
                />
            )}
            {/* Floating Label */}
            <Label
                className={`
                    absolute left-8 text-md font-Rubik-Regular text-neutral-500 pointer-events-none
                    transition-all duration-200 ease-in-out
                    transform
                    bg-transparent px-1
                    top-1/2 -translate-y-1/2 
                    group-focus-within:top-0 
                    group-focus-within:bg-white group-focus-within:px-1
                   
                  `} >
                {placeholder}
            </Label>
            <Input
                onChange={onChange}
                value={q}
                placeholder={placeholder}
                className='px-9 py-6 font-Rubik-Regular text-xl text-black bg-neutral-100 rounded-lg placeholder:text-[16px] placeholder:text-neutral-600 outline-none border-none shadow-none focus-visible:ring-2 focus:bg-white focus-visible:ring-black focus:placeholder-transparent'
            />
            {type === 'pickup' && !isChanging && (
                <PiNavigationArrowFill className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 size-7 rotate-90" />
            )}

            <div className='absolute top-full left-0 mt-1 py-2 w-full max-h-[269px] overflow-y-auto bg-white shadow-[0_12px_18px_-3px_rgba(0,0,0,0.4)] rounded-md z-50  flex-col hidden group-focus-within:flex'>
                {candidates.length > 0 ? (
                    candidates.map((candidate) => (
                        <Button
                            key={candidate.id}
                            onClick={() => {
                                setQ(`${candidate.addressLine1}, ${candidate.addressLine2}`);
                            }}
                            variant="ghost"
                            // style={{
                            //     padding: '24px 16px'
                            // }} 
                            className='text-left justify-start px-4 py-7 w-full h-12 rounded-none font-Rubik-Regular text-sm text-neutral-800 hover:bg-neutral-100 whitespace-normal break-words leading-snug'
                        >
                            {candidate.addressLine1}, {candidate.addressLine2}
                        </Button>
                    ))
                ) : (
                    <div className='px-4 py-2 text-sm text-center text-neutral-500 font-Rubik-Regular'>No results found</div>
                )}
            </div>
        </div>
    );
};
