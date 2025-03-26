"use server"

import { HandleProps } from "@/types/auth";
import { AuthResponseBuilder } from "@/lib/api/response-builder";
import { handleAuthError } from "@/lib/utils/error-handler";
import { db } from "@/lib/db/prisma";
import { EventType, FieldType, FlowType, ScreenType } from "@/types";
import { createResponseData, findEnumKey } from "@/lib/utils/utils";
import { redisService } from "@/lib/db/redis";
import { sendSMSMobile } from "@/services/sms";


export async function handlePhoneVerification({ session, fieldAnswers }: HandleProps) {
    try {
        const phoneCountryCode = fieldAnswers[0].phoneCountryCode as string;
        const phonenumber = fieldAnswers[1].phoneNumber as string;

        const existingUser = await db.user.findUnique({
            where: { phonenumber, phoneCountryCode }
        });

        const eventType = existingUser ? EventType.TypeInputExistingEmail : EventType.TypeEmailOTP;
        const otp = await sendSMSMobile({ phonenumber, phoneCountryCode });

        const newSession = await redisService.updateFormSession(session.sessionId, {
            otp,
            phoneCountryCode,
            phonenumber,
            flowType: FlowType.SIGN_UP,
            eventType
        });

        return new AuthResponseBuilder()
            .setStatus(200)
            .setSuccess(true)
            .setForm(createResponseData({
                flowType: newSession.flowType,
                sessionId: session.sessionId,
                screenType: ScreenType.PHONE_OTP,
                fields: [{
                    fieldType: findEnumKey(FieldType.PHONE_SMS_OTP)!,
                    hintValue: newSession.phonenumber!,
                    otpWidth: otp.value.length,
                    profileHint: {
                        firstname: existingUser?.firstname || '',
                        lastname: existingUser?.lastname || '',
                        phonenumber: existingUser?.phonenumber || '',
                        email: existingUser?.email || '',
                    }
                }],
                eventType
            }))
            .build();

    } catch (error) {
        return handleAuthError(error);
    }
} 