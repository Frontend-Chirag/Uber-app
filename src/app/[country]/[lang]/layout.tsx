

import { Footer } from '@/components/shared/Footer';
import { Header } from '@/components/shared/header';
import Link from 'next/link';
import React from 'react'

interface HomeLayout {
    children: React.ReactNode
}

export default function LandPageLayout({ children }: HomeLayout) {
    return (
        <div className='w-full h-auto bg-white  flex flex-col relative'>
            <Header />
            {children}
            <Footer />
        </div>
    )
}
