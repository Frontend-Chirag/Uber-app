import { db } from "@/lib/db/prisma";
import { cookies, headers } from 'next/headers';
import { FlowType, ScreenType, EventType, FieldType } from "@/types";
import { findEnumKey } from '@/lib/utils';
import { sendOTPEmail } from "@/server/services/email";
import { sendSMSMobile } from "@/server/services/sms";
import { Role } from "@prisma/client";
import {
    ConditionalResponseData
} from "./type";
import { HTTP_ERRORS, HTTP_STATUS, HTTP_SUCCESS } from "@/lib/constants";
import { getSessionManager } from "../../services/session/session-service";
import { } from "hono";
import { AuthSchema } from "@/validators/validate-server";
import { z } from "zod";
import { AuthResponseBuilder, AuthResponse } from "../response-builder";
import { ContentfulStatusCode } from "hono/utils/http-status";



const userSession = getSessionManager('USER');


interface AuthHandlersProps {
    fieldAnswers: FieldAnswers[];
    sessionId: string;
}

interface AuthHandler {
    flow: FlowType;
    screen: ScreenType;
    event: EventType;
    fieldAnswers: FieldAnswers[];
    sessionId: string;
}

type HandlerFunction = (
    props: AuthHandlersProps
) => Promise<AuthResponse>;

type EventHandlers = Partial<Record<EventType, HandlerFunction>>;
type ScreenHandlers = Partial<Record<ScreenType, EventHandlers>>;
type FlowHandlers = Partial<Record<FlowType, ScreenHandlers>>;

type FieldAnswers = z.infer<typeof AuthSchema>['screenAnswers']['fieldAnswers'][number];


export class AuthService {
    private static instance: AuthService;
    private handlers: FlowHandlers;
    private response: AuthResponseBuilder = new AuthResponseBuilder();
    private redirectLinks = {
        SIGN_UP: '/signup',
        LOGIN: '/login',
        HOME: '/',
        RIDER_DASBOARD: '/dashboard/rider'
    }


    private constructor() {
        this.handlers = {
            [FlowType.INITIAL]: {
                [ScreenType.PHONE_NUMBER_INITIAL]: {
                    [EventType.TypeInputMobile]: this.handlePhoneVerification.bind(this),
                    [EventType.TypeInputEmail]: this.handleEmailVerification.bind(this)
                },
            },
            [FlowType.SIGN_UP]: {
                [ScreenType.EMAIL_OTP_CODE]: {
                    [EventType.TypeEmailOTP]: this.handleVerifyEmailOtp.bind(this),
                    [EventType.TypeInputExistingEmail]: this.handleVerifyEmailOtp.bind(this)
                },
                [ScreenType.PHONE_OTP]: {
                    [EventType.TypeSMSOTP]: this.handleVerifyPhoneOtp.bind(this),
                    [EventType.TypeInputExistingPhone]: this.handleVerifyPhoneOtp.bind(this)
                },
            },
            [FlowType.PROGRESSIVE_SIGN_UP]: {
                [ScreenType.EMAIL_ADDRESS_PROGESSIVE]: {
                    [EventType.TypeInputEmail]: this.handleEmailVerification.bind(this)
                },
                [ScreenType.PHONE_NUMBER_PROGRESSIVE]: {
                    [EventType.TypeInputMobile]: this.handlePhoneVerification.bind(this)
                },
                [ScreenType.FIRST_NAME_LAST_NAME]: {
                    [EventType.TypeInputDetails]: this.handleInputDetails.bind(this)
                },
                [ScreenType.RESEND_OTP]: {
                    [EventType.TypeEmailOTP]: this.handleVerifyEmailOtp.bind(this),
                    [EventType.TypeInputExistingEmail]: this.handleVerifyEmailOtp.bind(this),
                    [EventType.TypeSMSOTP]: this.handleVerifyPhoneOtp.bind(this),
                    [EventType.TypeInputExistingPhone]: this.handleVerifyPhoneOtp.bind(this)
                }
            },
            [FlowType.FINAL_SIGN_UP]: {
                [ScreenType.AGREE_TERMS_AND_CONDITIONS]: {
                    [EventType.TypeCheckBox]: this.handleCreateAccount.bind(this)
                }
            },
            [FlowType.LOGIN]: {
                [ScreenType.EMAIL_OTP_CODE]: {
                    [EventType.TypeEmailOTP]: this.handleVerifyEmailOtp.bind(this)
                },
                [ScreenType.PHONE_OTP]: {
                    [EventType.TypeSMSOTP]: this.handleVerifyPhoneOtp.bind(this)
                },
            },
        }
    }

