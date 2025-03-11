import { HandleProps } from "@/types/auth";
import { AuthResponseBuilder } from "@/lib/response-builder";
import { validateInput, userDetailsSchema } from "@/lib/validators";
import { handleAuthError, AuthError } from "@/lib/error-handler";
import { AUTH_ERRORS, AUTH_SUCCESS } from "../utils/constants";
import { db } from "@/lib/db";


export async function handleCreateAccount({ session }: HandleProps) {
    try {
        const { sessiondata } = session;
        
        if (!sessiondata) {
            throw new AuthError(AUTH_ERRORS.SESSION_NOT_FOUND);
        }

        const userData = validateInput(userDetailsSchema, {
            firstname: sessiondata.firstname,
            lastname: sessiondata.lastname,
            email: sessiondata.email,
            phoneCountryCode: sessiondata.phoneCountryCode,
            phonenumber: sessiondata.phonenumber,
            role: sessiondata.type
        });

        

        const user = await db.user.create({ data: userData });
        const userWithType = { ...user, type: user.role };

        return new AuthResponseBuilder()
            .setStatus(200)
            .setSuccess(AUTH_SUCCESS.ACCOUNT_CREATED)
            .setUser(userWithType)
            .build();

    } catch (error) {
        return handleAuthError(error);
    }
} 