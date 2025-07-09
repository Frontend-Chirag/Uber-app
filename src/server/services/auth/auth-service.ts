import { db } from "@/lib/db/prisma";
import { cookies, headers } from 'next/headers';
import { FlowType, ScreenType, EventType, FieldType } from "@/types";
import { findEnumKey } from '@/lib/utils';
import { sendOTPEmail } from "@/server/services/email";
import { sendSMSMobile } from "@/server/services/sms";
import { Role } from "@prisma/client";
import { HTTP_ERRORS, HTTP_STATUS, HTTP_SUCCESS } from "@/lib/constants";
import { getSessionManager } from "../../services/session/session-service";
import { AuthSchema } from "@/validators/validate-server";
import { z } from "zod";
import { BaseResponse, BaseResponseBuilder } from "../response-builder";
import { ContentfulStatusCode } from "hono/utils/http-status";
import { geolocation } from "@/server/utils/geolocation";


export const authUserSession = getSessionManager('AUTH_SESSION');
export const userSession = getSessionManager('USER_SESSION');


interface AuthHandlersProps {
    screen: ScreenType;
    fieldAnswers: FieldAnswers[];
    event: EventType;
    sessionId: string;
}

interface AuthHandler {
    flow: FlowType;
    screen: ScreenType;
    event: EventType;
    fieldAnswers: FieldAnswers[];
    sessionId: string;
}

interface AuthFields {
    fieldType: string;
    hintValue?: string;
    profileHint?: {
        firstname: string,
        lastname: string,
        phonenumber: string,
        email: string
    } | null;
    otpWidth?: number;
};

type AuthForm = {
    flowType: FlowType;
    screens: {
        screenType: ScreenType;
        fields: AuthFields[];
        eventType: EventType;
    };
    inAuthSessionId: string;
};

type AuthResponse = {
    form?: AuthForm;
    redirectUrl?: string;
};

interface ConditionalResponseData {
    flowType: FlowType;
    email: string;
    phoneCountryCode: string;
    phonenumber: string;
    firstname: string;
    lastname: string;
    isVerifiedEmail: boolean;
    isVerifiedPhonenumber: boolean;
    otp: {
        value: string;
        expiresAt: number;
    };
    eventType?: EventType;
    ip?: string
}

type HandlerFunction = (
    props: AuthHandlersProps
) => Promise<BaseResponse<AuthResponse>>;

type EventHandlers = Partial<Record<EventType, HandlerFunction>>;
type ScreenHandlers = Partial<Record<ScreenType, EventHandlers>>;
type FlowHandlers = Partial<Record<FlowType, ScreenHandlers>>;

type FieldAnswers = z.infer<typeof AuthSchema>['screenAnswers']['fieldAnswers'][number];


export class AuthService {
    private static instance: AuthService;
    private handlers: FlowHandlers;
    private response: BaseResponseBuilder<AuthResponse> = new BaseResponseBuilder<AuthResponse>();

