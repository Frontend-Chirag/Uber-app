"use server"

import { HandleProps } from "@/types/auth";
import { AuthResponseBuilder } from "@/lib/api/response-builder";
import { handleAuthError } from "@/lib/utils/error-handler";
import { redisService } from "@/lib/db/redis";
import { FlowType, ScreenType, FieldType, EventType } from "@/types";
import { createResponseData, findEnumKey } from "@/lib/utils/utils";

export async function handleInputDetails({ session, fieldAnswers }: HandleProps) {
    try {

        const details = {
            firstname: fieldAnswers[0].firstName as string,
            lastname: fieldAnswers[1].lastName as string
        }

        await redisService.updateFormSession(session.sessionId, details);

        return new AuthResponseBuilder()
            .setStatus(200)
            .setSuccess(true)
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