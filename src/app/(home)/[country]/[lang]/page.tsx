
import Image, { StaticImageData } from "next/image";

import ridesharingimg from '@/app/assets/images/ridesharing-new.jpg';
import courierimg from '@/app/assets/images/Courier.png';
import hourlyimg from '@/app/assets/images/Hourly2021.png';
import shuttleimg from '@/app/assets/images/hcv_shuttle.png';
import rideimg from '@/app/assets/images/ride.png';
import reserveimg from '@/app/assets/images/reserve_clock.png';
import intercityimg from '@/app/assets/images/intercity.png';
import airportimg from '@/app/assets/images/Airport-Fall.jpg';
import watchimg from '@/app/assets/images/image-9.png';

import { Navbar } from "@/components/shared/nav-bar";
import { DateTimePicker, RideLocation } from "@/components/shared/ride.-location";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FaCalendar } from "react-icons/fa";
import { Clock3Icon } from "lucide-react";





interface langpage {
  params: Promise<{
    country: string;
    lang: string;
  }>
}

type SuggestionType = {
  suggestionName: string;
  image: string | StaticImageData
  details: string;
  link: string;
}

const suggestions: SuggestionType[] = [
  {
    suggestionName: 'Ride',
    image: rideimg,
    details: 'Go anywhere with Uber. Request a ride, hop in, and go.',
    link: ''
  },
  {
    suggestionName: 'Reserve',
    image: reserveimg,
    details: 'Reserve your ride in advance so you can relax on the day of your trip.',
    link: ''
  },
  {
    suggestionName: 'Intercity',
    image: intercityimg,
    details: 'Get convenient, affordable outstation cabs anytime at your door.',
    link: ''
  },
  {
    suggestionName: 'Shuttle',
    image: shuttleimg,
    details: 'Lower-cost shared rides on professionally driven buses and vans.',
    link: ''
  },
  {
    suggestionName: 'Courier',
    image: courierimg,
    details: 'Uber makes same-day item delivery easier than ever.',
    link: ''
  },
  {
    suggestionName: 'Rentals',
    image: hourlyimg,
    details: 'Request a trip for a block of time and make multiple stops.',
    link: ''
  },

]


export default async function LangPage({ params }: langpage) {

  const { country, lang } = await params;

  return (
    <main className="w-full h-full bg-white px-8 flex flex-col">
      <Navbar
        theme="LIGHT"
      />

      <section className='flex  justify-between items-center p-16 mt-[64px] '>
        <div className='max-w-lg  flex flex-col justify-start items-start'>
          <h1 className='font-Rubik-Semibold text-[52px] leading-[64px]'>Go anywhere with Uber</h1>
          <div className='max-w-md flex mt-4 '>
            <RideLocation />
          </div>
        </div>
        <div className='w-[576] h-[384] hidden lg:flex  '>
          <Image
            src={ridesharingimg}
            alt={'image'}
            objectFit='cover'
            className='rounded-md'
          />
        </div>
      </section>

      <section className="flex flex-col px-16">
        <h1 className='font-Rubik-Semibold text-[32px] '>Suggestions</h1>
        <ul className="grid grid-cols-3 gap-4 mt-8">
          {suggestions.map((suggestion, idx) => (
            <li key={idx} className="flex p-4  bg-neutral-100 rounded-lg relative">
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
          ))}

        </ul>
      </section>

      <section className='flex  justify-between items-center p-16  '>
        <div className='max-w-md  flex flex-col justify-start items-start'>
          <h1 className='font-Rubik-Semibold text-[32px] '>Log in to see your recent activity</h1>
          <div className='flex flex-col mt-4 gap-y-4 '>
            <h2 className="font-Rubik-Regular text-md">View past trips, tailored suggestions, support resources, and more.</h2>
            <Link
              href={''}
              className="w-fit px-8 py-2 text-lg font-Rubik-Regular mt-6 text-white bg-black hover:bg-neutral-900 rounded-md"
            >
              Log in to your account
            </Link>
            <Link
              href="/looking"
              className="w-fit relative inline-block pb-1 after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[1px] after:w-full after:bg-neutral-300
                                   before:content-[''] before:absolute before:left-0 before:bottom-0 before:h-[1px] before:w-0 before:bg-black
                                   before:transition-all before:duration-300 hover:before:w-full before:z-10"
            >
              Don’t have an Uber account? Sign up
            </Link>
          </div>
        </div>
        <div className='w-[576] h-[384] hidden lg:flex  '>
          <Image
            src={airportimg}
            alt={'image'}
            objectFit='cover'
            className='rounded-md'
          />
        </div>
      </section>

      <section className=' flex items-center p-16  '>
        <div className='w-full  flex flex-col justify-start items-start'>
          <h1 className='font-Rubik-Semibold text-[32px] '>Plan for later</h1>
          <div className="w-full   flex gap-x-6 mt-6">
            <div className='flex flex-grow relative h-auto justify-start items-start gap-y-4 rounded-lg bg-[#9dcdd6] px-8 py-4 overflow-hidden'>
              <div className="max-w-sm flex flex-col mt-8 ">
                <h1 className='font-Rubik-Semibold text-[32px] leading-10'>Get your ride right with Uber Reserve</h1>
                <h2 className="font-Rubik-Regular text-xl mt-8">Choose date and time</h2>
                <div className='flex flex-col mt-2'>
                  <DateTimePicker />
                  <Button style={{ padding: '24px  20px' }} className="flex  text-lg mt-4 font-Rubik-Regular ">
                    Next
                  </Button>
                </div>
              </div>
              <Image
                src={watchimg}
                 width={250}
                 height={250}
                 objectFit="contain"
                alt="image"
                className="absolute -right-6 -bottom-2"
              />
            </div>
            <div className='max-w-sm p-4 flex flex-col border  rounded-lg'>
              <h2 className="font-Rubik-Medium text-xl">Benefits</h2>
              <ul className="flex flex-col mt-4 gap-y-4">
                <li className="flex items-center justify-start  px-6 py-2">
                  <FaCalendar className="size-6 mr-6" />
                  <p className="text-md font-Rubik-Regular">Choose your exact pickup time up to 90 days in advance.</p>
                </li>
                <li className="flex items-center justify-start  px-6 py-2">
                  <Clock3Icon className="size-6 mr-6" />
                  <p className="text-md font-Rubik-Regular">Extra wait time included to meet your ride.</p>
                </li>
                <li className="flex items-center justify-start  px-6 py-2">
                  <FaCalendar className="size-6 mr-6" />
                  <p className="text-mdfont-Rubik-Regular">Cancel at no charge up to 60 minutes in advance</p>
                </li>
              </ul>
              <Link href='' className="text-lg font-Rubik-Light underline-dotted decoration-1 mt-6">see more</Link>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
};