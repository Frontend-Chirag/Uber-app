import { z } from "zod";
import { Role } from "@prisma/client";

export const emailSchema = z.string().email();
export const phoneSchema = z.string().min(10).max(15);
export const otpSchema = z.string().min(4).max(6);

export const userDetailsSchema = z.object({
    firstname: z.string().min(2),
    lastname: z.string().min(2),
    email: emailSchema.nullable(),
    phoneCountryCode: z.string().min(2).nullable(),
    phonenumber: phoneSchema.nullable(),
    role: z.nativeEnum(Role)
});

export const validateInput = <T>(schema: z.ZodSchema<T>, data: unknown): T => {
    return schema.parse(data);
}; 