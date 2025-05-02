import { db } from "@/lib/db/prisma";
import { generateTokens, clearSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { headers, cookies } from 'next/headers';
import { FlowType, ScreenType, EventType, FieldType } from "@/types";
import { findEnumKey } from '@/lib/utils';
import { sendOTPEmail } from "@/services/email";
import { sendSMSMobile } from "@/services/sms";
import { Role, User } from "@prisma/client";
import {
    AuthServiceProps,
    AuthResponse,
    AuthState,
    AUTH_ERRORS,
    AuthData
} from "./type";
import { AuthResponseBuilder } from "@/lib/config/response-builder";
import { HTTP_STATUS } from "@/lib/constants";
import { getSessionManager } from "../session/session-service";



type HandlerFunction = (props: AuthServiceProps) => Promise<AuthResponse>;
type EventHandlers = Partial<Record<EventType, HandlerFunction>>;
type ScreenHandlers = Partial<Record<ScreenType, EventHandlers>>;
type FlowHandlers = Partial<Record<FlowType, ScreenHandlers>>;


const userSession = getSessionManager('USER');

export class AuthService {
    private static instance: AuthService;
    private handlers: FlowHandlers;
    private response: AuthResponseBuilder;

    private constructor() {
        this.response = new AuthResponseBuilder();
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
    public async handleAuth(flow: FlowType, screen: ScreenType, event: EventType, props: AuthServiceProps, role: Role): Promise<AuthResponse> {
        try {
            const { fieldAnswers, sessionId } = props;
            const headersList = await headers();
            const forwardedFor = headersList.get('x-forwarded-for');
            const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : 'unknown';

            console.log('Handler Ip:', ip)

            if (!(await userSession.checkRateLimit(ip))) {
                return this.handleError(new Error("Too many requests"), HTTP_STATUS.TOO_MANY_REQUESTS);
            }

            if (!props.sessionId && !(await userSession.checkSessionLimit(ip))) {
                return this.handleError(new Error('Maximum number of sessions reached.'), HTTP_STATUS.TOO_MANY_REQUESTS);
            }

            await userSession.cleanupExpiredSessions();
            await userSession.cleanupRateLimits();

            const state = userSession.createSession(props.sessionId, {
                flowType: FlowType.INITIAL,
                email: "",
                phoneCountryCode: "",
                phonenumber: "",
                firstname: "",
                lastname: "",
                role,
                isVerifiedEmail: false,
                isVerifiedPhonenumber: false,
                otp: {
                    value: "",
                    expiresAt: 0
                },
                eventType: undefined
            }
                , ip);

            if (!state) {
                this.handleError(AUTH_ERRORS.INTERNAL_SERVER_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR)
            }

            const handler = this.handlers[flow]?.[screen]?.[event];

            if (!handler) {
                return this.handleError(new Error('Invalid flow or screen type'), HTTP_STATUS.BAD_REQUEST);
            }

            return await handler({ fieldAnswers, sessionId });
        } catch (error) {
            return this.handleError(error);
        }
    }

    // Core Authentication Methods
    public async login(user: User, sessionId: string): Promise<AuthResponse> {
        try {
            const { accessToken, refreshToken } = await generateTokens(user.id, user.role);
            const headersList = await headers();
            const cookie = await cookies();
            const protocol = headersList.get("x-forwarded-proto") || 'http';
            const host = headersList.get("host");
            const fullUrl = `${protocol}://${host}`;

            const updatedUser = await db.user.update({
                where: { id: user.id },
                data: { refreshToken },
                include: {
                    driver: true,
                    rider: true
                }
            });

            cookie.set('accessToken', accessToken);
            cookie.set('refreshToken', refreshToken);

            userSession.deleteSession(sessionId);

            redirect(`${fullUrl}/${updatedUser.role.toLowerCase()}`)
        } catch (error) {
            return this.handleError(error);
        }
    }

    // Logout
    public async logout(): Promise<AuthResponse> {
        try {
            await clearSession();
            return this.response
                .setStatus(HTTP_STATUS.OK)
                .setSuccess(true)
                .build()
        } catch (error) {
            return this.handleError(AUTH_ERRORS.INTERNAL_SERVER_ERROR);
        }
    }

    // Email Verification
    public async handleEmailVerification({ fieldAnswers, sessionId }: AuthServiceProps): Promise<AuthResponse> {
        try {
            const email = fieldAnswers[0].emailAddress as string;

            const existingUser = await db.user.findUnique({
                where: { email }
            });

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
                return this.handleError('Session not found or expired', HTTP_STATUS.NOT_FOUND)
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
                .setSuccess(true)
                .build();
        } catch (error) {
            return this.handleError(error);
        }
    }

    // Phone Verification
    public async handlePhoneVerification({ fieldAnswers, sessionId }: AuthServiceProps): Promise<AuthResponse> {
        try {
            const phoneCountryCode = fieldAnswers[0].phoneCountryCode as string;
            const phonenumber = fieldAnswers[1].phoneNumber as string;


            const existingUser = await db.user.findUnique({
                where: { phonenumber, phoneCountryCode }
            });

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
                return this.handleError('Session not found or expired', HTTP_STATUS.NOT_FOUND)
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
                .setSuccess(true)
                .build();
        } catch (error) {
            return this.handleError(error);
        }
    }

    // OTP Verification
    public async handleVerifyEmailOtp({ fieldAnswers, sessionId }: AuthServiceProps): Promise<AuthResponse> {
        try {

            const session = userSession.getSession(sessionId);

            if (!session) {
                return this.handleError('Session not found or expired', HTTP_STATUS.NOT_FOUND)
            }

            const { data: userState } = session;

            const otpCode = fieldAnswers[0].emailOTPCode as string;


            if (userState?.otp?.value !== otpCode) {
                return this.handleError(AUTH_ERRORS.INVALID_EMAIL_OTP, HTTP_STATUS.UNAUTHORIZED)
            }

            if (userState?.eventType === EventType.TypeInputExistingEmail && userState.email) {
                const user = await db.user.findUnique({ where: { email: userState.email } });
                if (user) return await this.login(user, sessionId);
            }

            const updatedSession = userSession.updateSession(sessionId, {
                isVerifiedEmail: true,
                flowType: FlowType.PROGRESSIVE_SIGN_UP,
                otp: { value: '', expiresAt: 0 }
            });

            return this.handleConditionalResponse(sessionId, updatedSession?.data!)
        } catch (error) {
            return this.handleError(error);
        }
    }

    // Phone OTP Verification
    public async handleVerifyPhoneOtp({ fieldAnswers, sessionId }: AuthServiceProps): Promise<AuthResponse> {
        try {
            const session = userSession.getSession(sessionId);

            if (!session) {
                return this.handleError('Session not found or expired', HTTP_STATUS.NOT_FOUND)
            }

            const { data: userState } = session;
            const otpCode = fieldAnswers[0].phoneOTPCode! as string;

            if (userState?.otp?.value !== otpCode) {
                return this.handleError(AUTH_ERRORS.INVALID_PHONE_OTP, HTTP_STATUS.UNAUTHORIZED)
            }

            if (userState?.eventType === EventType.TypeInputExistingPhone && userState.phonenumber) {
                const user = await db.user.findUnique({
                    where: {
                        phonenumber: userState.phonenumber,
                        phoneCountryCode: userState.phoneCountryCode
                    }
                });
                if (user) return await this.login(user, sessionId);
            }

            const updatedSession = userSession.updateSession(sessionId, {
                isVerifiedPhonenumber: true,
                flowType: FlowType.PROGRESSIVE_SIGN_UP,
                otp: { value: '', expiresAt: 0 }
            });

            return this.handleConditionalResponse(sessionId, updatedSession?.data!)
        } catch (error) {
            return this.handleError(error);
        }
    }

    // User Details
    public async handleInputDetails({ fieldAnswers, sessionId }: AuthServiceProps): Promise<AuthResponse> {
        try {
            const details = {
                firstname: fieldAnswers[0].firstName as string,
                lastname: fieldAnswers[1].lastName as string
            };

            userSession.updateSession(sessionId, details);

            return this.response
                .setStatus(HTTP_STATUS.OK)
                .setSuccess(true)
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
                .build();
        } catch (error) {
            return this.handleError(error);
        }
    }

    // Account Creation
    public async handleCreateAccount({ sessionId }: AuthServiceProps): Promise<AuthResponse> {
        try {
            const session = userSession.getSession(sessionId);

            if (!session) {
                return this.handleError('Session not found or expired', HTTP_STATUS.NOT_FOUND)
            }

            const { data: {
                email,
                phoneCountryCode,
                phonenumber,
                lastname,
                firstname,
                isVerifiedEmail,
                isVerifiedPhonenumber,
                role,
            }, ip } = session

            const user = await db.user.create({
                data: {
                    email,
                    phoneCountryCode,
                    phonenumber,
                    lastname,
                    firstname,
                    isVerifiedEmail,
                    isVerifiedPhonenumber,
                    role,
                }
            });

            const { refreshToken, accessToken } = await generateTokens(user.id, user.role);

            const cookieStore = await cookies();
            cookieStore.set('accessToken', accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 // 1 hour
            });

            cookieStore.set('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 7 // 7 days
            });

            // Use redirect from next/navigation for server-side redirect
            redirect(`/${user.role}`);

        } catch (error) {
            return this.handleError(error);
        }
    }

    // Condition Based response
    private handleConditionalResponse(inAuthSessionId: string, data: AuthData): AuthResponse {
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
                .setSuccess(true)
                .build()

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
                .setSuccess(true)
                .build()
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
            .setSuccess(true)
            .build()

    };

    // Error handler
    public async handleError(error: unknown, statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR): Promise<AuthResponse> {
        const errorMessage = error instanceof Error
            ? error.message
            : AUTH_ERRORS.INTERNAL_SERVER_ERROR;

        return this.response
            .setStatus(statusCode)
            .setSuccess(false)
            .setError(errorMessage)
            .build();
    };
};

