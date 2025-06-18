import { Hono } from 'hono';
import { AuthService } from '@/server/services/auth/auth-service';
import { v4 as uuid } from 'uuid';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { FlowType, ScreenType, EventType, FieldType } from '@/types';
import { FieldValidationSchema } from '@/validators/validate-client';
import { HTTP_STATUS } from '@/lib/constants';
import { AuthResponse } from '../services/response-builder';


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

const getClientErrorMessage = (error: any): string => {
    if (error instanceof z.ZodError) {
        return 'Please check your input and try again.';
    }

    if (error.message?.includes('validation')) {
        return 'Please check your input and try again.';
    }

    if (error.message?.includes('session')) {
        return 'Your session has expired. Please log in again.';
    }

    if (error.message?.includes('permission')) {
        return 'You do not have permission to perform this action.';
    }

    if (error.message?.includes('rate limit')) {
        return 'Too many attempts. Please try again later.';
    }

    return 'Something went wrong. Please try again later.';
};

const app = new Hono()
    .post('/submit', zValidator('json', AuthSchema), async (ctx) => {
        try {
            const { flowType, inAuthSessionId, screenAnswers } = ctx.req.valid('json');
            const sessionId = inAuthSessionId || uuid();

            const response = await authService.handleAuth({
                flow: flowType,
                screen: screenAnswers.screenType,
                event: screenAnswers.eventType,
                fieldAnswers: screenAnswers.fieldAnswers,
                sessionId,
            });

            return ctx.json(response, response.status);
        } catch (error) {
            console.error('Auth error:', error);
            const errorResponse: AuthResponse = {
                success: false,
                status: error instanceof z.ZodError ? HTTP_STATUS.BAD_REQUEST : HTTP_STATUS.INTERNAL_SERVER_ERROR,
                error: getClientErrorMessage(error)
            };
            return ctx.json(errorResponse, errorResponse.status);
        }
    });

export default app;
