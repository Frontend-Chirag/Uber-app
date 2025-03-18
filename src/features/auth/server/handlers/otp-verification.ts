import { HandleProps } from "@/types/auth";
import { AuthResponseBuilder } from "@/lib/response-builder";
import { handleAuthError, AuthError } from "@/lib/error-handler";
import { AUTH_ERRORS, AUTH_SUCCESS } from "../utils/constants";
import { db } from "@/lib/db";
import { redisService } from "@/features/auth/server/utils/redis";
import { FlowType } from "@/types";
import { getNextStep } from "../utils/navigation";

export async function handleVerifyEmailOtp({ session, fieldAnswers }: HandleProps) {
    try {
        const { sessiondata, sessionId } = session;

        const otpCode = fieldAnswers[0].emailOTPCode!;

        if (sessiondata.otp.value !== otpCode) {
            throw new AuthError(AUTH_ERRORS.INVALID_EMAIL_OTP);
        }

        if (sessiondata.flowState === FlowType.LOGIN) {
            const user = await db.user.findUnique({
                where: { email: sessiondata.email! }
            });

            if (!user) {
                throw new AuthError(AUTH_ERRORS.USER_NOT_FOUND);
            }

            const userWithType = { ...user, type: user.role };

            return new AuthResponseBuilder()
                .setStatus(200)
                .setSuccess(AUTH_SUCCESS.LOGIN)
                .setUser(userWithType)
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
        const { sessiondata, sessionId } = session;
        const otpCode = fieldAnswers[0].phoneOTPCode!;

        if (sessiondata.otp.value !== otpCode) {
            throw new AuthError(AUTH_ERRORS.INVALID_PHONE_OTP);
        }

        if (sessiondata.flowState === FlowType.LOGIN) {
            const user = await db.user.findUnique({
                where: {
                    phonenumber: sessiondata.phonenumber!,
                    phoneCountryCode: sessiondata.phoneCountryCode!
                }
            });

            if (!user) {
                throw new AuthError(AUTH_ERRORS.USER_NOT_FOUND);
            }

            const userWithType = { ...user, type: user.role };

            return new AuthResponseBuilder()
                .setStatus(200)
                .setSuccess(AUTH_SUCCESS.LOGIN)
                .setUser(userWithType)
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