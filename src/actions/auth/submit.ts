'use server';

import { v4 as uuid } from 'uuid';
import { redisService } from '@/lib/db/redis';
import { handleAuth } from './auth';
import { AuthRequest, AuthResponse, AuthSession, UserRole } from '@/types/auth';
import { AUTH_ERRORS } from '@/lib/config/constants';
import { AuthResponseBuilder } from '@/lib/api/response-builder';

export async function submitAuth(
  request: AuthRequest,
  role: UserRole
): Promise<AuthResponse> {
  try {
    const { flowType, screenType, eventType, fieldAnswers, inAuthSessionID } = request;
    
    console.log('request',request)

    let session: AuthSession;

    if (!inAuthSessionID) {
      const sessionId = uuid();
      const redisSession = await redisService.createFormSession({ sessionId, data: { type: role, flowType, eventType } });

      if (!redisSession?.data) {
        return new AuthResponseBuilder()
          .setStatus(500)
          .setError('Failed to create session')
          .build(); 
      }

      session = redisSession;

    } else {
      const redisSession = await redisService.getFormSession(inAuthSessionID);
      
      if (!redisSession?.data) {
        return new AuthResponseBuilder()
          .setStatus(404)
          .setError(AUTH_ERRORS.SESSION_NOT_FOUND)
          .build();
      }

      session = redisSession;
    }

    return await handleAuth(flowType, screenType, eventType, {
      fieldAnswers,
      session
    });

  } catch (error) {
    return new AuthResponseBuilder()
      .setStatus(500)
      .setError(error instanceof Error ? error.message : AUTH_ERRORS.INTERNAL_SERVER_ERROR)
      .build();
  }
} 