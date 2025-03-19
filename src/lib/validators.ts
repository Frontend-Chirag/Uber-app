import { z } from "zod";
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

// Zod Schema for Authentication Payload
export const AuthSchema = z.object({
    flowType: z.nativeEnum(FlowType),
    inAuthSessionID: z.string().nullable(),
    screenAnswers: z.object({
        screenType: z.nativeEnum(ScreenType),
        eventType: z.nativeEnum(EventType),
        fieldAnswers: z.array(
            z.object({
                fieldType: z.enum(Object.keys(FieldType) as [keyof typeof FieldType]), // Enum validation for fieldType
            }).passthrough() // Allow extra dynamic fields
        ).superRefine((fieldAnswers, ctx) => {
            fieldAnswers.forEach((answer, index) => {
                const fieldType = FieldType[answer.fieldType];

                const validationSchema = FieldValidationSchema[fieldType]; // Get the correct schema

                if (!validationSchema) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: `Invalid field type: ${fieldType}`,
                        path: [`fieldAnswers[${index}].fieldType`],
                    });
                    return;
                }

                // Validate the dynamic field (e.g., emailAddress, phoneNumber)
                const result = validationSchema.safeParse(answer);

                if (!result.success) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: `Invalid value for fieldType ${fieldType}: ${result.error.errors.map(e => e.message).join(", ")}`,
                        path: [`fieldAnswers[${index}]`],
                    });
                }
            });
        })
    }),
});



export const validateInput = <T>(schema: z.ZodSchema<T>, data: unknown): T => {
    return schema.parse(data);
}; 