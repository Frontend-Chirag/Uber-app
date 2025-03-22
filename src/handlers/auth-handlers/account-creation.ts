import { HandleProps } from "@/types/auth";
import { AuthResponseBuilder } from "@/lib/response-builder";
import { handleAuthError, AuthError } from "@/lib/error-handler";
import { AUTH_ERRORS, AUTH_SUCCESS } from "@/lib/constants";
import { db } from "@/lib/db/prisma";
import { setCookie } from 'hono/cookie';
import { generateAccessToken, generateRefreshToken } from "@/lib/utils";


export async function handleCreateAccount({ session, c }: HandleProps) {
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

        const { accessToken } = generateAccessToken({ id: user.id, contact: user.email ?? user.phonenumber!, name: user.firstname });
        const { refreshToken } = generateRefreshToken({ id: user.id, contact: user.email ?? user.phonenumber!, name: user.firstname });

        const updatedUser = await db.user.update({
            where: { id: user.id },
            data: { refreshToken },
        });

        setCookie(c, 'accessToken', accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'Strict',
            path: '/'
        });
        
        setCookie(c, 'refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'Strict',
            path: '/'
        });

        return new AuthResponseBuilder()
            .setStatus(200)
            .setSuccess(AUTH_SUCCESS.ACCOUNT_CREATED)
            .setUser(updatedUser)
            .build();

    } catch (error) {
        return handleAuthError(error);
    }
} 