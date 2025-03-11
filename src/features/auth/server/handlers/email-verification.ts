import { HandleProps } from "@/types/auth";
import { AuthResponseBuilder } from "@/lib/response-builder";
import { validateInput, emailSchema } from "@/lib/validators";
import { handleAuthError } from "@/lib/error-handler";
import { db } from "@/lib/db";
import { sendOTPEmail } from "../utils";
import { FlowType, ScreenType, FieldType, EventType } from "@/types";
import { createResponseData, findEnumKey } from "@/lib/utils";
import { redisService } from "@/features/auth/server/utils/redis";
import { getEmailVerificationStep } from "../utils/navigation";

export async function handleEmailVerification({ session, fieldAnswers }: HandleProps) {
    try {
        const email = validateInput(emailSchema, fieldAnswers[0].emailAddress);
        
        const existingUser = await db.user.findUnique({
            where: { email }
        });

        const flowState = existingUser ? FlowType.LOGIN : FlowType.SIGN_UP;
        const otp = await sendOTPEmail({ email });
        
        const newSession = await redisService.updateFormSession(session.sessionId, {
            otp,
            email,
            flowState,
        });

        return new AuthResponseBuilder()
            .setStatus(200)
            .setForm(getEmailVerificationStep(session.sessionId, newSession))
            .build();

    } catch (error) {
        return handleAuthError(error);
    }
} 