import { HandleProps } from "@/types/auth";
import { AuthResponseBuilder } from "@/lib/response-builder";
import { handleAuthError } from "@/lib/error-handler";
import { db } from "@/lib/db/prisma";
import { sendSMSMobile } from "@/helper/auth-helper";
import { EventType, FieldType, FlowType, ScreenType } from "@/types";
import { createResponseData, findEnumKey, getPhoneVerificationStep } from "@/lib/utils";
import { redisService } from "@/lib/db/redis";


export async function handlePhoneVerification({ session, fieldAnswers }: HandleProps) {
    try {
        const phoneCountryCode = fieldAnswers[0].phoneCountryCode as string;
        const phonenumber =  fieldAnswers[1].phoneNumber as string;

        const existingUser = await db.user.findUnique({
            where: { phonenumber, phoneCountryCode }
        });

        const flowState = existingUser ? FlowType.LOGIN : FlowType.SIGN_UP;
        const otp = await sendSMSMobile({ phonenumber, phoneCountryCode });

        const newSession = await redisService.updateFormSession(session.sessionId, {
            otp,
            phoneCountryCode,
            phonenumber,
            flowState,
        });

        return new AuthResponseBuilder()
            .setStatus(200)
            .setForm(createResponseData({
                flowType: newSession.flowState,
                sessionId: session.sessionId,
                screenType: ScreenType.PHONE_OTP,
                fields: [{
                    fieldType: findEnumKey(FieldType.PHONE_SMS_OTP)!,
                    hintValue: newSession.phonenumber!,
                    otpWidth: otp.value.length,
                }],
                eventType: EventType.TypeSMSOTP
            }))
            .build();

    } catch (error) {
        return handleAuthError(error);
    }
} 