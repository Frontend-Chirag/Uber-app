import { z } from "zod";
import { User } from "./user";
import { FieldType, ResponseDataReturnProps, Session } from "@/types";
import { AuthSchema } from "@/validators/validate-server";
import { Context } from 'hono';


export interface AuthResponse {
    status: number;
    error?: string;
    success?: string;
    user?: User;
    form?: ResponseDataReturnProps;
}

type FieldAnswers = z.infer<typeof AuthSchema>['screenAnswers']['fieldAnswers'][number]

export interface HandleProps {
    session: Session;
    fieldAnswers: FieldAnswers[];
    c: Context
} 