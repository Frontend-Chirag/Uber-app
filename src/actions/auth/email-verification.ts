"use server"

import { HandleProps } from "@/types/auth";
import { AuthResponseBuilder } from "@/lib/api/response-builder";
import { handleAuthError } from "@/lib/utils/error-handler";
import { db } from "@/lib/db/prisma";
import { createResponseData, findEnumKey } from '@/lib/utils/utils';
import { EventType, FieldType, FlowType, ScreenType } from "@/types";
import { redisService } from "@/lib/db/redis";
import { sendOTPEmail } from "@/services/email";

export async function handleEmailVerification({ session, fieldAnswers }: HandleProps) {
    try {


        const email = fieldAnswers[0].emailAddress as string;

        const existingUser = await db.user.findUnique({
            where: { email }
        });

        const eventType = existingUser ? EventType.TypeInputExistingEmail : EventType.TypeEmailOTP;
        const otp = await sendOTPEmail({ email });

        const newSession = await redisService.updateFormSession(session.sessionId, {
            otp,
            email,
            flowType: FlowType.SIGN_UP,
            eventType
        });

        return new AuthResponseBuilder()
            .setStatus(200)
            .setForm(createResponseData({
                flowType: newSession.flowType,
                sessionId: session.sessionId,
                screenType: ScreenType.EMAIL_OTP_CODE,
                fields: [{
                    fieldType: findEnumKey(FieldType.EMAIL_OTP_CODE)!,
                    hintValue:  newSession.email!,
                    otpWidth: otp.value.length,
                    profileHint: {
                        firstname: existingUser?.firstname || '',
                        lastname: existingUser?.lastname || '',
                        phonenumber: existingUser?.phonenumber || '',
                        email: existingUser?.email || '',
                    }
                }],
                eventType
            }))
            .build();

    } catch (error) {
        return handleAuthError(error);
    }
}


// {
//     "form": {
//         "flowType": "SIGN_IN",
//             "screens": [
//                 {
//                     "screenType": "EMAIL_OTP_CODE",
//                     "fields": [
//                         {
//                             "fieldType": "EMAIL_OTP_CODE",
//                             "hintValue": "anujkashyap123000@gmail.com",
//                             "otpWidth": 4,
//                             "profileHint": {
//                                 "firstName": "chirag",
//                                 "lastName": "",
//                                 "phoneNumber": "",
//                                 "email": ""
//                             },
//                             "selectAccountHints": null,
//                             "allowCredentials": null
//                         }
//                     ],
//                     "eventType": "TypeEmailOTP",
//                     "categoryType": "LOGIN_OPTION"
//                 }
//             ]
//     },
//     "inAuthSessionID": "c4916c9f-b460-44d7-bb53-7afce2958b0a_18b28af0-02e4-4867-9e53-a64ff40507dd",
//         "alternateForms": [
//             {
//                 "flowType": "INITIAL",
//                 "screens": [
//                     {
//                         "screenType": "PHONE_OTP",
//                         "fields": [
//                             {
//                                 "fieldType": "PHONE_SMS_OTP",
//                                 "hintValue": "******8489",
//                                 "otpWidth": 4,
//                                 "selectAccountHints": null,
//                                 "allowCredentials": null
//                             }
//                         ], "eventType": "TypeSMSOTP",
//                         "categoryType": "LOGIN_OPTION"
//                     }
//                 ]
//             }, {
//                 "flowType": "INITIAL",
//                 "screens": [
//                     {
//                         "screenType": "EMAIL",
//                         "fields": [{
//                             "fieldType": "EMAIL_ADDRESS",
//                             "selectAccountHints": null,
//                             "allowCredentials": null
//                         }
//                         ],
//                         "eventType": "TypeInputExistingEmail"
//                     }]
//             }
//         ],

//             "cookies": null
// }