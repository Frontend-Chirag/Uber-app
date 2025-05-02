import React from 'react';
import { Navbar } from '@/components/shared/navbar/nav-bar';


interface AdminLayoutProps {
    children: React.ReactNode;
}


const AdminLayout = ({ children }: AdminLayoutProps) => {

    return (
        <div>
            <Navbar
                className='bg-primary text-white'
            />
            {children}
        </div>
    )
};

export default AdminLayout 