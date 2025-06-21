
import { Homescreen } from "@/components/shared/home-screen";
import { Navbar } from "@/components/shared/navbar/nav-bar";
import { NavLinks } from "@/components/shared/navbar/nav-links";
import { Publiclinks } from "@/lib/constants";
import Link from "next/link";


interface langpage {
  params: Promise<{
    country: string;
    lang: string;
  }>
}


export default async function LangPage({ params }: langpage) {

  const { country, lang } = await params;

  console.log(country, lang)

  return (
    <main className="w-full h-full bg-neutral-100">
      <Navbar
        className='bg-primary text-white'
      >


        <div className='flex justify-start items-center gap-x-4 '>
          <Link href={'/login'} className='text-md px-6 font-Rubik-Medium rounded-full no-underline'>
            Login
          </Link>
          <Link href={'/signup'} className='text-md px-6 py-2 font-Rubik-Medium rounded-full bg-white hover:bg-white text-primary no-underline'>
            Sign up
          </Link>
        </div>
      </Navbar>

      <Homescreen 
        title="Go anywhere with uber"
        image= {{
          src: '',
          alt: '',
          height: 0,
          width: 0
        }}
      />

    </main>
  );
};