import { FieldType } from "@/types";
import * as z from 'zod';

export const FieldValidationSchema = {
    [FieldType.PHONE_COUNTRY_CODE]: z.string().min(1, "Select a country code"),
    [FieldType.PASSWORD]: z.string().min(8, 'Password must be at least 8 characters')
        .max(100, 'Password is too long')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    [FieldType.PHONE_NUMBER]: z.string().regex(/^\d{10,15}$/, "Phone number must be between 10 to 15 digits"),
    [FieldType.PHONE_SMS_OTP]: z.string().regex(/^\d+$/, "Phone number must be numeric"),
    [FieldType.EMAIL_ADDRESS]: z.string().email("Invalid email address"),
    [FieldType.EMAIL_OTP_CODE]: z.string().length(4, "OTP must be 4 digits"),
    [FieldType.FIRST_NAME]: z.string().nonempty("First name is required"),
    [FieldType.LAST_NAME]: z.string().nonempty("Last name is required"),
    [FieldType.AGREE_TERMS_AND_CONDITIONS]: z.boolean()
        .refine((value) => value === true, {
            message: "You must agree to the terms and conditions",
        }),
};