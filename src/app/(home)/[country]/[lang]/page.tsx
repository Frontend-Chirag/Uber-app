
import { Homescreen } from "@/components/shared/home-screen";
import ridesharing from '@/app/assets/images/ridesharing-new.jpg';
import Link from "next/link";
import { Navbar } from "@/components/shared/nav-bar";


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
    <main className="w-full h-full bg-neutral-100 px-8 flex flex-col">
      <Navbar
        theme="LIGHT"
      />

      <Homescreen
        title="Go anywhere with uber"
        src={ridesharing}
      />

    </main>
  );
};