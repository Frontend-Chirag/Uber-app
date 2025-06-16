import { LucideCarFront, LucidePackage } from "lucide-react";
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
] as const;

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
] as const;

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
] as const;


export const HTTP_ERRORS = {
    INVALID_EMAIL_OTP: 'Invalid email OTP',
    INVALID_PHONE_OTP: 'Invalid phone OTP',
    IP_NOT_FOUND: 'IP not found',
    USER_NOT_FOUND: 'User not found',
    INVALID_TOKEN: 'Invalid token',
    INVALID_CSRF_TOKEN: 'Invalid CSRF token',
    RATE_LIMIT_EXCEEDED: 'Rate limit exceeded',
    IP_BLOCKED: 'IP blocked',
    INTERNAL_SERVER_ERROR: 'Internal server error',
    MISSING_REQUIRED_FIELDS: 'Missing required fields',
    INVALID_FLOW_OR_SCREEN_TYPE: 'Invalid flow or screen type',
    TOO_MANY_REQUESTS: 'Too many requests',
    BAD_REQUEST: 'Bad request',
    UNAUTHORIZED: 'Unauthorized',
    FORBIDDEN: 'Forbidden',
    NOT_FOUND: 'Not found',
} as const;


export const HTTP_SUCCESS = {
    LOGIN: "Successfully logged in",
    SIGNUP: "Successfully signed up",
    LOGOUT: "Successfully logged out",
    EMAIL_VERIFIED: "Email verified successfully",
    PHONE_VERIFIED: "Phone verified successfully",
    TOO_MANY_REQUESTS: 'Too many requests'
} as const; 




export const HTTP_STATUS: Record<string, number> = {
    OK: 200,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500
} as const;

