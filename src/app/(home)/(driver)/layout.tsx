import React from 'react';
import { Navbar } from '@/components/shared/navbar/nav-bar';


interface DriverLayoutProps {
    children: React.ReactNode;
}


const DriverLayout = ({ children }: DriverLayoutProps) => {

    return (
        <div>
            <Navbar
                className='bg-primary text-white'
            />
            {children}
        </div>
    )
};

export default DriverLayout;