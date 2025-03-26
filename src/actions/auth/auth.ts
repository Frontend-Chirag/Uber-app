'use server';

import { verifyUser, generateTokens, setAuthCookies, clearAuthCookies } from '@/lib/auth/auth';
import { db } from '@/lib/db/prisma';
import { AUTH_ERRORS } from '@/lib/config/constants';
import { handleEmailVerification } from "./email-verification";
import { handlePhoneVerification } from "./phone-verification";
import { handleVerifyEmailOtp, handleVerifyPhoneOtp } from "./otp-verification";
import { handleInputDetails } from "./user-details";
import { handleCreateAccount } from "./account-creation";
import {
  FlowType,
  ScreenType,
  EventType,
} from "@/types";
import { AuthResponse, HandleProps } from "@/types/auth";
import { AuthError, handleAuthError } from "@/lib/utils/error-handler";
import { AuthResponseBuilder } from '@/lib/api/response-builder';

type HandlerFunction = (props: HandleProps) => Promise<AuthResponse>;
type EventHandlers = Partial<Record<EventType, HandlerFunction>>;
type ScreenHandlers = Partial<Record<ScreenType, EventHandlers>>;
type FlowHandlers = Partial<Record<FlowType, ScreenHandlers>>;

const handlers: FlowHandlers = {
  [FlowType.INITIAL]: {
    [ScreenType.PHONE_NUMBER_INITIAL]: {
      [EventType.TypeInputMobile]: handlePhoneVerification,
      [EventType.TypeInputEmail]: handleEmailVerification,
    },
  },
  [FlowType.SIGN_UP]: {
    [ScreenType.EMAIL_OTP_CODE]: {
      [EventType.TypeEmailOTP]: handleVerifyEmailOtp,
    },
    [ScreenType.PHONE_OTP]: {
      [EventType.TypeSMSOTP]: handleVerifyPhoneOtp,
    },
  },
  [FlowType.PROGRESSIVE_SIGN_UP]: {
    [ScreenType.EMAIL_ADDRESS_PROGESSIVE]: {
      [EventType.TypeInputEmail]: handleEmailVerification,
    },
    [ScreenType.PHONE_NUMBER_PROGRESSIVE]: {
      [EventType.TypeInputMobile]: handlePhoneVerification,
    },
    [ScreenType.FIRST_NAME_LAST_NAME]: {
      [EventType.TypeInputDetails]: handleInputDetails,
    },
  },
  [FlowType.FINAL_SIGN_UP]: {
    [ScreenType.AGREE_TERMS_AND_CONDITIONS]: {
      [EventType.TypeCheckBox]: handleCreateAccount,
    }
  },
  [FlowType.LOGIN]: {
    [ScreenType.EMAIL_OTP_CODE]: {
      [EventType.TypeEmailOTP]: handleVerifyEmailOtp,
    },
    [ScreenType.PHONE_OTP]: {
      [EventType.TypeSMSOTP]: handleVerifyPhoneOtp,
    },
  },
};

export async function handleAuth(flow: FlowType, screen: ScreenType, event: EventType, props: HandleProps): Promise<AuthResponse> {
  try {
    const handler = handlers[flow]?.[screen]?.[event];
    if (!handler) {
      throw new AuthError(`Invalid handler type: ${flow}`);
    }
    return await handler(props);
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function login(emailOrPhone: string): Promise<AuthResponse> {
  try {
    const user = await verifyUser(emailOrPhone);
    
    const { accessToken, refreshToken } = await generateTokens(user);
    
    // Update refresh token in database
    await db.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    setAuthCookies(accessToken, refreshToken);

    return new AuthResponseBuilder()
      .setStatus(200)
      .setSuccess(true)
      .setUser(user)
      .build();

  } catch (error) {
    return new AuthResponseBuilder()
      .setStatus(500)
      .setSuccess(false)
      .setError(error instanceof Error ? error.message : AUTH_ERRORS.INTERNAL_SERVER_ERROR)
      .build();
  }
}

export async function logout() {
  try {
    clearAuthCookies();
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: AUTH_ERRORS.INTERNAL_SERVER_ERROR,
    };
  }
}

