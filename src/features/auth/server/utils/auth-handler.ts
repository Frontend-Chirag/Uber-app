import { HandleProps } from "@/types/auth";
import { handleAuthError, AuthError } from "@/lib/error-handler";
import { handleEmailVerification } from "../handlers/email-verification";
import { handlePhoneVerification } from "../handlers/phone-verification";
import { handleVerifyEmailOtp, handleVerifyPhoneOtp } from "../handlers/otp-verification";
import { handleInputDetails } from "../handlers/user-details";
import { handleCreateAccount } from "../handlers/account-creation";
import { EventType, FlowType, ScreenType } from "@/types";

type AuthHandlerType = {
    handlers: Record<FlowType, Partial<Record<ScreenType, Partial<Record<EventType, (props: HandleProps) => Promise<any>>>>>>;
    handle(flow: FlowType, screen: ScreenType, event: EventType, props: HandleProps): Promise<any>;
};

export const authHandler: AuthHandlerType = {
    handlers: {
        [FlowType.INITIAL]: {
            [ScreenType.PHONE_NUMBER_INITIAL]: {
                [EventType.TypeInputMobile]: handlePhoneVerification,
                [EventType.TypeInputEmail]: handleEmailVerification,
            },
        },
        [FlowType.SIGN_UP]: {
            [ScreenType.EMAIL_OTP_CODE]: {
                [EventType.TypeEmailOTP]: handleVerifyEmailOtp,
            },
            [ScreenType.PHONE_OTP]: {
                [EventType.TypeSMSOTP]: handleVerifyPhoneOtp,
            },
        },
        [FlowType.PROGRESSIVE_SIGN_UP]: {
            [ScreenType.EMAIL_ADDRESS_PROGESSIVE]: {
                [EventType.TypeInputEmail]: handleEmailVerification,
            },
            [ScreenType.PHONE_NUMBER_PROGRESSIVE]: {
                [EventType.TypeInputMobile]: handlePhoneVerification,
            },
            [ScreenType.FIRST_NAME_LAST_NAME]: {
                [EventType.TypeInputDetails]: handleInputDetails,
            },
        },
        [FlowType.FINAL_SIGN_UP]: {
            [ScreenType.AGREE_TERMS_AND_CONDITIONS]: {
                [EventType.TypeCheckBox]: handleCreateAccount,
            }
        },
        [FlowType.LOGIN]: {
            [ScreenType.EMAIL_OTP_CODE]: {
                [EventType.TypeEmailOTP]: handleVerifyEmailOtp,
            },
            [ScreenType.PHONE_OTP]: {
                [EventType.TypeSMSOTP]: handleVerifyPhoneOtp,
            },
        },
    },

    async handle(flow: FlowType, screen: ScreenType, event: EventType, props: HandleProps) {
        try {
            const handler = this.handlers[flow]?.[screen]?.[event];
            if (!handler) {
                throw new AuthError(`Invalid handler type: ${flow}`);
            }
            return await handler(props);
        } catch (error) {
            return handleAuthError(error);
        }
    }
};