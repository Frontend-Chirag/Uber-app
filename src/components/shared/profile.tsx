

import React from 'react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Button } from '../ui/button'
import { ChevronDown } from 'lucide-react'

export const Profile = () => {

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className='flex justify-center items-center text-sm font-Rubik-Regular rounded-full px-3'>
          chirag
          <ChevronDown />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='border-red-300'>
        <DropdownMenuLabel>
          <p className='font-Rubik-Semibold text-xl'>Chirag kashyap</p>
          <Avatar>
            <AvatarImage src='https://d1w2poirtb3as9.cloudfront.net/default.jpeg?Expires=1750793685&Signature=Ok782SEjPGazA5dEroIxYehfi8P5VWAqn4Q2jUXmznYyklUZQ6a7lYyD1JPd-L61kXJ-I6oaqfhmxTVJQ2tBmX05b4HsH1piHRGjvTHa5ypHxtyauNKHkZ9BeVyGgHwg4jWKmgeR6IFe6tRsw6pATPLTmU1-ml3qD6Is3Pi98mxGyRdQHRJewUP3sZKfraiSKynHSyGG6mdddudAtsoq9LnuueaIgoaqQx0fMCcd7ejoSmM3aDDjuQdOFEau~8rLnWLPHbRmkzubbdyzr~b08y0seeGPK-hpOGH1n~567T3mDf9lRrvuR03ByUrsRzsUappoU5uCZQSDE3bUowL9zw__&Key-Pair-Id=K36LFL06Z5BT10' />
            <AvatarFallback>CK</AvatarFallback>
          </Avatar>
        </DropdownMenuLabel>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
