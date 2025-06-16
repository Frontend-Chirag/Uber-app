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
import { Context } from "hono";
import { AuthSchema } from "@/validators/validate-server";
import { z } from "zod";
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";


const userSession = getSessionManager('USER');


interface AuthHandlersProps {
    fieldAnswers: FieldAnswers[];
    sessionId: string;
    ctx: Context;
}

interface AuthHandler {
    flow: FlowType;
    screen: ScreenType;
    event: EventType;
    fieldAnswers: FieldAnswers[];
    sessionId: string;
    ctx: Context;
}

type HandlerFunction = (
    props: AuthHandlersProps
) => Promise<Response>;

type EventHandlers = Partial<Record<EventType, HandlerFunction>>;
type ScreenHandlers = Partial<Record<ScreenType, EventHandlers>>;
type FlowHandlers = Partial<Record<FlowType, ScreenHandlers>>;

type FieldAnswers = z.infer<typeof AuthSchema>['screenAnswers']['fieldAnswers'][number];


export class AuthService {
    private static instance: AuthService;
    private handlers: FlowHandlers;
    private cookieStore: Promise<ReadonlyRequestCookies> = cookies();

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
    public async handleAuth(props: AuthHandler): Promise<Response> {
        try {
            const { flow, screen, event, fieldAnswers, sessionId, ctx } = props;
            const headersList = await headers();
            const forwardedFor = headersList.get('x-forwarded-for');
            const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : 'unknown';

            console.log('Handler Ip:', ip)

            if (!(await userSession.checkRateLimit(ip))) {
                return this.handleError(HTTP_ERRORS.TOO_MANY_REQUESTS, ctx, HTTP_STATUS.TOO_MANY_REQUESTS);
            }

            if (!props.sessionId && !(await userSession.checkSessionLimit(ip))) {
                return this.handleError(HTTP_ERRORS.TOO_MANY_REQUESTS, ctx, HTTP_STATUS.TOO_MANY_REQUESTS);
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
                return this.handleError(HTTP_ERRORS.INTERNAL_SERVER_ERROR, ctx, HTTP_STATUS.INTERNAL_SERVER_ERROR);
            }

            const handler = this.handlers[flow]?.[screen]?.[event];

            if (!handler) {
                return this.handleError(HTTP_ERRORS.INVALID_FLOW_OR_SCREEN_TYPE, ctx, HTTP_STATUS.BAD_REQUEST);
            }

            return await handler({ fieldAnswers, sessionId, ctx });
        } catch (error) {
            return this.handleError(error, props.ctx);
        }
    }

    // Core Authentication Methods
    public async login(userId: string, sessionId: string, ctx: Context): Promise<Response> {
        try {
            const headersList = await headers();
            const protocol = headersList.get("x-forwarded-proto") || 'http';
            const host = headersList.get("host");
            const fullUrl = `${protocol}://${host}`;

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

            (await this.cookieStore).set('sessionId', session.sessionId);
            userSession.deleteSession(sessionId);

            return ctx.redirect(`${fullUrl}/dashboard/${Role.rider}`, 302 );
        } catch (error) {
            return this.handleError(error, ctx);
        }
    }

    // Logout
    public async logout(ctx: Context): Promise<Response> {
        try {
            const sessionId = (await this.cookieStore).get('sessionId');

            if (sessionId) {
                // Delete session from database
                await db.session.delete({
                    where: { 
                        sessionId: sessionId.value!
                     }
                });

                // Clear session cookie
                (await this.cookieStore).delete('sessionId');
            }

            return ctx.redirect('/');
        } catch (error) {
            return this.handleError(HTTP_ERRORS.INTERNAL_SERVER_ERROR, ctx);
        }
    }

