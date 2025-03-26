"use server"

import { AuthResponse, HandleProps } from "@/types/auth";
import { handleAuthError, AuthError } from "@/lib/utils/error-handler";
import { AUTH_ERRORS } from "@/lib/config/constants";
import { db } from "@/lib/db/prisma";
import { login } from "./auth";
import { AuthResponseBuilder } from "@/lib/api/response-builder";

export async function handleCreateAccount({ session }: HandleProps): Promise<AuthResponse> {
    try {
        const { data } = session;

        if (!data) {
            throw new AuthError(AUTH_ERRORS.SESSION_NOT_FOUND);
        }

        // Validate required fields
        if (!data.firstname || !data.lastname || !data.type) {
            throw new AuthError(AUTH_ERRORS.MISSING_REQUIRED_FIELDS);
        }

        const userData = {
            firstname: data.firstname,
            lastname: data.lastname,
            email: data.email,
            phoneCountryCode: data.phoneCountryCode,
            phonenumber: data.phonenumber,
            role: data.type
        };

        const user = await db.user.create({ data: userData });

        // Login the user after successful account creation
        return await login(user.email ?? user.phonenumber!);

    } catch (error) {
        return handleAuthError(error)
    }
} 