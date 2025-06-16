import { AuthResponseForm } from "@/lib/config/response-builder";
import { EventType,  FlowType, ScreenType } from "@/types";
import { AuthSchema } from "@/validators/validate-server";
import { Admin, Role, User } from "@prisma/client";
import { Context, HonoRequest } from "hono";
import { z } from "zod";


type FieldAnswers = z.infer<typeof AuthSchema>['screenAnswers']['fieldAnswers'][number];

export type AuthResponse = Context & {
    redirectUrl?: string;
    message?: string;
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
    ctx: Context;
};

export interface ConditionalResponseData {
    flowType: FlowType;
    email: string;
    phoneCountryCode: string;
    phonenumber: string;
    firstname: string;
    lastname: string;
    isVerifiedEmail: boolean;
    isVerifiedPhonenumber: boolean;
    otp: {
        value: string;
        expiresAt: number;
    };
    eventType?: EventType;
    ip?: string
}




