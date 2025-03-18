import { z } from "zod";
import { Role } from "@prisma/client";
import { EventType, FieldType, FlowType, ScreenType } from "@/types";
import { FieldValidationSchema } from "@/components/fieldConfig";


const valueSchema = z.union([
    FieldValidationSchema[FieldType.PHONE_COUNTRY_CODE],
    FieldValidationSchema[FieldType.PHONE_NUMBER],
    FieldValidationSchema[FieldType.PHONE_SMS_OTP],
    FieldValidationSchema[FieldType.EMAIL_ADDRESS],
    FieldValidationSchema[FieldType.EMAIL_OTP_CODE],
    FieldValidationSchema[FieldType.FIRST_NAME],
    FieldValidationSchema[FieldType.LAST_NAME],
    FieldValidationSchema[FieldType.AGREE_TERMS_AND_CONDITIONS],
]);


export const AuthSchema = z.object({
    flowType: z.nativeEnum(FlowType),
    screenAnswers: z.object({
        screenType: z.nativeEnum(ScreenType),
        eventType: z.nativeEnum(EventType),
        fieldAnswers: z.array(z.object({
            fieldType: z.nativeEnum(FieldType),
            valueSchema
        }))
    }),
    inAuthSessionID: z.string().nonempty("Session ID is required"),
});


export const validateInput = <T>(schema: z.ZodSchema<T>, data: unknown): T => {
    return schema.parse(data);
}; 