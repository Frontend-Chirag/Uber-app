import { AuthResponseBuilder } from "./response-builder";
import { AUTH_ERRORS } from "@/features/auth/server/utils/constants";

export class AuthError extends Error {
    constructor(
        message: string,
        public status: number = 400,
        public code?: string
    ) {
        super(message);
        this.name = 'AuthError';
    }
}

export const handleAuthError = (error: unknown) => {
    if (error instanceof AuthError) {
        return new AuthResponseBuilder()
            .setStatus(error.status)
            .setError(error.message)
            .build();
    }

    if (error instanceof Error) {
        return new AuthResponseBuilder()
            .setStatus(500)
            .setError(error.message)
            .build();
    }

    return new AuthResponseBuilder()
        .setStatus(500)
        .setError(AUTH_ERRORS.UNKNOWN_ERROR)
        .build();
}; 