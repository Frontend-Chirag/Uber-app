import {Loader2Icon } from 'lucide-react'

export const ScreenLoader = () => {

  return (
    <div className='w-full h-full '>
      <Loader2Icon className='w-[100px] h-[100px] text-blue-700 animate-spin  flex mx-auto'/>
    </div>
  )
}
