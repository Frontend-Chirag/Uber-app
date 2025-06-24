import React from 'react'
import { Clock3Icon } from 'lucide-react';
import { FaCalendar } from 'react-icons/fa';



export const BenefitList = () => (
    <ul className="flex flex-col mt-4 gap-y-4">
        <li className="flex items-center justify-start  px-6 py-2">
            <FaCalendar className="size-6 mr-6" />
            <p className="text-md font-Rubik-Regular">Choose your exact pickup time up to 90 days in advance.</p>
        </li>
        <li className="flex items-center justify-start  px-6 py-2">
            <Clock3Icon className="size-6 mr-6" />
            <p className="text-md font-Rubik-Regular">Extra wait time included to meet your ride.</p>
        </li>
        <li className="flex items-center justify-start  px-6 py-2">
            <FaCalendar className="size-6 mr-6" />
            <p className="text-mdfont-Rubik-Regular">Cancel at no charge up to 60 minutes in advance</p>
        </li>
    </ul>
);
