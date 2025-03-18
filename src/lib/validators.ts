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


export const AuthSchema = z.object({
    flowType: z.nativeEnum(FlowType),
    screenAnswers: z.object({
        screenType: z.nativeEnum(ScreenType),
        eventType: z.nativeEnum(EventType),
        fieldAnswers: z.array(
            z.object({
                fieldType: z.nativeEnum(FieldType)
            }).passthrough()
        ).superRefine((fieldAnswers, ctx) => {
            fieldAnswers.forEach((answer, index) => {
                const fieldType = answer.fieldType;
                const validationSchema = FieldValidationSchema[fieldType];

                if (!validationSchema) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: `Invalid field type: ${fieldType}`,
                        path: [`fieldAnswers[${index}].fieldType`],
                    });
                    return;
                }

                const result = validationSchema.safeParse(answer[fieldType]);

                if (!result.success) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: `Invalid value for fieldType ${fieldType}: ${result.error.message}`,
                        path: [`fieldAnswers[${index}].${fieldType}`],
                    });
                }
            })
        })
    }),
    inAuthSessionID: z.string().nonempty("Session ID is required"),
});


export const validateInput = <T>(schema: z.ZodSchema<T>, data: unknown): T => {
    return schema.parse(data);
}; 