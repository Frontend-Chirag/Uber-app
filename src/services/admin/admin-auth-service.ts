import { db } from "@/lib/db/prisma";
import { v4 as uuid } from 'uuid';
import bcryptjs from 'bcryptjs';
import { OTP } from "../security/otp";
import { sendSMSMobile } from "../sms";
import { sendOTPEmail } from "../email";
import { redirect } from "next/navigation";
import { generateTokens } from "@/lib/auth";
import { cookies, headers } from "next/headers";
import { FlowType, ScreenType, EventType, FieldType } from "@/types";
import { AUTH_ERRORS, AuthResponse, AuthServiceProps } from "../auth/type";
import { AuthResponseBuilder } from "@/lib/config/response-builder";
import { Admin } from "@prisma/client";
import { findEnumKey } from "@/lib/utils";
import { HTTP_STATUS } from "@/lib/constants";
import { getSessionManager } from "../session/session-service";
import { AdminService } from "./admin-services";

type HandlerFunction = (props: AuthServiceProps) => Promise<AuthResponse>;
type EventHandlers = Partial<Record<EventType, HandlerFunction>>;
type ScreenHandlers = Partial<Record<ScreenType, EventHandlers>>;
type FlowHandlers = Partial<Record<FlowType, ScreenHandlers>>;


// Interface for session state
interface SessionState {
    sessionId: string;
    data: {
        id: string;
        otp: OTP;
        email: string;
        phonenumber: string;
        phoneCountryCode: string;
        createdAt: number;
    }
}

// Interface for login attempts tracking
interface LoginAttempt {
    count: number;
    lastAttempt: number;
}

const adminSession = getSessionManager('ADMIN');


export class AuthAdminService {
    private static instance: AuthAdminService;
    private response: AuthResponseBuilder;
    private handlers: FlowHandlers;


    private constructor() {
        this.response = new AuthResponseBuilder();
        this.handlers = {
            [FlowType.INITIAL]: {
                [ScreenType.PHONE_NUMBER_INITIAL]: {
                    [EventType.TypeInputEmail]: this.handleEmailVerification.bind(this),
                    [EventType.TypeInputMobile]: this.handlePhoneVerification.bind(this)
                },
            },
            [FlowType.PROGRESSIVE_SIGN_UP]: {

                [ScreenType.RESEND_OTP]: {
                    [EventType.TypeEmailOTP]: this.handleResendOTP.bind(this),
                    [EventType.TypeSMSOTP]: this.handleResendOTP.bind(this)
                }
            },
            [FlowType.LOGIN]: {
                [ScreenType.EMAIL_OTP_CODE]: {
                    [EventType.TypeEmailOTP]: this.handleVerifyEmailOtp.bind(this)
                },
                [ScreenType.PHONE_OTP]: {
                    [EventType.TypeSMSOTP]: this.handleVerifyPhoneOtp.bind(this)
                },
            }
        }
    };

    public static async getInstance(): Promise<AuthAdminService> {
        if (!AuthAdminService.instance) {
            AuthAdminService.instance = new AuthAdminService();
        }

        return AuthAdminService.instance;
    }

    /**
     * Main handler for admin authentication flow
     */
    public async handleAdminAuth(flow: FlowType, screen: ScreenType, event: EventType, props: AuthServiceProps): Promise<AuthResponse> {
        try {
            const { fieldAnswers, sessionId } = props;
            const ip = await this.getIpAddress();

            if ((await adminSession.checkRateLimit(ip))) {
                return this.handleError(new Error("Too many requests"), HTTP_STATUS.TOO_MANY_REQUESTS);
            }

            if (!props.sessionId && !(await adminSession.checkSessionLimit(ip))) {
                return this.handleError(new Error('Maximum number of sessions reached.'), HTTP_STATUS.TOO_MANY_REQUESTS);
            }

            await adminSession.cleanupExpiredSessions();
            await adminSession.cleanupRateLimits();

            const handler = this.handlers[flow]?.[screen]?.[event];

            if (!handler) {
                return this.handleError(new Error('Invalid flow or screen type'), HTTP_STATUS.BAD_REQUEST);
            }

            return await handler({ fieldAnswers, sessionId });

        } catch (error) {
            console.error('Admin auth error:', error);
            return this.handleError(error);
        }
    }

