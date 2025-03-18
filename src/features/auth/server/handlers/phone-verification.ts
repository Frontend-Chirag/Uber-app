import { HandleProps } from "@/types/auth";
import { AuthResponseBuilder } from "@/lib/response-builder";
import { handleAuthError } from "@/lib/error-handler";
import { db } from "@/lib/db";
import { sendSMSMobile } from "../utils";
import { FlowType, ScreenType, FieldType, EventType } from "@/types";
import { createResponseData, findEnumKey } from "@/lib/utils";
import { redisService } from "@/features/auth/server/utils/redis";

export async function handlePhoneVerification({ session, fieldAnswers }: HandleProps) {
    try {
        const phoneCountryCode = fieldAnswers[0].phoneCountryCode!;
        const phonenumber =  fieldAnswers[1].phoneNumber!;

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