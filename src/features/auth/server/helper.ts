"use server"

import { EventType, FieldType, FlowType, ScreenType, Session } from "@/types";
import { sendOTPEmail, sendSMSMobile } from "./utils";
import { updateFormSession } from "@/lib/redis";
import { createResponseData, findEnumKey } from "@/lib/utils";
import { db } from "@/lib/db";



interface HandleProps {
    session: Session;
    fieldAnswers: any;
}

const handleEmailVerification = async ({ session, fieldAnswers }: HandleProps) => {

    const { sessionId } = session;
    const email = fieldAnswers[0].emailAddress;
    const existingUser = await db.user.findUnique({
        where: {
            email
        }
    })

    const flowState = existingUser ? FlowType.LOGIN : FlowType.SIGN_UP

    // Send OTP to the provided email address
    const otp = await sendOTPEmail({ email });
    // Update session with OTP and email information
    const newSession = await updateFormSession(session.sessionId, {
        otp,
        email,
        flowState,
    });

    return createResponseData({
        flowType: newSession.flowState,
        sessionId,
        screenType: ScreenType.EMAIL_OTP_CODE,
        fields: [
            {
                fieldType: findEnumKey(FieldType.EMAIL_OTP_CODE)!,
                hintValue: newSession.email!,
                otpWidth: otp.value.length,
            },
        ],
        eventType: EventType.TypeEmailOTP
    });
};

const handlePhoneVerification = async ({ session, fieldAnswers }: HandleProps) => {
    const { sessionId } = session;
    const phoneCountryCode = fieldAnswers[0].phoneCountryCode;
    const phonenumber = fieldAnswers[1].phoneNumber;

    const existingUser = await db.user.findUnique({
        where: {
            phonenumber,
            phoneCountryCode
        }
    });

    const flowState = existingUser ? FlowType.LOGIN : FlowType.SIGN_UP;

    const otp = await sendSMSMobile({ phonenumber, phoneCountryCode });

    // Update session with OTP and phone information
    const newSession = await updateFormSession(sessionId, {
        otp,
        phoneCountryCode,
        phonenumber,
        flowState,
    });

    return createResponseData({
        flowType: newSession.flowState,
        sessionId,
        screenType: ScreenType.PHONE_OTP,
        fields: [
            {
                fieldType: findEnumKey(FieldType.PHONE_SMS_OTP)!,
                hintValue: newSession.phonenumber!,
                otpWidth: otp.value.length,
            },
        ],
        eventType: EventType.TypeSMSOTP
    })
};

const handleVerifyEmailOtp = async ({ session, fieldAnswers }: HandleProps) => {
    const { sessiondata, sessionId } = session;
    const isVerified = sessiondata.otp.value === fieldAnswers[0].emailOTPCode;

    if (!isVerified) {
        return { status: 400, error: 'Invalid email OTP' };
    }

    const isLogin = sessiondata.flowState === FlowType.LOGIN;

    if (isLogin) {
        const user = await db.user.findUnique({
            where: {
                email: sessiondata.email!
            }
        });

        if (!user) return { status: 400, error: 'User not found' };

        // TODO: COOKIES

        return { status: 200, success: 'Login successful', user };
    }

    // Update session upon successful verification
    const updatedSession = await updateFormSession(sessionId, {
        emailVerified: true,
        flowState: FlowType.PROGRESSIVE_SIGN_UP,
        otp: { value: '', expiresAt: 0 }, // Clear OTP after use
    });


    return getNextStep(updatedSession, sessionId);
}

const handleVerifyPhoneOtp = async ({ session, fieldAnswers }: HandleProps) => {
    const { sessiondata, sessionId } = session;
    const isVerified = sessiondata.otp.value === fieldAnswers[0].phoneOTPCode;

    if (!isVerified) {
        return { status: 400, error: 'Invalid phone OTP' };
    }

    const isLogin = sessiondata.flowState === FlowType.LOGIN;

    if (isLogin) {
        const user = await db.user.findUnique({
            where: {
                phonenumber: sessiondata.phonenumber!,
                phoneCountryCode: sessiondata.phoneCountryCode!
            }
        });

        if (!user) return { status: 400, error: 'User not found' };

        // TODO: COOKIES


        return { status: 200, success: 'Login successful', user };
    }

    // Update session upon successful verification
    const updatedSession = await updateFormSession(sessionId, {
        phoneVerified: true,
        flowState: FlowType.PROGRESSIVE_SIGN_UP,
        otp: { value: '', expiresAt: 0 }, // Clear OTP after use
    });
    return getNextStep(updatedSession, sessionId);
}

const handleInputDetails = async ({ session, fieldAnswers }: HandleProps) => {
    const { sessionId } = session;

    updateFormSession(sessionId, {
        firstname: fieldAnswers[0].firstname,
        lastname: fieldAnswers[1].lastname
    });

    return createResponseData({
        flowType: FlowType.FINAL_SIGN_UP,
        screenType: ScreenType.AGREE_TERMS_AND_CONDITIONS,
        fields: [{ fieldType: findEnumKey(FieldType.AGREE_TERMS_AND_CONDITIONS)! }],
        eventType: EventType.TypeCheckBox,
        sessionId
    })
}

const handleCreateAccount = async ({ session, fieldAnswers }: HandleProps) => {

    const sessiondata = session.sessiondata;

    if (!sessiondata) return { status: 400, error: 'Session data not found' };

    const { firstname, lastname, email, phoneCountryCode, phonenumber } = sessiondata;

    const user = await db.user.create({
        data: {
            firstname,
            lastname,
            email,
            phoneCountryCode,
            phonenumber
        }
    });

    return { status: 200, success: 'Account created successfully', user };
}

const getNextStep = (session: any, sessionId: string) => {
    // If both email and phone are verified, finalize the flow
    if (session.emailVerified && session.phoneVerified) {
        updateFormSession(sessionId, {
            otp: { value: '', expiresAt: 0 },
        });
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
    }

    // Prompt for email input if not verified
    if (!session.emailVerified) {
        return createResponseData({
            flowType: FlowType.PROGRESSIVE_SIGN_UP,
            screenType: ScreenType.EMAIL_ADDRESS_PROGESSIVE,
            fields: [
                { fieldType: findEnumKey(FieldType.EMAIL_ADDRESS)! }
            ],
            eventType: EventType.TypeInputEmail,
            sessionId
        })
    }

    // Prompt for phone input if not verified
    if (!session.phoneVerified) {
        return createResponseData({
            flowType: FlowType.PROGRESSIVE_SIGN_UP,
            screenType: ScreenType.PHONE_NUMBER_PROGRESSIVE,
            fields: [
                { fieldType: findEnumKey(FieldType.PHONE_COUNTRY_CODE)! },
                { fieldType: findEnumKey(FieldType.PHONE_NUMBER)! },
            ],
            eventType: EventType.TypeInputMobile,
            sessionId
        })
    }
};