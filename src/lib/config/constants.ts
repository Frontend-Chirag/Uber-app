import { FieldType } from "@/types";
import { LucideCarFront, LucideIcon, LucidePackage } from "lucide-react";
import { IconType } from "react-icons";
import { FaShuttleVan } from "react-icons/fa";
import { MdCarRental } from 'react-icons/md';

export const options = {
    parse: JSON.parse,
    serialize: JSON.stringify
};

export const formatTime = (timeLeft: number) => {
    const seconds = timeLeft % 60;
    return `0:${seconds < 10 ? `0${seconds}` : seconds}`;
};

export const phoneCountryCodes = [
    { country: "India", code: "+91", initial: "In" },
    { country: "United States", code: "+1", initial: "US" },
    { country: "United Kingdom", code: "+44", initial: "UK" },
    { country: "Australia", code: "+61", initial: "Au" },
    { country: "Germany", code: "+49", initial: "De" },
    { country: "France", code: "+33", initial: "Fr" },
    { country: "Japan", code: "+81", initial: "Jp" },
    { country: "China", code: "+86", initial: "Cn" },
    { country: "Brazil", code: "+55", initial: "Br" },
    { country: "South Africa", code: "+27", initial: "SA" },
    { country: "Mexico", code: "+52", initial: "Mx" },
];

export const Publiclinks = [
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

export const PrivateLinks = [
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


export const AUTH_ERRORS = {
    INVALID_EMAIL_OTP: "Invalid email OTP",
    INVALID_PHONE_OTP: "Invalid phone OTP",
    USER_NOT_FOUND: "User not found",
    SESSION_NOT_FOUND: "Session data not found",
    USER_ALREADY_EXISTS: "User already exists",
    INTERNAL_SERVER_ERROR: "Internal server error",
    INVALID_TOKEN: "Invalid token",
    INVALID_REFRESH_TOKEN: "Invalid refresh token",
    MISSING_REQUIRED_FIELDS: "Missing required fields"
} as const;

export const AUTH_SUCCESS = {
    LOGIN: "Successfully logged in",
    SIGNUP: "Successfully signed up",
    LOGOUT: "Successfully logged out",
    EMAIL_VERIFIED: "Email verified successfully",
    PHONE_VERIFIED: "Phone verified successfully",
} as const; 
