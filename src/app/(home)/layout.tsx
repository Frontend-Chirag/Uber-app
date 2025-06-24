import React from 'react'

interface HomeLayout {
    children: React.ReactNode
}

export default function HomeLayout({ children }: HomeLayout) {
    return (
        <div className='w-full h-auto bg-white  flex flex-col relative'>
            {children}
        </div>
    )
}
