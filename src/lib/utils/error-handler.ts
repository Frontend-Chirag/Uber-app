import { AUTH_ERRORS } from "../config/constants";
import { AuthResponseBuilder } from "../api/response-builder";


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
            .setSuccess(false) 
            .setError(error.message)
            .build();
    }

    if (error instanceof Error) {
        return new AuthResponseBuilder()
            .setStatus(500)
            .setSuccess(false) 
            .setError(error.message)
            .build();
    }

    return new AuthResponseBuilder()
        .setStatus(500)
        .setSuccess(false) 
        .setError(AUTH_ERRORS.INTERNAL_SERVER_ERROR)
        .build();
}; 