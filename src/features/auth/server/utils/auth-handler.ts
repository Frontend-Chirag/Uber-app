import { HandleProps } from "@/types/auth";
import { handleAuthError, AuthError } from "@/lib/error-handler";
import { handleEmailVerification } from "../handlers/email-verification";
import { handlePhoneVerification } from "../handlers/phone-verification";
import { handleVerifyEmailOtp, handleVerifyPhoneOtp } from "../handlers/otp-verification";
import { handleInputDetails } from "../handlers/user-details";
import { handleCreateAccount } from "../handlers/account-creation";

type AuthHandlerType = {
    handlers: {
        readonly EMAIL_VERIFICATION: typeof handleEmailVerification;
        readonly PHONE_VERIFICATION: typeof handlePhoneVerification;
        readonly EMAIL_OTP: typeof handleVerifyEmailOtp;
        readonly PHONE_OTP: typeof handleVerifyPhoneOtp;
        readonly INPUT_DETAILS: typeof handleInputDetails;
        readonly CREATE_ACCOUNT: typeof handleCreateAccount;
    };
    handle(type: keyof AuthHandlerType['handlers'], props: HandleProps): Promise<any>;
};

export const authHandler: AuthHandlerType = {
    handlers: {
        EMAIL_VERIFICATION: handleEmailVerification,
        PHONE_VERIFICATION: handlePhoneVerification,
        EMAIL_OTP: handleVerifyEmailOtp,
        PHONE_OTP: handleVerifyPhoneOtp,
        INPUT_DETAILS: handleInputDetails,
        CREATE_ACCOUNT: handleCreateAccount,
    } as const,

    async handle(type: keyof typeof authHandler.handlers, props: HandleProps) {
        try {
            const handler = this.handlers[type];
            if (!handler) {
                throw new AuthError(`Invalid handler type: ${type}`);
            }
            return await handler(props);
        } catch (error) {
            return handleAuthError(error);
        }
    }
}; 