import { HandleProps } from "@/types/auth";
import { AuthResponseBuilder } from "@/lib/response-builder";
import { handleAuthError } from "@/lib/error-handler";
import { db } from "@/lib/db/prisma";
import { sendOTPEmail } from "@/helper/auth-helper";
import { createResponseData, findEnumKey, getEmailVerificationStep } from '@/lib/utils';
import { EventType, FieldType, FlowType, ScreenType } from "@/types";
import { redisService } from "@/lib/db/redis";

export async function handleEmailVerification({ session, fieldAnswers }: HandleProps) {
    try {


        const email = fieldAnswers[0].emailAddress as string;

        const existingUser = await db.user.findUnique({
            where: { email }
        });

        const flowState = existingUser ? FlowType.LOGIN : FlowType.SIGN_UP;
        const otp = await sendOTPEmail({ email });

        const newSession = await redisService.updateFormSession(session.sessionId, {
            otp,
            email,
            flowState,
        });

        return new AuthResponseBuilder()
            .setStatus(200)
            .setForm(createResponseData({
                flowType: newSession.flowState,
                sessionId: session.sessionId,
                screenType: ScreenType.EMAIL_OTP_CODE,
                fields: [{
                    fieldType: findEnumKey(FieldType.EMAIL_OTP_CODE)!,
                    hintValue: newSession.email!,
                    otpWidth: otp.value.length,
                }],
                eventType: EventType.TypeEmailOTP
            }))
            .build();

    } catch (error) {
        return handleAuthError(error);
    }
} 