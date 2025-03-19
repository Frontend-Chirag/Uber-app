import { z } from "zod";
import { EventType, FieldType, FlowType, ScreenType } from "@/types";
import { FieldValidationSchema } from "./validate-client";


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
                const { fieldType, ...rest } = answer;
                const validationSchema = FieldValidationSchema[FieldType[fieldType]]; // Get the correct schema
                const dyanmicValue = rest[Object.keys(rest)[0]];

                if (!validationSchema) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: `Invalid field type: ${fieldType}`,
                        path: [`fieldAnswers[${index}].fieldType`],
                    });
                    return;
                }
                const result = validationSchema.safeParse(dyanmicValue);

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