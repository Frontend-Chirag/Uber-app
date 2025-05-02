// import { z } from "zod";
// import { User } from "./user";
// import { ResponseDataReturnProps, Session, FlowType, ScreenType, EventType, sessionData } from "@/types";
// import { AuthSchema } from "@/validators/validate-server";
// import { Context } from "hono";
// import { Role } from "@prisma/client";

// export type UserRole = 'rider' | 'driver';

// // Use Zod schema for field answers
// export type FieldAnswers = z.infer<typeof AuthSchema>['screenAnswers']['fieldAnswers'][number];

// export interface AuthSession {
//   sessionId: string;
//   data: sessionData | null;
// }

// export interface AuthRequest {
//   flowType: FlowType;
//   screenType: ScreenType;
//   eventType: EventType;
//   fieldAnswers: FieldAnswers[];
//   inAuthSessionID?: string;
// }

// export interface AuthResponse {
//   status: number;
//   success: boolean;
//   error?: string;
//   user?: User;
//   form?: {
//     nextStep: {
//       flowType: FlowType;
//       screens: {
//         screenType: ScreenType;
//         fields: Array<{
//           fieldType: string;
//           hintValue?: string;
//           otpWidth?: number;
//           profileHint?: {
//             firstname: string;
//             lastname: string;
//             phonenumber: string;
//             email: string;
//           };
//         }>;
//         eventType: EventType;
//       };
//     };
//     inAuthSessionID: string;
//   };
//   redirectUrl?: string;
// }

// export interface AuthError {
//   message: string;
//   code: string;
// }

// export interface HandleProps {
//   session: Session;
//   fieldAnswers: FieldAnswers[];
//   c: Context
// }

// export interface TokenPayload {
//   id: string;
//   role: Role;
//   email: string;
//   phonenumber: string;
//   iat?: number;
//   exp?: number
// }

// export interface RouteConfig {
//   roles: UserRole[];
//   rateLimit?: {
//     windowMs: number;
//     maxAttempts: number;
//   }
// }

// export interface RouteConfigs {
//   [key: string]: RouteConfig;
// }