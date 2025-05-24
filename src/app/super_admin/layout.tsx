import React from 'react';
import { Navbar } from '@/components/shared/navbar/nav-bar';


interface AdminLayoutProps {
    children: React.ReactNode;
}


const AdminLayout = ({ children }: AdminLayoutProps) => {

    return (
        <div className='flex flex-col  max-h-screen h-screen  gap-4'>
            <Navbar
                className='bg-primary text-white'
            />
            {children}
        </div>
    )
};

export default AdminLayout 