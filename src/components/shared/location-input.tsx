"use client";

import React, { useState } from 'react';
import { PiNavigationArrowFill } from 'react-icons/pi';
import { FaCircle } from 'react-icons/fa';

import { Input } from '../ui/input';
import { Button } from '../ui/button';

import { debounce } from 'lodash';
import { useLocations } from '@/hooks/use-location';
import { useParams } from 'next/navigation';

interface LocationInputProps {
  type: 'pickup' | 'destination';
  placeholder: string;
}

export const LocationInput = ({ type, placeholder }: LocationInputProps) => {
  const params = useParams();
  const { lang } = params as { lang: string };

  const [q, setQ] = useState('');
  const [showCandidates, setShowCandidates] = useState(false);
  const [candidates, setCandidates] = useState<{
    addressLine1: string;
    addressLine2: string;
    categories: string;
    id: string;
    provider: string;
  }[]>([]);

  const { mutateAsync } = useLocations();

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
    debounceChange(value);
  };

  return (
    <div className='relative w-full'>
      <div className='flex items-center gap-x-2 px-4 py-[6px] bg-neutral-100 rounded-lg focus-within:ring-2 focus-within:ring-black focus-within:bg-white transition'>
        <FaCircle className='size-[10px]' />
        <Input
          onChange={onChange}
          value={q}
          onFocus={() => setShowCandidates(true)}
          placeholder={placeholder}
          className='px-2 font-Rubik-Regular text-xl text-black placeholder:text-[16px] bg-transparent placeholder:text-neutral-600 outline-none border-none shadow-none focus-visible:ring-0'
        />
        {type === 'pickup' && (
          <PiNavigationArrowFill className='size-8 rotate-90' />
        )}
      </div>

      {showCandidates && (
        <div className='absolute top-full left-0 mt-1 py-2 w-full max-h-[300px] overflow-y-auto bg-white shadow-[0_12px_18px_-3px_rgba(0,0,0,0.4)] rounded-md z-50 flex flex-col'>
          {candidates.length > 0 ? (
            candidates.map((candidate) => (
              <Button
                key={candidate.id}
                onClick={() => {
                  setQ(`${candidate.addressLine1}, ${candidate.addressLine2}`);
                  setShowCandidates(false);
                }}
                variant="ghost" 
                className='text-left justify-start px-4 py-3 w-full h-12 rounded-none font-Rubik-Regular text-sm text-neutral-800 hover:bg-neutral-100 whitespace-normal break-words leading-snug'
              >
                {candidate.addressLine1}, {candidate.addressLine2}
              </Button>
            ))
          ) : (
            <div className='px-4 py-2 text-sm text-center text-neutral-500'>No results found</div>
          )}
        </div>
      )}
    </div>
  );
};
