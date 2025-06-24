

import Link from 'next/link'
import React from 'react'
import { FaFacebook, FaInstagram, FaLinkedinIn, FaYoutubeSquare } from 'react-icons/fa';
import { Button } from '../ui/button';
import { Globe, MapPin } from 'lucide-react';

export const footerLinks = [
    {
        title: "Company",
        links: [
            { label: "About us", href: "/about" },
            { label: "Our offerings", href: "/offerings" },
            { label: "Newsroom", href: "/newsroom" },
            { label: "Investors", href: "/investors" },
            { label: "Blog", href: "/blog" },
            { label: "Careers", href: "/careers" },
        ],
    },
    {
        title: "Products",
        links: [
            { label: "Ride", href: "/ride" },
            { label: "Drive", href: "/drive" },
            { label: "Eat", href: "/eat" },
            { label: "Uber for Business", href: "/business" },
            { label: "Uber Freight", href: "/freight" },
            { label: "Gift cards", href: "/gift-cards" },
            { label: "Uber Health", href: "/health" },
        ],
    },
    {
        title: "Global citizenship",
        links: [
            { label: "Safety", href: "/safety" },
            { label: "Sustainability", href: "/sustainability" },
        ],
    },
    {
        title: "Travel",
        links: [
            { label: "Reserve", href: "/reserve" },
            { label: "Airports", href: "/airports" },
            { label: "Cities", href: "/cities" },
        ],
    },
];


export const Footer = () => {

    return (
        <footer className='bg-black  text-white '>
            <div className='max-w-screen-2xl mx-auto flex-flex-col px-24 py-20'>
                <h2 className='font-Rubik-Semibold text-2xl'>Uber</h2>
                <Link href='' className='text-md font-Rubik-Regular mt-8'>Visit Help Center</Link>
                <div className="max-w-7xl  flex flex-col lg:flex-row justify-between  mt-16">
                    {footerLinks.map((section) => (
                        <div key={section.title} className="min-w-[150px]">
                            <h3 className="font-Rubik-Semibold text-lg mb-4">{section.title}</h3>
                            <ul className="space-y-2">
                                {section.links.map((link) => (
                                    <li key={link.label}>
                                        <a
                                            href={link.href}
                                            className="text-sm text-white  hover:text-neutral-400 font-Rubik-Regular transition"
                                        >
                                            {link.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
                <div className='flex justify-between mt-16'>
                    <div className='w-[512px] flex justify-between'>
                        <Link href=''>
                            <FaFacebook />
                        </Link>
                        <Link href=''>
                            <FaInstagram />
                        </Link>
                        <Link href=''>
                            <FaLinkedinIn />
                        </Link>
                        <Link href=''>
                            <FaYoutubeSquare />
                        </Link>
                    </div>
                    <div className='flex '>
                        <Button className='flex gap-2 text-md font-Rubik-Regular text-white bg-transparent hover:bg-neutral-800 transition duration-500 rounded-md px-4 py-2'>
                            <Globe className='size-6' />
                            English
                        </Button>
                        <Button className='flex gap-2 text-md font-Rubik-Regular text-white bg-transparent hover:bg-neutral-800 transition duration-500 rounded-md px-4 py-2'>
                            <MapPin className='size-6' />
                            Delhi/NCR
                        </Button>

                    </div>
                </div>

                <div className='flex justify-between mt-16'>
                    <h5 className='text-[12px] text-neutral-400 font-Rubik-Regular'>© 2025 Uber Technologies Inc.</h5>
                    <div className='flex gap-10 '>
                        <Link href='' className='text-[12px] text-neutral-400 font-Rubik-Regular'>
                            Privacy
                        </Link>
                        <Link href='' className='text-[12px] text-neutral-400 font-Rubik-Regular'>
                            Accessibility
                        </Link>
                        <Link href='' className='text-[12px] text-neutral-400 font-Rubik-Regular'>
                            Terms
                        </Link>

                    </div>
                </div>
            </div>
        </footer>
    )
}
