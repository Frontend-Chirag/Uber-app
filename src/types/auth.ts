import { z } from "zod";
import { User } from "./user";
import { ResponseDataReturnProps, Session, FlowType, ScreenType, EventType, sessionData } from "@/types";
import { AuthSchema } from "@/validators/validate-server";

export type UserRole = 'Rider' | 'Driver';

// Use Zod schema for field answers
export type FieldAnswers = z.infer<typeof AuthSchema>['screenAnswers']['fieldAnswers'][number];

export interface AuthSession {
  sessionId: string;
  data: sessionData | null;
}

export interface AuthRequest {
  flowType: FlowType;
  screenType: ScreenType;
  eventType: EventType;
  fieldAnswers: FieldAnswers[];
  inAuthSessionID?: string;
}

export interface AuthResponse {
  status: number;
  success: boolean;
  error?: string;
  data?: {
    sessionId?: string;
    user?: User;
    form?: ResponseDataReturnProps;
  };
}

export interface AuthError {
  message: string;
  code: string;
}

export interface HandleProps {
  session: Session;
  fieldAnswers: FieldAnswers[];
} 