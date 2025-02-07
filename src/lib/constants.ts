import { LucideCarFront, LucideIcon, LucidePackage } from "lucide-react";
import { IconType } from "react-icons";
import { FaShuttleVan } from "react-icons/fa";
import { MdCarRental } from 'react-icons/md';
import { link } from "./types";


export const Publiclinks: link[] = [
    {
        name: 'Ride',
        link: '/',
        isActive: true
    },
    {
        name: 'Drive',
        link: '#',
        isActive: false
    },
    {
        name: 'Business',
        link: '#',
        isActive: false
    },
    {
        name: 'About',
        link: '#',
        isActive: false
    },
];

export const PrivateLinks: link[] = [
    {
        name: 'Ride',
        link: '/uber.home',
        icon: LucideCarFront,
        isActive: true
    },
    {
        name: 'Package',
        link: '#',
        icon: LucidePackage,
        isActive: false
    },
    {
        name: 'Rentals',
        link: '#',
        icon: MdCarRental,
        isActive: false
    },
    {
        name: 'Shuttle',
        link: '#',
        icon: FaShuttleVan,
        isActive: false
    },
];