    public static async getInstance(): Promise<AuthService> {
        if (!AuthService.instance) {
            AuthService.instance = new AuthService();
        }
        return AuthService.instance;
    }

    // Main flow handler
    public async handleAuth(props: AuthHandler): Promise<AuthResponse> {
        try {
            const { flow, screen, event, fieldAnswers, sessionId } = props;
            const headersList = await headers();
            const forwardedFor = headersList.get('x-forwarded-for');
            const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : 'unknown';

            const state = userSession.createSession(props.sessionId, {
                flowType: FlowType.INITIAL,
                email: "",
                phoneCountryCode: "",
                phonenumber: "",
                firstname: "",
                lastname: "",
                isVerifiedEmail: false,
                isVerifiedPhonenumber: false,
                otp: {
                    value: "",
                    expiresAt: 0
                },
                eventType: undefined
            }, ip);


            if (!state) {
                return this.handleError(HTTP_ERRORS.INTERNAL_SERVER_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR, this.redirectLinks.HOME);
            }

            const handler = this.handlers[flow]?.[screen]?.[event];

            if (!handler) {
                return this.response
                    .setError('Something went wrong, try again')
                    .setRedirectUrl(this.redirectLinks.HOME)
                    .setSuccess(false)
                    .setStatus(HTTP_STATUS.BAD_REQUEST)
                    .build();
            }

            return await handler({ fieldAnswers, sessionId });
        } catch (error) {
            console.error('Auth error:', error);
            return this.handleError();
        }
    }

    // Core Authentication Methods
    public async login(userId: string, sessionId: string): Promise<AuthResponse> {
        try {
            const headersList = await headers();
            const cookieStore = await cookies();

            // Get device info
            const userAgent = headersList.get('user-agent') || 'unknown';
            const forwardedFor = headersList.get('x-forwarded-for');
            const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : 'unknown';

            const session = await db.session.create({
                data: {
                    user: {
                        connect: { id: userId }
                    },
                    ip,
                    device: userAgent,
                    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
                }
            });

            cookieStore.set('sessionId', session.sessionId);
            userSession.deleteSession(sessionId);

            return this.response
                .setRedirectUrl(this.redirectLinks.RIDER_DASBOARD)
                .setStatus(HTTP_STATUS.REDIRECT)
                .build();
        } catch (error) {
            console.log(error)
            return this.handleError();
        }
    }

    // Logout
    public async logout(): Promise<AuthResponse> {
        try {
            const cookieStore = await cookies();
            const sessionId = cookieStore.get('sessionId');

            if (sessionId) {
                // Delete session from database
                await db.session.delete({
                    where: {
                        sessionId: sessionId.value!
                    }
                });

                // Clear session cookie
                cookieStore.delete('sessionId');
            }

            return this.response
                .setRedirectUrl(this.redirectLinks.LOGIN)
                .setStatus(HTTP_STATUS.REDIRECT)
                .build();
        } catch (error) {
            console.log(error)
            return this.handleError();
        }
    }


    // Email Verification HandlerFunction
    public async handleEmailVerification({ fieldAnswers, sessionId }: AuthHandlersProps): Promise<AuthResponse> {
        try {
            const email = fieldAnswers[0].emailAddress as string;
            const existingUser = await db.user.findUnique({ where: { email } });
            const eventType = existingUser ? EventType.TypeInputExistingEmail : EventType.TypeEmailOTP;
            const otp = await sendOTPEmail({ email });

            // Update state
            const session = userSession.updateSession(sessionId, {
                email,
                flowType: FlowType.SIGN_UP,
                otp,
                eventType
            });

            if (!session) {
                return this.handleError('Session not found or expired', HTTP_STATUS.NOT_FOUND);
            }
            const { data } = session;

            return this.response
                .setForm({
                    flowType: data.flowType,
                    screens: {
                        screenType: ScreenType.EMAIL_OTP_CODE,
                        fields: [{
                            fieldType: findEnumKey(FieldType.EMAIL_OTP_CODE)!,
                            hintValue: data.email,
                            otpWidth: otp.value.length,
                            profileHint: existingUser ? {
                                firstname: existingUser?.firstname || '',
                                lastname: existingUser?.lastname || '',
                                phonenumber: existingUser?.phonenumber || '',
                                email: existingUser?.email || '',
                            } : null
                        }],
                        eventType
                    },
                    inAuthSessionId: sessionId,
                })
                .setStatus(HTTP_STATUS.OK)
                .build();
        } catch (error) {
            return this.handleError(error,);
        }
    }

