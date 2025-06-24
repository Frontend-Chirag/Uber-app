import Link from 'next/link';
import React from 'react'
import Image, { StaticImageData } from 'next/image';

import { Button } from '../ui/button';



type SuggestionType = {
    suggestionName: string;
    image: string | StaticImageData
    details: string;
    link: string;
  }
  

export const SuggestionCard = ({ suggestion }: { suggestion: SuggestionType }) => (
    <li className="flex p-4  bg-neutral-100 rounded-lg relative">
      <Link href={suggestion.link ?? '#'} className="flex justify-between">
        <div className="flex flex-col items-start justify-center gap-y-2">
          <h2 className="font-Rubik-Medium text-md">{suggestion.suggestionName}</h2>
          <p className="font-Rubik-light text-[12px] w-full max-w-[200px] break-words">
            {suggestion.details}
          </p>
          <Button
            size={'sm'}
            className=" bg-white text-sm mt-4 font-Rubik-Medium shadow-none hover:bg-neutral-300 rounded-full text-neutral-900"
          >
            Details
          </Button>
        </div>
        <Image
          src={suggestion.image}
          alt={`${suggestion.suggestionName} image`}
          width={128}
          height={128}
          className="absolute right-2 top-1/2  -translate-y-1/2  object-contain"
        />
      </Link>
    </li>
  );
  