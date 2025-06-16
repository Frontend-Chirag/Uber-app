import { Hono } from 'hono';
import { AuthService } from '@/server/services/auth/auth-service';
import { v4 as uuid } from 'uuid';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { FlowType, ScreenType, EventType, FieldType } from '@/types';
import { FieldValidationSchema } from '@/validators/validate-client';


export const AuthSchema = z.object({
    flowType: z.nativeEnum(FlowType),
    inAuthSessionId: z.string(),
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

const authService = await AuthService.getInstance();


const app = new Hono()
    .post('/submit', zValidator('json', AuthSchema), async (ctx) => {
        const { flowType, inAuthSessionId, screenAnswers } = ctx.req.valid('json');

        const sessionId = inAuthSessionId || uuid()

        return await authService.handleAuth({
            flow: flowType,
            screen: screenAnswers.screenType,
            event: screenAnswers.eventType,
            fieldAnswers: screenAnswers.fieldAnswers,
            sessionId,
            ctx
        })

    });

export default app;