    // Phone Verification
    public async handlePhoneVerification({ fieldAnswers, sessionId }: AuthHandlersProps): Promise<AuthResponse> {
        try {
            const phoneCountryCode = fieldAnswers[0].phoneCountryCode as string;
            const phonenumber = fieldAnswers[1].phoneNumber as string;
            const existingUser = await db.user.findUnique({ where: { phonenumber, phoneCountryCode } });
            const eventType = existingUser ? EventType.TypeInputExistingPhone : EventType.TypeSMSOTP;
            const otp = await sendSMSMobile({ phonenumber, phoneCountryCode });

            // Update state
            const session = userSession.updateSession(sessionId, {
                phonenumber,
                phoneCountryCode,
                flowType: FlowType.SIGN_UP,
                otp,
                eventType
            });

            if (!session) {
                return this.handleError('Session not found or expired', HTTP_STATUS.NOT_FOUND, '/signup');
            }

            const { data } = session;

            return this.response
                .setForm({
                    flowType: data.flowType,
                    screens: {
                        screenType: ScreenType.PHONE_OTP,
                        fields: [{
                            fieldType: findEnumKey(FieldType.PHONE_SMS_OTP)!,
                            hintValue: data.phonenumber,
                            otpWidth: otp.value.length,
                            profileHint: existingUser ? {
                                firstname: existingUser?.firstname || '',
                                lastname: existingUser?.lastname || '',
                                phonenumber: existingUser?.phonenumber || '',
                                email: existingUser?.email || '',
                            } : null
                        }],
                        eventType
                    },
                    inAuthSessionId: sessionId,
                })
                .setStatus(HTTP_STATUS.OK)
                .build();
        } catch (error) {
            console.log(error)
            return this.handleError();
        }
    }

    // OTP Verification
    public async handleVerifyEmailOtp({ fieldAnswers, sessionId }: AuthHandlersProps): Promise<AuthResponse> {
        try {
            const session = userSession.getSession(sessionId, null, null);

            if (!session) {
                return this.handleError('Session not found or expired', HTTP_STATUS.NOT_FOUND, '/signup');
            }

            const { data: userState } = session;

            const otpCode = fieldAnswers[0].emailOTPCode as string;

            if (userState?.otp?.value !== otpCode) {
                return this.handleError(HTTP_ERRORS.INVALID_EMAIL_OTP, HTTP_STATUS.UNAUTHORIZED);
            }

            if (userState?.eventType === EventType.TypeInputExistingEmail && userState.email) {
                const user = await db.user.findUnique({ where: { email: userState.email } });
                if (user) return await this.login(user.id, sessionId,);
            }

            const updatedSession = userSession.updateSession(sessionId, {
                isVerifiedEmail: true,
                flowType: FlowType.PROGRESSIVE_SIGN_UP,
                otp: { value: '', expiresAt: 0 }
            });

            return this.handleConditionalResponse(sessionId, updatedSession?.data!);
        } catch (error) {
            console.log('', error)
            return this.handleError(error,);
        }
    }

    // Phone OTP Verification
    public async handleVerifyPhoneOtp({ fieldAnswers, sessionId }: AuthHandlersProps): Promise<AuthResponse> {
        try {
            const session = userSession.getSession(sessionId, null, null);
            if (!session) {
                return this.handleError('Session not found or expired', HTTP_STATUS.NOT_FOUND, '/signup');
            }
            const { data: userState } = session;

            const otpCode = fieldAnswers[0].phoneOTPCode as string;

            if (userState?.otp?.value !== otpCode) {
                return this.handleError(HTTP_ERRORS.INVALID_PHONE_OTP, HTTP_STATUS.UNAUTHORIZED);
            }

            if (userState?.eventType === EventType.TypeInputExistingPhone && userState.phonenumber) {

                const user = await db.user.findUnique({
                    where: {
                        phonenumber: userState.phonenumber,
                        phoneCountryCode: userState.phoneCountryCode
                    }
                });

                if (user) return await this.login(user.id, sessionId,);
            }

            const updatedSession = userSession.updateSession(sessionId, {
                isVerifiedPhonenumber: true,
                flowType: FlowType.PROGRESSIVE_SIGN_UP,
                otp: { value: '', expiresAt: 0 }
            });

            return this.handleConditionalResponse(sessionId, updatedSession?.data!);
        } catch (error) {
            console.log('', error)
            return this.handleError();
        }
    }

