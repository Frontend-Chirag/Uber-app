"use server";

import { v4 as uuid } from 'uuid';
import { AuthSchema } from '@/validators/validate-server';
import { AuthRequest, AuthResponse } from "@/services/auth/type";
import { Role } from '@prisma/client';
import { AuthService } from '@/services/auth/auth-service';
import { AuthAdminService } from "@/services/admin/admin-auth-service";

// Get singleton instances
const authService = await AuthService.getInstance();
const adminAuthService = await AuthAdminService.getInstance();

export async function submit(req: AuthRequest): Promise<AuthResponse> {
    try {

        // Validate request data
        const validateResult = AuthSchema.parse(req.json);
        if (!validateResult) {
            return authService.handleError('Invalid field data value');
        }

            return handleUserSubmit(validateResult);

      

    } catch (error) {
        const errorPrefix =  'Authentication Error';
        const service =  authService;
        return service.handleError(error instanceof Error ? `${errorPrefix}: ${error.message}` : 'Internal server error');
    }
}

// Helper function for admin authentication
async function handleAdminSubmit(validatedData: any): Promise<AuthResponse> {
    const {
        flowType,
        inAuthSessionId,
        screenAnswers: {
            eventType,
            fieldAnswers,
            screenType
        }
    } = validatedData;

    const sessionId = inAuthSessionId || uuid();

    console.log('Initializing handle submit funcition')

    return adminAuthService.handleAdminAuth(
        flowType,
        screenType,
        eventType,
        {
            fieldAnswers,
            sessionId
        }
    );
}

// Helper function for regular user authentication
async function handleUserSubmit(validatedData: any): Promise<AuthResponse> {
    const {
        flowType,
        inAuthSessionId,
        screenAnswers: {
            eventType,
            fieldAnswers,
            screenType
        }
    } = validatedData;

    const sessionId = inAuthSessionId || uuid();

    return authService.handleAuth(
        flowType,
        screenType,
        eventType,
        {
            fieldAnswers,
            sessionId
        }
    );
}