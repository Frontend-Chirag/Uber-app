import { sessionData } from "@/types";
import { createResponseData, findEnumKey } from "@/lib/utils";
import { FlowType, ScreenType, FieldType, EventType } from "@/types";

export const getNextStep = (session: sessionData, sessionId: string) => {
    if (session.emailVerified && session.phoneVerified) {
        return getDetailsStep(sessionId);
    }

    if (!session.emailVerified) {
        return getEmailVerificationStep(sessionId, session);
    }

    return getPhoneVerificationStep(sessionId, session);
};

export const getDetailsStep = (sessionId: string) => {
    return createResponseData({
        flowType: FlowType.PROGRESSIVE_SIGN_UP,
        screenType: ScreenType.FIRST_NAME_LAST_NAME,
        fields: [
            { fieldType: findEnumKey(FieldType.FIRST_NAME)! },
            { fieldType: findEnumKey(FieldType.LAST_NAME)! },
        ],
        eventType: EventType.TypeInputDetails,
        sessionId
    });
};

export const getEmailVerificationStep = (sessionId: string, session: sessionData) => {
    return createResponseData({
        flowType: FlowType.PROGRESSIVE_SIGN_UP,
        screenType: ScreenType.EMAIL_ADDRESS_PROGESSIVE,
        fields: [
            {
                fieldType: findEnumKey(FieldType.EMAIL_ADDRESS)!,
                hintValue: session.email!,
                otpWidth: session.otp.value?.length
            }
        ],
        eventType: EventType.TypeEmailOTP,
        sessionId
    });
};

export const getPhoneVerificationStep = (sessionId: string, session: sessionData) => {
    return createResponseData({
        flowType: FlowType.PROGRESSIVE_SIGN_UP,
        screenType: ScreenType.PHONE_NUMBER_PROGRESSIVE,
        fields: [
            { fieldType: findEnumKey(FieldType.PHONE_COUNTRY_CODE)!, hintValue: session.phoneCountryCode! },
            { fieldType: findEnumKey(FieldType.PHONE_NUMBER)!, hintValue: session.phonenumber!, otpWidth: session.otp.value?.length },
        ],
        eventType: EventType.TypeSMSOTP,
        sessionId
    });
}; 