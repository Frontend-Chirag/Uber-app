"use client";

import React, { useEffect } from 'react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Button } from '../ui/button'
import { ChevronDown, LifeBuoyIcon, SquareChartGantt, UserIcon, WalletCards } from 'lucide-react'
import { client } from '@/server/rpc/hono-client';


interface ProfileProps {
  user: {
    firstname: string;
    lastname: string
  }
}

export function Profile({ user: { firstname } }: ProfileProps) {

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>

        <Button className='flex justify-center items-center text-sm font-Rubik-Regular rounded-full px-3'>
          {firstname}
          <ChevronDown />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='flex flex-col gap-y-4 p-0' >
        <DropdownMenuLabel className='flex justify-between items-starte gap-x-8 mt-6 px-4 '>
          <p className='font-Rubik-Semibold text-[32px]'>Chirag kashyap</p>
          <Avatar className='size-16'>
            <AvatarImage src='https://d1w2poirtb3as9.cloudfront.net/default.jpeg?Expires=1750793685&Signature=Ok782SEjPGazA5dEroIxYehfi8P5VWAqn4Q2jUXmznYyklUZQ6a7lYyD1JPd-L61kXJ-I6oaqfhmxTVJQ2tBmX05b4HsH1piHRGjvTHa5ypHxtyauNKHkZ9BeVyGgHwg4jWKmgeR6IFe6tRsw6pATPLTmU1-ml3qD6Is3Pi98mxGyRdQHRJewUP3sZKfraiSKynHSyGG6mdddudAtsoq9LnuueaIgoaqQx0fMCcd7ejoSmM3aDDjuQdOFEau~8rLnWLPHbRmkzubbdyzr~b08y0seeGPK-hpOGH1n~567T3mDf9lRrvuR03ByUrsRzsUappoU5uCZQSDE3bUowL9zw__&Key-Pair-Id=K36LFL06Z5BT10' />
            <AvatarFallback>CK</AvatarFallback>
          </Avatar>
        </DropdownMenuLabel>
        <DropdownMenuGroup className='flex justify-between items-center text-xl gap-x-4 px-4'>
          <DropdownMenuItem className='flex flex-col w-[100px] h-20 justify-center items-center  bg-neutral-100 cursor-pointer hover:bg-neutral-400 rounded-xl'>
            <LifeBuoyIcon className='w-[86px] h-[86px] ' />
            <span className='font-Rubik-Regular text-xl'>Help</span>
          </DropdownMenuItem>
          <DropdownMenuItem className='flex flex-col w-[100px] h-20 justify-center items-center  bg-neutral-100 cursor-pointer hover:bg-neutral-400 rounded-xl'>
            <WalletCards className='w-[86px] h-[86px] ' />
            <span className='font-Rubik-Regular text-xl'>Wallet</span>
          </DropdownMenuItem>
          <DropdownMenuItem className='flex flex-col w-[100px] h-20 justify-center items-center  bg-neutral-100 cursor-pointer hover:bg-neutral-400 rounded-xl'>
            <SquareChartGantt className='w-[86px] h-[86px] ' />
            <span className='font-Rubik-Regular text-xl'>Activity</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuGroup className='border-t-8 border-t-neutral-200 rounded-0  font-Rubik-Regular'>
          <DropdownMenuItem className='flex justify-start items-center text-lg font-Rubik-Regular gap-x-4 hover:bg-neutral-300 px-6 py-6'>
            <UserIcon className='size-8' />
            <span>Manage Account</span>
          </DropdownMenuItem>
          <DropdownMenuItem className='flex justify-start items-center text-lg font-Rubik-Regular gap-x-4 hover:bg-neutral-300 px-6 py-6'>
            <UserIcon className='size-8' />
            <span>Ride</span>
          </DropdownMenuItem>
          <DropdownMenuItem className='flex justify-start items-center text-lg font-Rubik-Regular gap-x-4 hover:bg-neutral-300 px-6 py-6'>
            <UserIcon className='size-8' />
            <span>Drive & deliver</span>
          </DropdownMenuItem>
          <DropdownMenuItem className='flex justify-start items-center text-lg font-Rubik-Regular gap-x-4 hover:bg-neutral-300 px-6 py-6'>
            <UserIcon className='size-8' />
            <span>Uber Eats</span>
          </DropdownMenuItem>
          <DropdownMenuItem className='flex justify-start items-center text-lg font-Rubik-Regular gap-x-4 hover:bg-neutral-300 px-6 py-6'>
            <UserIcon className='size-8' />
            <span>Uber for Business</span>
          </DropdownMenuItem>

        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
