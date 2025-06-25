
import Image, { StaticImageData } from "next/image";
import Link from "next/link";

import ridesharingimg from '@/app/assets/images/ridesharing-new.jpg';
import courierimg from '@/app/assets/images/Courier.png';
import hourlyimg from '@/app/assets/images/Hourly2021.png';
import shuttleimg from '@/app/assets/images/hcv_shuttle.png';
import rideimg from '@/app/assets/images/ride.png';
import reserveimg from '@/app/assets/images/reserve_clock.png';
import intercityimg from '@/app/assets/images/intercity.png';
import airportimg from '@/app/assets/images/Airport-Fall.jpg';
import watchimg from '@/app/assets/images/image-9.png';


import { PickupDateTimeSelector } from "@/components/shared/pickup-date-time-selector";
import { RideSearchPanel } from "@/components/shared/ride-search-panel";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/shared/nav-bar";
import { BenefitList } from "@/components/shared/Benefits-list";
import { Footer } from "@/components/shared/Footer";
import { Suggestions } from "@/components/shared/suggestions";
import { FloatingButton } from "@/components/shared/floating-button";
import { AspectRatio } from "@/components/ui/aspect-ratio";





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
    <main className=" bg-white  flex flex-col relative py-8">
      {/* Hero Section (Intro + Ride Search) */}
      <section
        id="searchpanel"
        className="grid xl:grid-cols-2 gap-8 p-6 lg:p-16 border"
      >
        {/* Left Column */}
        <div className="flex flex-col justify-start items-start">
          <h1 className="font-Rubik-Semibold lg:text-[52px] lg:leading-[64px] md:text-[44px] text-[36px]">
            Go anywhere with Uber
          </h1>
          <div className="max-w-md flex mt-5">
            <RideSearchPanel />
          </div>
        </div>

        {/* Right Column (Image) */}

        <div className="hidden xl:block w-full">
          <AspectRatio ratio={16 / 5}>
            <Image
              src={ridesharingimg}
              alt="Uber ridesharing"
              fill
              className="rounded-2xl object-cover"
            />
          </AspectRatio>
        </div>

      </section>


      {/* Suggestions (Card list) */}
      <section className="flex flex-col xl:px-16 px-8 ">
        <h2 className='font-Rubik-Semibold text-[32px] '>Suggestions</h2>
        <Suggestions />
      </section>

      {/* Log in CTA */}
      <section className='flex xl:flex-row flex-col xl:justify-between xl:items-center xl:p-16  p-6   '>
        <div className='xl:max-w-md w-full flex flex-col justify-start items-start'>
          <h2 className='font-Rubik-Semibold text-[32px] '>Log in to see your recent activity</h2>
          <div className='flex flex-col lg:mt-4 gap-y-4  '>
            <h3 className="font-Rubik-Regular text-md">View past trips, tailored suggestions, support resources, and more.</h3>
            <div className="flex flex-wrap justify-start items-end gap-y-4 gap-x-4">
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
        </div>
        <div className="relative w-full aspect-[3/2] xl:w-[576px] xl:aspect-[3/2] mt-8 xl:mt-0">
          <Image
            src={airportimg}
            alt="Airport"
            fill
            className="object-cover rounded-md"
            priority
          />
        </div>

      </section>

      {/* Plan Ahead (Date Picker + Benefits) */}
      <section className=' flex items-center lg:p-16 p-6 '>
        <div className='w-full  flex flex-col justify-start items-start'>
          <h2 className='font-Rubik-Semibold text-[32px] '>Plan for later</h2>
          <div className="w-full flex xl:flex-row flex-col gap-x-6 mt-6">
            <article className='flex flex-grow relative h-auto justify-start items-start gap-y-4 rounded-lg bg-[#9dcdd6] px-8 py-4 overflow-hidden'>
              <div className="max-w-sm flex flex-col mt-8 ">
                <h3 className='font-Rubik-Semibold text-[32px] leading-10'>Get your ride right with Uber Reserve</h3>
                <h4 className="font-Rubik-Regular text-xl mt-8">Choose date and time</h4>
                <div className='flex flex-col mt-2'>
                  <PickupDateTimeSelector />
                  <Button style={{ padding: '24px  20px' }} className="flex  text-lg mt-4 font-Rubik-Regular ">
                    Next
                  </Button>
                </div>
              </div>
              <Image
                src={watchimg}
                width={250}
                height={250}
                alt="image"
                className="absolute -right-6 -bottom-2 object-contain"
              />
            </article>
            <aside className='xl:max-w-sm w-full mt-4 xl:mt-0 p-4 flex flex-col border  rounded-lg'>
              <h3 className="font-Rubik-Medium text-xl">Benefits</h3>
              <BenefitList />
              <Link href='' className="text-lg font-Rubik-Light underline-dotted decoration-1 mt-6">see more</Link>
            </aside>
          </div>
        </div>

      </section>

      {/* Driver CTA */}
      <section className='flex xl:flex-row flex-col justify-between items-center lg:p-16  p-6 '>
        <div className="relative w-full aspect-[3/2] xl:w-[576px] xl:aspect-[3/2] mt-8 xl:mt-0">
          <Image
            src={airportimg}
            alt="Airport"
            fill
            className="object-cover rounded-md"
            priority
          />
        </div>
        <div className='xl:max-w-md w-full xl:mt-0 mt-4 flex flex-col  justify-start items-start'>
          <h2 className='font-Rubik-Semibold text-[32px] '>Drive when you want, make what you need</h2>
          <div className='flex flex-col mt-4 gap-y-4 '>
            <h3 className="font-Rubik-Regular text-md">Make money on your schedule with deliveries or rides—or both. You can use your own car or choose a rental through Uber.</h3>
            <div className="flex justify-start items-end gap-x-4">
              <Link
                href={''}
                className="w-fit px-8 py-2 text-lg font-Rubik-Regular mt-6 text-white bg-black hover:bg-neutral-900 rounded-md"
              >
                Get Started
              </Link>
              <Link
                href="/looking"
                className="w-fit relative inline-block pb-1 after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[1px] after:w-full after:bg-neutral-300
                                   before:content-[''] before:absolute before:left-0 before:bottom-0 before:h-[1px] before:w-0 before:bg-black
                                   before:transition-all before:duration-300 hover:before:w-full before:z-10"
              >
                Already have an account? Sign in
              </Link>
            </div>
          </div>
        </div>
      </section>
      <FloatingButton
        sectionId="searchpanel"
        type="Price"
        name="See price"
      />
    </main>
  );
};