    // Email Verification HandlerFunction
    public async handleEmailVerification({ fieldAnswers, sessionId, ctx }: AuthHandlersProps): Promise<Response> {
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
                return this.handleError('Session not found or expired', ctx, HTTP_STATUS.NOT_FOUND);
            }
            const { data } = session;
            return ctx.json({
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
            }, 200);
        } catch (error) {
            return this.handleError(error, ctx);
        }
    }

    // Phone Verification
    public async handlePhoneVerification({ fieldAnswers, sessionId, ctx }: AuthHandlersProps): Promise<Response> {
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
                return this.handleError('Session not found or expired', ctx, HTTP_STATUS.NOT_FOUND);
            }
            const { data } = session;
            return ctx.json({
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
            }, 200);
        } catch (error) {
            return this.handleError(error, ctx);
        }
    }

    // OTP Verification
    public async handleVerifyEmailOtp({ fieldAnswers, sessionId, ctx }: AuthHandlersProps): Promise<Response> {
        try {
            const session = userSession.getSession(sessionId, null, null);
            if (!session) {
                return this.handleError('Session not found or expired', ctx, HTTP_STATUS.NOT_FOUND);
            }
            const { data: userState } = session;
            const otpCode = fieldAnswers[0].emailOTPCode as string;
            if (userState?.otp?.value !== otpCode) {
                return this.handleError(HTTP_ERRORS.INVALID_EMAIL_OTP, ctx, HTTP_STATUS.UNAUTHORIZED);
            }
            if (userState?.eventType === EventType.TypeInputExistingEmail && userState.email) {
                const user = await db.user.findUnique({ where: { email: userState.email } });
                if (user) return await this.login(user.id, sessionId, ctx);
            }
            const updatedSession = userSession.updateSession(sessionId, {
                isVerifiedEmail: true,
                flowType: FlowType.PROGRESSIVE_SIGN_UP,
                otp: { value: '', expiresAt: 0 }
            });
            return this.handleConditionalResponse(sessionId, updatedSession?.data!, ctx);
        } catch (error) {
            return this.handleError(error, ctx);
        }
    }

    // Phone OTP Verification
    public async handleVerifyPhoneOtp({ fieldAnswers, sessionId, ctx }: AuthHandlersProps): Promise<Response> {
        try {
            const session = userSession.getSession(sessionId, null, null);
            if (!session) {
                return this.handleError('Session not found or expired', ctx, HTTP_STATUS.NOT_FOUND);
            }
            const { data: userState } = session;
            const otpCode = fieldAnswers[0].phoneOTPCode! as string;
            if (userState?.otp?.value !== otpCode) {
                return this.handleError(HTTP_ERRORS.INVALID_PHONE_OTP, ctx, HTTP_STATUS.UNAUTHORIZED);
            }
            if (userState?.eventType === EventType.TypeInputExistingPhone && userState.phonenumber) {
                const user = await db.user.findUnique({
                    where: {
                        phonenumber: userState.phonenumber,
                        phoneCountryCode: userState.phoneCountryCode
                    }
                });
                if (user) return await this.login(user.id, sessionId, ctx);
            }
            const updatedSession = userSession.updateSession(sessionId, {
                isVerifiedPhonenumber: true,
                flowType: FlowType.PROGRESSIVE_SIGN_UP,
                otp: { value: '', expiresAt: 0 }
            });
            return this.handleConditionalResponse(sessionId, updatedSession?.data!, ctx);
        } catch (error) {
            return this.handleError(error, ctx);
        }
    }

    // User Details
    public async handleInputDetails({ fieldAnswers, sessionId, ctx }: AuthHandlersProps): Promise<Response> {
        try {
            const details = {
                firstname: fieldAnswers[0].firstName as string,
                lastname: fieldAnswers[1].lastName as string
            };
            userSession.updateSession(sessionId, details);
            return ctx.json({
                flowType: FlowType.FINAL_SIGN_UP,
                screens: {
                    screenType: ScreenType.AGREE_TERMS_AND_CONDITIONS,
                    fields: [{
                        fieldType: findEnumKey(FieldType.AGREE_TERMS_AND_CONDITIONS)!
                    }],
                    eventType: EventType.TypeCheckBox,
                },
                inAuthSessionId: sessionId
            }, 200);
        } catch (error) {
            return this.handleError(error, ctx);
        }
    }

    public async handleCreateAccount({ sessionId, ctx }: AuthHandlersProps): Promise<Response> {
        try {
            const session = userSession.getSession(sessionId, null, null);
            const headerList = await headers();
            const userAgent = headerList.get('user-agent') || 'unknown';
            const ip = headerList.get('x-forwarded-for') || '127.0.0.1';
            if (!session) {
                return this.handleError('Session not found or expired', ctx, HTTP_STATUS.NOT_FOUND);
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
                (await this.cookieStore).set('sessionId', user.Session.sessionId);
            }
            return ctx.redirect(`/${user.role}`);
        } catch (error) {
            return this.handleError(error, ctx);
        }
    }

    // Condition Based response
    private handleConditionalResponse(inAuthSessionId: string, data: ConditionalResponseData, ctx: Context): Response {
        if (data.isVerifiedEmail && data.isVerifiedPhonenumber) {
            return ctx.json({
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
            }, 200);
        }
        if (!data.isVerifiedEmail) {
            return ctx.json({
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
            }, 200);
        }
        return ctx.json({
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
        }, 200);
    }

    // Error handler
    public handleError(error: unknown, ctx: Context, statusCode: number = 500): Response {
        const errorMessage = error instanceof Error
            ? error.message
            : HTTP_ERRORS.INTERNAL_SERVER_ERROR;
        return ctx.json({ success: false, error: errorMessage }, statusCode.toString() as any);
    }
};


