import { FlowType, EventType } from "@/types";
import { Role } from "@prisma/client";
import { OTP } from "../security/otp";


export interface AuthUserSession {
    flowType: FlowType;
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
    AUTH_USER: "AUTH_USER",
    ADMIN: "ADMIN"
} as const;
;
export type SessionKey = keyof typeof SessionKeys;



export type SessionTypeMap = {
    [SessionKeys.AUTH_USER]: BaseSession & AuthUserSession,
    [SessionKeys.ADMIN]: BaseSession & AdminSession
};

interface SessionData<T> {
    id: string;
    data: T;
    createdAt: Date;
    expiresAt: Date;
    user_agent?: string;
};

interface RateLimit {
    count: number;
    lastAttempt: number;
}

export class SessionManager<T> {
    private sessionStore = new Map<string, SessionData<T>>();
    private user_agent_SessionCount = new Map<string, number>();
    private rateLimits = new Map<string, RateLimit>();

    private readonly SESSION_TTL_MS = 15 * 60 * 1000;
    private readonly MAX_SESSIONS_PER_user_agent = 5;
    private readonly RATE_LIMIT_WINDOW = 10 * 60 * 1000;
    private readonly MAX_REQUESTS_PER_WINDOW = 10;

    constructor() { }

    async getAllSession() {
        return this.sessionStore;
    }

    async checkRateLimit(user_agent: string): Promise<boolean> {
        const now = Date.now();
        const rate = this.rateLimits.get(user_agent);

        console.log('user agent', user_agent, rate)

        if (!rate || now - rate.lastAttempt > this.RATE_LIMIT_WINDOW) {
            this.rateLimits.set(user_agent, { count: 1, lastAttempt: now });
            console.log(this.rateLimits.get(user_agent))
            return false;
        }

        rate.count++;
        rate.lastAttempt = now;


        return rate.count > this.MAX_REQUESTS_PER_WINDOW;
    }

    async checkSessionLimit(user_agent: string): Promise<boolean> {
        const count = this.user_agent_SessionCount.get(user_agent) || 0;
        if (count >= this.MAX_SESSIONS_PER_user_agent) return false;

        this.user_agent_SessionCount.set(user_agent, count + 1);
        return true;
    }

    async cleanupRateLimits(): Promise<void> {
        const now = Date.now();
        for (const [user_agent, limit] of this.rateLimits.entries()) {
            if (now - limit.lastAttempt > this.RATE_LIMIT_WINDOW) {
                this.rateLimits.delete(user_agent);
            }
        }
    }

    async cleanupExpiredSessions(): Promise<void> {
        const now = Date.now();
        for (const [id, session] of this.sessionStore.entries()) {
            if (now > session.expiresAt.getTime()) {
                this.sessionStore.delete(id);
                console.log('delete session')
                if (session.user_agent) {
                    const count = this.user_agent_SessionCount.get(session.user_agent) || 0;
                    this.user_agent_SessionCount.set(session.user_agent, Math.max(0, count - 1));
                }
            }
        }
    }

    createSession(id: string, data: T, user_agent: string, ttlMs = this.SESSION_TTL_MS): SessionData<T> {
        const now = new Date();
        const expiresAt = new Date(now.getTime() + ttlMs);
        const session = { id, data, createdAt: now, expiresAt, user_agent };

        this.sessionStore.set(id, session);
        return session;
    }

    getSession(id: string, data: T | null = null, user_agent: string | null = null): SessionData<T> | null {
        let session = this.sessionStore.get(id) || null;
        if (!session && data && user_agent) {
            console.log('creating a session')
            return this.createSession(id, data, user_agent);
        }
        return session;
    }

    updateSession(id: string, updatedData: Partial<T>): SessionData<T> | null {
        const session = this.sessionStore.get(id);
        if (!session) return null;

        session.data = { ...session.data, ...updatedData };
        this.sessionStore.set(id, session)
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