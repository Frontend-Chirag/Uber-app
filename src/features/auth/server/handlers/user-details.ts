import { HandleProps } from "@/types/auth";
import { AuthResponseBuilder } from "@/lib/response-builder";
import { validateInput } from "@/lib/validators";
import { handleAuthError } from "@/lib/error-handler";
import { redisService } from "@/features/auth/server/utils/redis";
import { FlowType, ScreenType, FieldType, EventType } from "@/types";
import { createResponseData, findEnumKey } from "@/lib/utils";
import { z } from "zod";

export async function handleInputDetails({ session, fieldAnswers }: HandleProps) {
    try {
        const details = validateInput(
            z.object({
                firstname: z.string().min(2),
                lastname: z.string().min(2)
            }),
            {
                firstname: fieldAnswers[0].firstname,
                lastname: fieldAnswers[1].lastname
            }
        );

        await redisService.updateFormSession(session.sessionId, details);

        return new AuthResponseBuilder()
            .setStatus(200)
            .setForm(createResponseData({
                flowType: FlowType.FINAL_SIGN_UP,
                screenType: ScreenType.AGREE_TERMS_AND_CONDITIONS,
                fields: [{
                    fieldType: findEnumKey(FieldType.AGREE_TERMS_AND_CONDITIONS)!
                }],
                eventType: EventType.TypeCheckBox,
                sessionId: session.sessionId
            }))
            .build();

    } catch (error) {
        return handleAuthError(error);
    }
} 