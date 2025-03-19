import { HandleProps } from "@/types/auth";
import { AuthResponseBuilder } from "@/lib/response-builder";
import { handleAuthError, AuthError } from "@/lib/error-handler";
import { AUTH_ERRORS, AUTH_SUCCESS } from "@/lib/constants";
import { db } from "@/lib/db/prisma";


export async function handleCreateAccount({ session }: HandleProps) {
    try {
        const { data } = session;

        if (!data) {
            throw new AuthError(AUTH_ERRORS.SESSION_NOT_FOUND);
        }

        const userData = {
            firstname: data.firstname!,
            lastname: data.lastname!,
            email: data.email!,
            phoneCountryCode: data.phoneCountryCode!,
            phonenumber: data.phonenumber!,
            role: data.type!
        };

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