    private constructor() {
        this.handlers = {
            [FlowType.INITIAL]: {
                [ScreenType.PHONE_NUMBER_INITIAL]: {
                    [EventType.TypeInputMobile]: this.handleVerification.bind(this),
                    [EventType.TypeInputEmail]: this.handleVerification.bind(this)
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
                [ScreenType.RESEND_OTP]: {
                    [EventType.TypeEmailOTP]: this.handleResendOTP.bind(this),
                    [EventType.TypeSMSOTP]: this.handleResendOTP.bind(this),
                }
            },
            [FlowType.PROGRESSIVE_SIGN_UP]: {
                [ScreenType.EMAIL_ADDRESS_PROGESSIVE]: {
                    [EventType.TypeInputEmail]: this.handleVerification.bind(this)
                },
                [ScreenType.PHONE_NUMBER_PROGRESSIVE]: {
                    [EventType.TypeInputMobile]: this.handleVerification.bind(this)
                },
                [ScreenType.FIRST_NAME_LAST_NAME]: {
                    [EventType.TypeInputDetails]: this.handleInputDetails.bind(this)
                }
            },
            [FlowType.FINAL_SIGN_UP]: {
                [ScreenType.AGREE_TERMS_AND_CONDITIONS]: {
                    [EventType.TypeCheckBox]: this.handleCreateAccount.bind(this)
                }
            },
            // [FlowType.LOGIN]: {
            //     [ScreenType.EMAIL_OTP_CODE]: {
            //         [EventType.TypeEmailOTP]: this.handleVerifyEmailOtp.bind(this)
            //     },
            //     [ScreenType.PHONE_OTP]: {
            //         [EventType.TypeSMSOTP]: this.handleVerifyPhoneOtp.bind(this)
            //     },
            // },
        }
    }

    public static async getInstance(): Promise<AuthService> {
        if (!AuthService.instance) {
            AuthService.instance = new AuthService();
        }
        return AuthService.instance;
    }

    // Main flow handler
    public async handleAuth(props: AuthHandler): Promise<BaseResponse<AuthResponse>> {
        try {
            const { flow, screen, event, fieldAnswers, sessionId } = props;
            const headersList = await headers();
            const visitorId = headersList.get('x-visitor-id') || '';

            // Rate limiting check (early)
            const isLimited = await getSessionManager('AUTH_SESSION').checkRateLimit(visitorId);

            if (isLimited) {
                return this.handleError('Too many requests, please try again later', HTTP_STATUS.TOO_MANY_REQUESTS,);
            }

            let session;

            if (!sessionId) {
                session = await authUserSession.createSession({
                    data: {
                        email: '',
                        phonenumber: '',
                        firstname: '',
                        lastname: '',
                        flowType: FlowType.INITIAL,
                        isVerifiedEmail: false,
                        isVerifiedPhonenumber: true,
                        otp: {
                            expiresAt: 0,
                            value: '0'
                        },
                        phoneCountryCode: '',
                        eventType: EventType.TypeEmailOTP
                    },
                    visitorId,
                })
            }

            const handler = this.handlers[flow]?.[screen]?.[event];

            if (!handler) {
                return this.handleError('Something went wrong, try again', HTTP_STATUS.BAD_REQUEST);
            }

            return await handler({ screen, event, fieldAnswers, sessionId: session ? session.id : sessionId });
        } catch (error) {
            console.error('Auth error:', error);
            return this.handleError();
        }
    }

    // Core Authentication Methods
    public async login(userId: string, sessionId: string): Promise<BaseResponse<AuthResponse>> {
        try {
            const headersList = await headers();
            const cookieStore = await cookies();
            const visitorId = headersList.get('x-visitor-id') || '';
            const { country } = await geolocation.getGeolocation();

            // Create a new Redis session for the user (30 days)
            const session = await userSession.createSession({
                data: { userId },
                visitorId, // Optionally, pass a real fingerprint if available
                ttlMs: 30 * 24 * 60 * 60 * 1000 // 30 days
            });

            if (session) {
                cookieStore.set('x-uber-session', session.id, {
                    httpOnly: true,
                    secure: true,
                    sameSite: 'lax', // or 'strict' if you prefer
                    maxAge: 30 * 24 * 60 * 60 // 30 days in seconds
                });
            }
            // Clean up the short-lived auth session
            authUserSession.deleteSession(sessionId);

            return this.response
                .setData({ redirectUrl: `/${country}/en/rider-home` })
                .setStatus(HTTP_STATUS.OK)
                .setMessage(HTTP_SUCCESS.LOGIN)
                .build();
        } catch (error) {
            console.log('Login Error:', error)
            return this.handleError();
        }
    }

    // Logout
    public async logout(): Promise<BaseResponse<AuthResponse>> {
        try {
            const cookieStore = await cookies();
            const sessionId = cookieStore.get('x-uber-session');
            if (sessionId) {
                await userSession.deleteSession(sessionId.value!);
                cookieStore.delete('x-uber-session');
            }
            return this.response
                .setData({})
                .setStatus(HTTP_STATUS.OK)
                .setMessage(HTTP_SUCCESS.LOGOUT)
                .build();
        } catch (error) {
            console.log('Logout Error:', error)
            return this.handleError();
        }
    }


    // handle verification handler
    private async handleVerification({ event, fieldAnswers, sessionId }: AuthHandlersProps
    ): Promise<BaseResponse<AuthResponse>> {
        try {
            const isEmail = event === EventType.TypeInputEmail ? true : event === EventType.TypeInputMobile ? false : undefined;

            let contact: { email?: string; phonenumber?: string; phoneCountryCode?: string } = {};
            let existingUser;
            let eventType: EventType;
            let otp;

            if (isEmail) {
                contact.email = fieldAnswers[0].emailAddress as string;
                existingUser = await db.user.findUnique({ where: { email: contact.email } });
                eventType = existingUser ? EventType.TypeInputExistingEmail : EventType.TypeEmailOTP;
                otp = await sendOTPEmail({ email: contact.email });
            } else {
                contact.phoneCountryCode = fieldAnswers[0].phoneCountryCode as string;
                contact.phonenumber = fieldAnswers[1].phoneNumber as string;
                existingUser = await db.user.findUnique({
                    where: {
                        phonenumber: contact.phonenumber,
                        phoneCountryCode: contact.phoneCountryCode
                    }
                });
                eventType = existingUser ? EventType.TypeInputExistingPhone : EventType.TypeSMSOTP;
                otp = await sendSMSMobile({
                    phonenumber: contact.phonenumber,
                    phoneCountryCode: contact.phoneCountryCode
                });
            }

            // Update state
            const session = await authUserSession.updateSession(sessionId, {
                ...contact,
                flowType: FlowType.SIGN_UP,
                otp,
                eventType
            });


            if (!session) {
                return this.handleError('Session not found or expired', HTTP_STATUS.NOT_FOUND);
            }

            const { data } = session;
            const screenType = isEmail ? ScreenType.EMAIL_OTP_CODE : ScreenType.PHONE_OTP;
            const fieldType = isEmail ?
                findEnumKey(FieldType.EMAIL_OTP_CODE)! :
                findEnumKey(FieldType.PHONE_SMS_OTP)!;
            const hintValue = isEmail ? data.email! : data.phonenumber!;

            return this.response
                .setData({
                    form: {
                        flowType: data.flowType,
                        screens: {
                            screenType,
                            fields: [{
                                fieldType,
                                hintValue,
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
                    }
                })
                .setStatus(HTTP_STATUS.OK)
                .build();
        } catch (error) {
            console.error(`Verification Error:`, error);
            return this.handleError();
        }
    }

    // Add new resend OTP method
    public async handleResendOTP({ event, sessionId }: AuthHandlersProps): Promise<BaseResponse<AuthResponse>> {
        try {
            const session = await authUserSession.getSession(sessionId);
            const isEmail = event === EventType.TypeEmailOTP ? true : event === EventType.TypeSMSOTP ? false : undefined;

            if (!session) {
                return this.handleError('Session not found or expired', HTTP_STATUS.NOT_FOUND);
            }

            const { data } = session;
            let otp;

            if (isEmail) {
                if (!data.email) {
                    return this.handleError('Email not found in session', HTTP_STATUS.BAD_REQUEST);
                }
                otp = await sendOTPEmail({ email: data.email });

            } else {
                if (!data.phonenumber || !data.phoneCountryCode) {
                    return this.handleError('Phone number not found in session', HTTP_STATUS.BAD_REQUEST);
                }
                otp = await sendSMSMobile({
                    phonenumber: data.phonenumber,
                    phoneCountryCode: data.phoneCountryCode
                });
            }
            // Update session with new OTP
            authUserSession.updateSession(sessionId, { otp });

            return this.response
                .setData({})
                .setStatus(HTTP_STATUS.OK)
                .setMessage(`OTP has been sent to your ${isEmail ? 'Email address' : 'Phone Number'}`)
                .build();
        } catch (error) {
            console.error('Resend OTP Error:', error);
            return this.handleError();
        }
    }

    // OTP Verification
    public async handleVerifyEmailOtp({ fieldAnswers, sessionId }: AuthHandlersProps): Promise<BaseResponse<AuthResponse>> {
        try {
            const session = await authUserSession.getSession(sessionId);

            if (!session) {
                return this.handleError('Session not found or expired', HTTP_STATUS.NOT_FOUND);
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

            const updatedSession = await authUserSession.updateSession(sessionId, {
                isVerifiedEmail: true,
                flowType: FlowType.PROGRESSIVE_SIGN_UP,
                otp: { value: '', expiresAt: 0 }
            });

            return this.handleConditionalResponse(sessionId, updatedSession?.data!);
        } catch (error) {
            console.log('Email otp verification error:', error)
            return this.handleError();
        }
    }

    // Phone OTP Verification
    public async handleVerifyPhoneOtp({ fieldAnswers, sessionId }: AuthHandlersProps): Promise<BaseResponse<AuthResponse>> {
        try {
            const session = await authUserSession.getSession(sessionId);
            if (!session) {
                return this.handleError('Session not found or expired', HTTP_STATUS.NOT_FOUND);
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

            const updatedSession = await authUserSession.updateSession(sessionId, {
                isVerifiedPhonenumber: true,
                flowType: FlowType.PROGRESSIVE_SIGN_UP,
                otp: { value: '', expiresAt: 0 }
            });

            return this.handleConditionalResponse(sessionId, updatedSession?.data!);
        } catch (error) {
            console.log('Phone otp verification error:', error)
            return this.handleError();
        }
    }

    // User Details
    public async handleInputDetails({ fieldAnswers, sessionId }: AuthHandlersProps): Promise<BaseResponse<AuthResponse>> {
        try {
            const details = {
                firstname: fieldAnswers[0].firstName as string,
                lastname: fieldAnswers[1].lastName as string
            };

            authUserSession.updateSession(sessionId, details);

            return this.response
                .setData({
                    form: {

                        flowType: FlowType.FINAL_SIGN_UP,
                        screens: {
                            screenType: ScreenType.AGREE_TERMS_AND_CONDITIONS,
                            fields: [{
                                fieldType: findEnumKey(FieldType.AGREE_TERMS_AND_CONDITIONS)!
                            }],
                            eventType: EventType.TypeCheckBox,
                        },
                        inAuthSessionId: sessionId
                    }
                })
                .setStatus(HTTP_STATUS.OK)
                .build();
        } catch (error) {
            console.log('Input Details Error:', error)
            return this.handleError();
        }
    }

    public async handleCreateAccount({ sessionId }: AuthHandlersProps): Promise<BaseResponse<AuthResponse>> {
        try {
            const authSession = await authUserSession.getSession(sessionId);
            const cookieStore = await cookies();
            const { country } = await geolocation.getGeolocation();



            if (!authSession) {
                return this.handleError('Session not found or expired', HTTP_STATUS.NOT_FOUND);
            }

            const { data: {
                email,
                phoneCountryCode,
                phonenumber,
                lastname,
                firstname,
                isVerifiedEmail,
                isVerifiedPhonenumber,
            } } = authSession;

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
                },
            });

            const session = await userSession.createSession({
                data: {
                    userId: user.id
                },
                visitorId: authSession.visitorId || '',
                ttlMs: 30 * 24 * 60 * 60 * 1000

            })

            if (session) {
                cookieStore.set('x-uber-session', session.id);
            }

            return this.response
                .setData({ redirectUrl: `/${country}/en/rider-home` })
                .setStatus(HTTP_STATUS.ok)
                .build();
        } catch (error) {
            console.log('Create Account Error:', error);
            return this.handleError();
        }
    }

    // Condition Based response
    private handleConditionalResponse(inAuthSessionId: string, data: ConditionalResponseData): BaseResponse<AuthResponse> {
        if (data.isVerifiedEmail && data.isVerifiedPhonenumber) {
            return this.response
                .setData({
                    form: {
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
                    }
                })
                .setStatus(HTTP_STATUS.OK)
                .build();
        }
        if (!data.isVerifiedEmail) {
            return this.response
                .setData({
                    form: {

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
                    }
                })
                .setStatus(HTTP_STATUS.OK)
                .build();;
        }
        return this.response
            .setData({
                form: {

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
                }
            })
            .setStatus(HTTP_STATUS.OK)
            .build();;
    }

    public handleError(
        clientMessage: string = HTTP_ERRORS.INTERNAL_SERVER_ERROR,
        statusCode: ContentfulStatusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR,
        logError?: unknown,
        context: string = 'UnknownContext'
    ): BaseResponse<AuthResponse> {
        const logMessage =
            logError instanceof Error
                ? logError.stack || logError.message
                : typeof logError === 'string'
                    ? logError
                    : JSON.stringify(logError);

        console.error(`[AUTH ERROR][${context}] ${clientMessage} →`, logMessage);

        return this.response
            .setStatus(statusCode)
            .setError(clientMessage)
            .setSuccess(false)
            .setData({})
            .build();
    }

};