    /**
     * Validate admin credentials
     */
    private async isValidAdmin(emailOrPhone: string, password: string): Promise<Admin | Error> {
        try {
            const admin = await db.admin.findFirst({
                where: {
                    OR: [
                        { email: emailOrPhone },
                        { phonenumber: emailOrPhone }
                    ]
                }
            });

            if (!admin) {
                return new Error('Invalid credentials')
            }

            console.log(password)

            // verify password
            const isValidPassword = await bcryptjs.compare(password, admin.password);

            if (!isValidPassword) {
                return new Error('Invalid password');
            }

            return admin;

        } catch (error) {
            console.error('Admin validation error:', error);
            return new Error('Authentication failed. Please try again.');
        }
    }


    private async getIpAddress(): Promise<string> {
        const headersList = await headers();
        const forwardedFor = headersList.get('x-forwarded-for');
        const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : 'unknown';
        return ip;
    }
    /**
     * Handle email verification for admin login
     */
    public async handleEmailVerification({ sessionId, fieldAnswers }: AuthServiceProps): Promise<AuthResponse> {
        try {
            const email = fieldAnswers[0].emailAddress as string;
            const password = fieldAnswers[1].password as string;
            const ip = await this.getIpAddress();

            // create session
            adminSession.getSession(sessionId, {
                email: "",
                phoneCountryCode: "",
                phonenumber: "",
                otp: {
                    value: "",
                    expiresAt: 0
                },
            }, ip);

            const adminResult = await this.isValidAdmin(email, password);

            if (adminResult instanceof Error) {
                return this.response
                    .setError(adminResult.message)
                    .setSuccess(false)
                    .setStatus(HTTP_STATUS.UNAUTHORIZED)
                    .build()
            }

            // Send OTP to phone number
            const otp = await sendSMSMobile({
                phonenumber: adminResult.phonenumber,
                phoneCountryCode: adminResult.phoneCountryCode
            });

            // Update session state
            const updatedSession = adminSession.updateSession(sessionId, {
                AdminId: adminResult.id,
                email: adminResult.email,
                phoneCountryCode: adminResult.phoneCountryCode,
                phonenumber: adminResult.phonenumber,
                otp
            });

            console.log('updated Session', updatedSession)

            // Create masked contact info
            const maskedContact = `****${adminResult.phonenumber.slice(-4)}`;

            return this.response
                .setSuccess(true)
                .setMessage(`OTP send to your phone number`)
                .setForm({
                    flowType: FlowType.LOGIN,
                    inAuthSessionId: sessionId,
                    screens: {
                        eventType: EventType.TypeSMSOTP,
                        fields: [{
                            fieldType: findEnumKey(FieldType.PHONE_SMS_OTP)!,
                            hintValue: maskedContact,
                            otpWidth: otp.value.length
                        }],
                        screenType: ScreenType.PHONE_OTP
                    }
                })
                .setStatus(HTTP_STATUS.OK)
                .build()

        } catch (error) {
            console.error('Failed to verify admin email:', error);
            return this.handleError(error);
        }
    }

    /**
     * Handle phone verification for admin login
     */
    public async handlePhoneVerification({ sessionId, fieldAnswers }: AuthServiceProps): Promise<AuthResponse> {
        try {
            const phonenumber = fieldAnswers[0].phonenumber as string;
            const password = fieldAnswers[0].password as string;
            const ip = await this.getIpAddress();

            // create session
            adminSession.getSession(sessionId, {
                email: "",
                phoneCountryCode: "",
                phonenumber: "",
                otp: {
                    value: "",
                    expiresAt: 0
                },
            }, ip);

            const adminResult = await this.isValidAdmin(phonenumber, password);

            if (adminResult instanceof Error) {
                return this.response
                    .setError(adminResult.message)
                    .setSuccess(false)
                    .setStatus(HTTP_STATUS.UNAUTHORIZED)
                    .build()
            }


            // Send OTP to email
            const otp = await sendOTPEmail({ email: adminResult.email });

            // Update session state
            const updatedSession = adminSession.updateSession(sessionId, {
                AdminId: adminResult.id,
                email: adminResult.email,
                phoneCountryCode: adminResult.phoneCountryCode,
                phonenumber: adminResult.phonenumber,
                otp
            });

            console.log('updated Session', updatedSession);

            // Create masked contact info
            const maskedContact = `${adminResult.email.split('@')[0].slice(0, 2)}***@${adminResult.email.split('@')[1]}`;

            return this.response
                .setSuccess(true)
                .setMessage(`OTP send to your email`)
                .setForm({
                    flowType: FlowType.LOGIN,
                    inAuthSessionId: sessionId,
                    screens: {
                        eventType: EventType.TypeEmailOTP,
                        fields: [{
                            fieldType: findEnumKey(FieldType.EMAIL_OTP_CODE)!,
                            hintValue: maskedContact,
                            otpWidth: otp.value.length
                        }],
                        screenType: ScreenType.EMAIL_OTP_CODE
                    }
                })
                .setStatus(HTTP_STATUS.OK)
                .build()

        } catch (error) {
            console.error('Failed to verify admin phone:', error);
            return this.handleError(error);
        }
    }

