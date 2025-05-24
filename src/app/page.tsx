
import { Navbar } from "@/components/shared/navbar/nav-bar";
import { NavLinks } from "@/components/shared/navbar/nav-links";
import { Publiclinks } from "@/lib/constants";
import Link from "next/link";



export default async function Home() {

  return (
    <main className="w-full h-full bg-neutral-100">
      <Navbar
        className='bg-primary text-white'
      >
        <NavLinks
          type='Public'
          links={Publiclinks}
          className='text-sm px-6 py-2 font-Rubik-Medium bg-primary rounded-full hover:bg-neutral-700'
        />

        <div className='flex justify-start items-center gap-x-4 '>
          <Link href={'/login'} className='text-md px-6 font-Rubik-Medium rounded-full no-underline'>
            Login
          </Link>
          <Link href={'/signup'} className='text-md px-6 py-2 font-Rubik-Medium rounded-full bg-white hover:bg-white text-primary no-underline'>
            Sign up
          </Link>
        </div>
      </Navbar>

    </main>
  );
}
