"use server"

import { HandleProps } from "@/types/auth";
import { AuthResponseBuilder } from "@/lib/api/response-builder";
import { handleAuthError, AuthError } from "@/lib/utils/error-handler";
import { AUTH_ERRORS, AUTH_SUCCESS } from "@/lib/config/constants";
import { db } from "@/lib/db/prisma";
import { redisService } from "@/lib/db/redis";
import { EventType, FlowType } from "@/types";
import {  getNextStep } from '@/lib/utils/utils';
import { login } from "./auth";

export async function handleVerifyEmailOtp({ session, fieldAnswers }: HandleProps) {
    try {
        const { data, sessionId } = session;


        const otpCode = fieldAnswers[0].emailOTPCode;

        if (data?.otp?.value !== otpCode) {
            throw new AuthError(AUTH_ERRORS.INVALID_EMAIL_OTP);
        }

        if (data?.eventType === EventType.TypeInputExistingEmail && data.email) {
            return await login(data.email)
        }

        const updatedSession = await redisService.updateFormSession(sessionId, {
            emailVerified: true,
            flowType: FlowType.PROGRESSIVE_SIGN_UP,
            otp: { value: '', expiresAt: 0 },
        });

        return new AuthResponseBuilder()
            .setStatus(200)
            .setSuccess(true)
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

        if (data?.flowType === FlowType.LOGIN) {
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
                .setSuccess(true)
                .setUser(user)
                .build();
        }

        const updatedSession = await redisService.updateFormSession(sessionId, {
            phoneVerified: true,
            flowType: FlowType.PROGRESSIVE_SIGN_UP,
            otp: { value: '', expiresAt: 0 },
        });

        return new AuthResponseBuilder()
            .setStatus(200)
            .setSuccess(true)
            .setForm(getNextStep(updatedSession, sessionId))
            .build();

    } catch (error) {
        return handleAuthError(error);
    }
} 