    // User Details
    public async handleInputDetails({ fieldAnswers, sessionId }: AuthHandlersProps): Promise<AuthResponse> {
        try {
            const details = {
                firstname: fieldAnswers[0].firstName as string,
                lastname: fieldAnswers[1].lastName as string
            };

            userSession.updateSession(sessionId, details);

            return this.response
                .setForm({
                    flowType: FlowType.FINAL_SIGN_UP,
                    screens: {
                        screenType: ScreenType.AGREE_TERMS_AND_CONDITIONS,
                        fields: [{
                            fieldType: findEnumKey(FieldType.AGREE_TERMS_AND_CONDITIONS)!
                        }],
                        eventType: EventType.TypeCheckBox,
                    },
                    inAuthSessionId: sessionId
                })
                .setStatus(HTTP_STATUS.OK)
                .build();
        } catch (error) {
            console.log(, error)
            return this.handleError();
        }
    }

    public async handleCreateAccount({ sessionId }: AuthHandlersProps): Promise<AuthResponse> {
        try {
            const session = userSession.getSession(sessionId, null, null);
            const headersList = await headers();
            const userAgent = headersList.get('user-agent') || 'unknown';
            const ip = headersList.get('x-forwarded-for') || '127.0.0.1';

            if (!session) {
                return this.handleError('Session not found or expired', HTTP_STATUS.NOT_FOUND, '/signup');
            }

            const { data: {
                email,
                phoneCountryCode,
                phonenumber,
                lastname,
                firstname,
                isVerifiedEmail,
                isVerifiedPhonenumber,
            } } = session;

            const user = await db.user.create({
                data: {
                    email,
                    phoneCountryCode,
                    phonenumber,
                    lastname,
                    firstname,
                    isVerifiedEmail,
                    isVerifiedPhonenumber,
                    role: Role.rider,
                    Session: {
                        create: {
                            ip,
                            device: userAgent,
                            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                        }
                    }
                },
                include: {
                    Session: true
                }
            });

            if (user.Session) {
                cookieStore.set('sessionId', user.Session.sessionId);
            }

            return this.response
                .setRedirectUrl(`/${user.role}`)
                .setStatus(HTTP_STATUS.ok)
                .build();
        } catch (error) {
            console.log(error);
            return this.handleError();
        }
    }

    // Condition Based response
    private handleConditionalResponse(inAuthSessionId: string, data: ConditionalResponseData): AuthResponse {
        if (data.isVerifiedEmail && data.isVerifiedPhonenumber) {
            return this.response
                .setForm({
                    flowType: FlowType.PROGRESSIVE_SIGN_UP,
                    screens: {
                        screenType: ScreenType.FIRST_NAME_LAST_NAME,
                        fields: [
                            { fieldType: findEnumKey(FieldType.FIRST_NAME)! },
                            { fieldType: findEnumKey(FieldType.LAST_NAME)! },
                        ],
                        eventType: EventType.TypeInputDetails,
                    },
                    inAuthSessionId
                })
                .setStatus(HTTP_STATUS.OK)
                .build();
        }
        if (!data.isVerifiedEmail) {
            return this.response
                .setForm({
                    flowType: FlowType.PROGRESSIVE_SIGN_UP,
                    screens: {
                        screenType: ScreenType.EMAIL_ADDRESS_PROGESSIVE,
                        fields: [
                            {
                                fieldType: findEnumKey(FieldType.EMAIL_ADDRESS)!,
                                hintValue: data.email!,
                                otpWidth: data.otp?.value?.length
                            }
                        ],
                        eventType: EventType.TypeInputEmail,
                    },
                    inAuthSessionId
                })
                .setStatus(HTTP_STATUS.OK)
                .build();;
        }
        return this.response
            .setForm({
                flowType: FlowType.PROGRESSIVE_SIGN_UP,
                screens: {
                    screenType: ScreenType.PHONE_NUMBER_PROGRESSIVE,
                    fields: [
                        { fieldType: findEnumKey(FieldType.PHONE_COUNTRY_CODE)!, hintValue: data.phoneCountryCode! },
                        { fieldType: findEnumKey(FieldType.PHONE_NUMBER)!, hintValue: data.phonenumber!, otpWidth: data.otp?.value?.length },
                    ],
                    eventType: EventType.TypeInputMobile,
                },
                inAuthSessionId
            })
            .setStatus(HTTP_STATUS.OK)
            .build();;
    }

    // Error handler
    public handleError(error: unknown = HTTP_ERRORS.INTERNAL_SERVER_ERROR, statusCode: ContentfulStatusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, redirectUrl: string = ''): AuthResponse {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return this.response
            .setStatus(statusCode)
            .setError(errorMessage)
            .setSuccess(false)
            .setRedirectUrl(redirectUrl)
            .build();
    }
};