    /**
     * Handle OTP resend request
     */
    public async handleResendOTP({ sessionId }: AuthServiceProps): Promise<AuthResponse> {
        try {
            const session = adminSession.getSession(sessionId, null, null);

            if (!session) {
                return this.handleError(new Error('Invalid or expired session'), HTTP_STATUS.UNAUTHORIZED)
            }

            const newSessionId = uuid();

            // Create new OTP
            const otp = await sendOTPEmail({ email: session.data.email });

            // Store new session
            const newSession = adminSession.updateSession(newSessionId, {
                ...session.data,
                otp,
            });



            // Delete old session
            adminSession.deleteSession(sessionId)

            // Create masked contact info
            const maskedContact = `${newSession?.data.email.split('@')[0].slice(0, 2)}***@${newSession?.data.email.split('@')[1]}`;

            return this.response
                .setSuccess(true)
                .setMessage(`A verification code has been sent to your email: ${maskedContact}`)
                .setForm({
                    flowType: FlowType.LOGIN,
                    inAuthSessionId: newSessionId,
                    screens: {
                        eventType: EventType.TypeEmailOTP,
                        fields: [{
                            fieldType: findEnumKey(FieldType.EMAIL_OTP_CODE)!,
                            hintValue: maskedContact,
                            otpWidth: otp.value.length
                        }],
                        screenType: ScreenType.EMAIL_OTP_CODE
                    }
                })
                .setStatus(HTTP_STATUS.OK)
                .build()

        } catch (error) {
            console.error('Failed to resend OTP:', error);
            return this.handleError(error);
        }
    }

    /**
     * Common OTP verification logic
     */
    private async verifyOTP(sessionId: string, otpCode: string): Promise<AuthResponse> {
        try {
            const cookieStore = await cookies();
            const session = adminSession.getSession(sessionId, null, null);

            if (!session) {
                return this.handleError(new Error('Session not found or expired'), HTTP_STATUS.UNAUTHORIZED);
            }

            // check if otp is valid and not expired
            if (session.data.otp.value !== otpCode || Date.now() > session.data.otp.expiresAt || !session.data.AdminId) {
                return this.handleError(new Error('Invalid or expired session'), HTTP_STATUS.UNAUTHORIZED)
            }


            // Generate authentication tokens
            const { refreshToken, accessToken } = await generateTokens(session.data.AdminId, 'super_admin');

            const updatedAdmin = await AdminService.getInstance().cache.updateAdmin(session.data.AdminId, {
                refreshToken
            });

            if (!updatedAdmin) {
                return this.handleError(new Error('Failed to update admin'), HTTP_STATUS.INTERNAL_SERVER_ERROR)
            }

            // Set secure cookies
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

            // Clean up session
            adminSession.deleteSession(sessionId);

            // Redirect to dashboard
            return this.response
                .setRedirect('super_admin')
                .setSuccess(true)
                .setMessage('Welcome to your dashboard')
                .build();
        } catch (error) {
            console.error('OTP verification error:', error);
            return this.handleError(error);
        }
    }

    /**
     * Handle email OTP verification
     */
    public async handleVerifyEmailOtp({ sessionId, fieldAnswers }: AuthServiceProps): Promise<AuthResponse> {

        const otpCode = fieldAnswers[0].emailOTPCode as string;
        return this.verifyOTP(sessionId, otpCode);
    }

    /**
     * Handle phone OTP verification
     */
    public async handleVerifyPhoneOtp({ sessionId, fieldAnswers }: AuthServiceProps): Promise<AuthResponse> {

        const otpCode = fieldAnswers[0].phoneOTPCode as string;
        return this.verifyOTP(sessionId, otpCode);
    }

    /**
     * Handle errors with appropriate status codes
     */
    public async handleError(error: unknown, statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR): Promise<AuthResponse> {
        const errorMessage = error instanceof Error
            ? error.message
            : `admin_auth: ${AUTH_ERRORS.INTERNAL_SERVER_ERROR}`;

        return this.response
            .setStatus(statusCode)
            .setSuccess(false)
            .setError(errorMessage)
            .build();
    };
}