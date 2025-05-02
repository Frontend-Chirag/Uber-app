import { FlowType, EventType } from "@/types";
import { Role } from "@prisma/client";
import { OTP } from "../security/otp";


export interface UserSession {
    flowType: FlowType;
    role: Role;
    eventType?: EventType;
    firstname: string;
    lastname: string;
    isVerifiedEmail: boolean;
    isVerifiedPhonenumber: boolean;
}

export interface AdminSession {
    AdminId?: string;
}

export interface BaseSession {
    email: string;
    phoneCountryCode: string;
    phonenumber: string;
    otp: OTP;
}

export const SessionKeys = {
    USER: "USER",
    ADMIN: "ADMIN"
} as const;
;
export type SessionKey = keyof typeof SessionKeys;



export type SessionTypeMap = {
    [SessionKeys.USER]: BaseSession & UserSession,
    [SessionKeys.ADMIN]: BaseSession & AdminSession
};

interface SessionData<T> {
    id: string;
    data: T;
    createdAt: Date;
    expiresAt: Date;
    ip?: string;
};

interface RateLimit {
    count: number;
    lastAttempt: number;
}

export class SessionManager<T> {
    private sessionStore = new Map<string, SessionData<T>>();
    private ipSessionCount = new Map<string, number>();
    private rateLimits = new Map<string, RateLimit>();

    private readonly SESSION_TTL_MS = 15 * 60 * 1000;
    private readonly MAX_SESSIONS_PER_IP = 5;
    private readonly RATE_LIMIT_WINDOW = 10 * 60 * 1000;
    private readonly MAX_REQUESTS_PER_WINDOW = 10;

    constructor() { }

    async checkRateLimit(ip: string): Promise<boolean> {
        const now = Date.now();
        const rate = this.rateLimits.get(ip);

        if (!rate || now - rate.lastAttempt > this.RATE_LIMIT_WINDOW) {
            this.rateLimits.set(ip, { count: 1, lastAttempt: now });
            return false;
        }

        rate.count++;
        rate.lastAttempt = now;

        return rate.count > this.MAX_REQUESTS_PER_WINDOW;
    }

    async checkSessionLimit(ip: string): Promise<boolean> {
        const count = this.ipSessionCount.get(ip) || 0;
        if (count >= this.MAX_SESSIONS_PER_IP) return false;

        this.ipSessionCount.set(ip, count + 1);
        return true;
    }

    async cleanupRateLimits(): Promise<void> {
        const now = Date.now();
        for (const [ip, limit] of this.rateLimits.entries()) {
            if (now - limit.lastAttempt > this.RATE_LIMIT_WINDOW) {
                this.rateLimits.delete(ip);
            }
        }
    }

    async cleanupExpiredSessions(): Promise<void> {
        const now = Date.now();
        for (const [id, session] of this.sessionStore.entries()) {
            if (now > session.expiresAt.getTime()) {
                this.sessionStore.delete(id);

                if (session.ip) {
                    const count = this.ipSessionCount.get(session.ip) || 0;
                    this.ipSessionCount.set(session.ip, Math.max(0, count - 1));
                }
            }
        }
    }

    createSession(id: string, data: T, ip?: string, ttlMs = this.SESSION_TTL_MS): SessionData<T> {
        const now = new Date();
        const expiresAt = new Date(now.getTime() + ttlMs);
        const session = { id, data, createdAt: now, expiresAt, ip };

        this.sessionStore.set(id, session);
        return session;
    }

    getSession(id: string): SessionData<T> | null {
        return this.sessionStore.get(id) || null;
    }

    updateSession(id: string, updatedData: Partial<T>): SessionData<T> | null {
        const session = this.sessionStore.get(id);
        if (!session) return null;

        session.data = { ...session.data, ...updatedData };
        return session;
    }

    deleteSession(id: string) {
        this.sessionStore.delete(id)
        return
    }

    isSessionExpired(sessionId: string): boolean {
        const session = this.sessionStore.get(sessionId);
        if (!session) return true; // If session doesn't exist, treat as expired
    
        const now = Date.now();
        return now > session.expiresAt.getTime();
    }
    
}

const registry = new Map<SessionKey, SessionManager<any>>();

export function getSessionManager<k extends SessionKey>(
    type: k
): SessionManager<SessionTypeMap[k]> {

    if (!registry.has(type)) {
        registry.set(type, new SessionManager<SessionTypeMap[k]>());
    }

    return registry.get(type)!
}