import { HandleProps } from "@/types/auth";
import { AuthResponseBuilder } from "@/lib/response-builder";
import { handleAuthError, AuthError } from "@/lib/error-handler";
import { AUTH_ERRORS, AUTH_SUCCESS } from "@/lib/constants";
import { db } from "@/lib/db/prisma";
import { redisService } from "@/lib/db/redis";
import { FlowType } from "@/types";

import { getNextStep } from '@/lib/utils';

export async function handleVerifyEmailOtp({ session, fieldAnswers }: HandleProps) {
    try {
        const { data, sessionId } = session;


        const otpCode = fieldAnswers[0].emailOTPCode;

        if (data?.otp?.value !== otpCode) {
            throw new AuthError(AUTH_ERRORS.INVALID_EMAIL_OTP);
        }

        if (data?.flowState === FlowType.LOGIN) {
            const user = await db.user.findUnique({
                where: { email: data?.email! }
            });

            if (!user) {
                throw new AuthError(AUTH_ERRORS.USER_NOT_FOUND);
            }

            return new AuthResponseBuilder()
                .setStatus(200)
                .setSuccess(AUTH_SUCCESS.LOGIN)
                .setUser(user)
                .build();
        }

        const updatedSession = await redisService.updateFormSession(sessionId, {
            emailVerified: true,
            flowState: FlowType.PROGRESSIVE_SIGN_UP,
            otp: { value: '', expiresAt: 0 },
        });

        return new AuthResponseBuilder()
            .setStatus(200)
            .setForm(getNextStep(updatedSession, sessionId))
            .build();

    } catch (error) {
        return handleAuthError(error);
    }
}

export async function handleVerifyPhoneOtp({ session, fieldAnswers }: HandleProps) {
    try {
        const { data, sessionId } = session;
        const otpCode = fieldAnswers[0].phoneOTPCode!;

        if (data?.otp?.value !== otpCode) {
            throw new AuthError(AUTH_ERRORS.INVALID_PHONE_OTP);
        }

        if (data?.flowState === FlowType.LOGIN) {
            const user = await db.user.findUnique({
                where: {
                    phonenumber: data?.phonenumber!,
                    phoneCountryCode: data?.phoneCountryCode!
                }
            });

            if (!user) {
                throw new AuthError(AUTH_ERRORS.USER_NOT_FOUND);
            }

            return new AuthResponseBuilder()
                .setStatus(200)
                .setSuccess(AUTH_SUCCESS.LOGIN)
                .setUser(user)
                .build();
        }

        const updatedSession = await redisService.updateFormSession(sessionId, {
            phoneVerified: true,
            flowState: FlowType.PROGRESSIVE_SIGN_UP,
            otp: { value: '', expiresAt: 0 },
        });

        return new AuthResponseBuilder()
            .setStatus(200)
            .setForm(getNextStep(updatedSession, sessionId))
            .build();

    } catch (error) {
        return handleAuthError(error);
    }
} 