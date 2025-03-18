import { User } from "./user";
import { FieldType, ResponseDataReturnProps, Session } from "@/types";

export interface FieldAnswers {
    emailAddress?: string;
    phoneCountryCode?: string;
    phoneNumber?: string;
    emailOTPCode?: string;
    phoneOTPCode?: string;
    firstname?: string;
    lastname?: string;
}

export interface AuthResponse {
    status: number;
    error?: string;
    success?: string;
    user?: User;
    form?: ResponseDataReturnProps;
}

export interface HandleProps {
    session: Session;
    fieldAnswers: {
        fieldType: FieldType,
    }[];
} 