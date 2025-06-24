
import React from 'react'
import Image from 'next/image';
import Link from 'next/link';

import { Button } from '../ui/button';
import { client } from '@/server/rpc/hono-client';


export async function Suggestions() {

  const response = await client.api.suggestions.getProductSuggestions.$get({});
  const { data: { suggestions } } = await response.json();


  return (
      <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3  gap-4 mt-8">
        {suggestions.map((suggestion, idx) => {
          if (idx === 0) return null;
          return (
            <li key={idx} className="flex p-4  bg-neutral-100 rounded-lg relative">
              <Link href={suggestion.url ?? '#'} className="flex justify-between">
                <div className="flex flex-col items-start justify-center gap-y-2">
                  <h2 className="font-Rubik-Medium text-md">{suggestion.primaryText}</h2>
                  <p className="font-Rubik-light text-[12px] w-full max-w-[200px] break-words">
                    {suggestion.secondaryText}
                  </p>
                  <Button
                    size={'sm'}
                    className=" bg-white text-sm mt-4 font-Rubik-Medium shadow-none hover:bg-neutral-300 rounded-full text-neutral-900"
                  >
                    Details
                  </Button>
                </div>
                <Image
                  src={suggestion.imageUrl}
                  alt={`${suggestion.primaryText} image`}
                  width={128}
                  height={128}
                  className="absolute right-2 top-1/2  -translate-y-1/2  object-contain"
                />
              </Link>
            </li>
          )
        })}
      </ul>
  )
}

