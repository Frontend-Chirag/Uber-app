import { HandleProps } from "@/types/auth";
import { AuthResponseBuilder } from "@/lib/response-builder";
import { handleAuthError } from "@/lib/error-handler";
import { db } from "@/lib/db";
import { sendOTPEmail } from "../utils";
import { FlowType} from "@/types";
import { redisService } from "@/features/auth/server/utils/redis";
import { getEmailVerificationStep } from "../utils/navigation";

export async function handleEmailVerification({ session, fieldAnswers }: HandleProps) {
    try {

        console.log('fieldAnswers', fieldAnswers)

        const email = fieldAnswers[0].fieldType!;
        
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