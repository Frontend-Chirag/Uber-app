import { AuthResponseForm } from "@/lib/config/response-builder";
import { EventType,  FlowType, ScreenType } from "@/types";
import { AuthSchema } from "@/validators/validate-server";
import { Admin, Role, User } from "@prisma/client";
import { z } from "zod";


type FieldAnswers = z.infer<typeof AuthSchema>['screenAnswers']['fieldAnswers'][number];

export type AuthResponse = {
    status: number;
    success: boolean;
    error?: string;
    user?: User | Admin;
    form?: AuthResponseForm
}

export type AuthRequest = {
    json: {
        flowType: FlowType;
        screenAnswers: {
            eventType: EventType;
            screenType: ScreenType;
            fieldAnswers: FieldAnswers[];
        },
        inAuthSessionId: string;
    }
}

export interface AuthServiceProps {
    fieldAnswers: FieldAnswers[];
    sessionId: string;
};

export interface AuthData {
    flowType: FlowType;
    email: string;
    phoneCountryCode: string;
    phonenumber: string;
    firstname: string;
    lastname: string;
    role: Role;
    isVerifiedEmail: boolean;
    isVerifiedPhonenumber: boolean;
    otp: {
        value: string;
        expiresAt: number;
    };
    eventType?: EventType;
    ip?: string
}

export interface AuthState {
    sessionId: string;
    createdAt: number;
    lastActivity: number;
    data: AuthData
};



export const AUTH_ERRORS = {
    INVALID_EMAIL_OTP: 'Invalid email OTP',
    INVALID_PHONE_OTP: 'Invalid phone OTP',
    IP_NOT_FOUND: 'IP not found',
    USER_NOT_FOUND: 'User not found',
    INVALID_TOKEN: 'Invalid token',
    INVALID_CSRF_TOKEN: 'Invalid CSRF token',
    RATE_LIMIT_EXCEEDED: 'Rate limit exceeded',
    IP_BLOCKED: 'IP blocked',
    INTERNAL_SERVER_ERROR: 'Internal server error',
    MISSING_REQUIRED_FIELDS: 'Missing required fields'
} as const;

export const AUTH_SUCCESS = {
    LOGIN: "Successfully logged in",
    SIGNUP: "Successfully signed up",
    LOGOUT: "Successfully logged out",
    EMAIL_VERIFIED: "Email verified successfully",
    PHONE_VERIFIED: "Phone verified successfully",
} as const; 

