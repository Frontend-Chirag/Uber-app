import React from 'react'

interface HomeLayout {
    children: React.ReactNode
}

export default function HomeLayout({ children }: HomeLayout) {
    return (
        <div>
            {children}
        </div>
    )
}
