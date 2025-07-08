import { FlowType, EventType } from "@/types";
import { OTP } from "../security/otp";
import { v4 as uuid } from 'uuid';
import { Redis } from '@upstash/redis'
const redis = Redis.fromEnv()


export interface AuthUserSession {
    flowType: FlowType;
    eventType?: EventType;
    firstname: string;
    lastname: string;
    isVerifiedEmail: boolean;
    isVerifiedPhonenumber: boolean;
    email: string;
    phoneCountryCode: string;
    phonenumber: string;
    otp: OTP;
}

export interface UserSession {
    userId: string
}

export const SessionKeys = {
    AUTH_SESSION: "AUTH_SESSION",
    USER_SESSION: "USER_SESSION"
} as const;

export type SessionKey = keyof typeof SessionKeys;

export type SessionTypeMap = {
    [SessionKeys.AUTH_SESSION]: AuthUserSession,
    [SessionKeys.USER_SESSION]: UserSession
};

interface SessionData<T> {
    id: string;
    data: T;
    createdAt: Date;
    expiresAt: Date;
    visitorId?: string;
    sessionType: SessionKey;
}

interface SessionStats {
    totalSessions: number;
    activeSessions: number;
    expiredSessions: number;
}

// Option interfaces for session operations
export interface CreateSessionOptions<T extends SessionKey> {
    data: SessionTypeMap[T];
    sessionType: T;
    visitorId: string;
    ttlMs?: number;
}

export interface GetSessionOptions<T extends SessionKey = SessionKey> {
    id: string;
    sessionType: T;
    visitorId?: string;
}

export interface UpdateSessionOptions<T extends SessionKey> {
    id: string;
    sessionType: T;
    updatedData: Partial<SessionTypeMap[T]>;
}

export interface DeleteSessionOptions {
    id: string;
    sessionType: SessionKey;
}

export class RedisSessionService {
    private static instance: RedisSessionService;
    private redisClient: Redis;
    private isConnected: boolean = false;
    private connectionPromise: Promise<void> | null = null;

    // Configuration constants
    private readonly SESSION_TTL_MS = 15 * 60 * 1000; // 15 minutes
    private readonly MAX_SESSIONS_PER_USER_FINGER_PRINT = 5;
    private readonly RATE_LIMIT_WINDOW = 10 * 60 * 1000; // 10 minutes
    private readonly MAX_REQUESTS_PER_WINDOW = 10;
    private readonly CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes
    private readonly BATCH_SIZE = 100;

    // Redis key prefixes
    private readonly SESSION_PREFIX = 'session:';
    private readonly RATE_LIMIT_PREFIX = 'rate_limit:';
    private readonly VISITOR_ID_PREFIX = 'user_agent:';
    private readonly STATS_PREFIX = 'stats:';


    private constructor() {
        this.redisClient = Redis.fromEnv({
            retry: {
                retries: 5,
                backoff: (retryCount) => Math.exp(retryCount) * 50,
            }
        });
        this.startCleanupInterval();
    }

    public static getInstance(): RedisSessionService {
        if (!RedisSessionService.instance) {
            RedisSessionService.instance = new RedisSessionService();
        }
        return RedisSessionService.instance;
    }

    /**
     * Create a new session in Redis.
     */
    async createSession<T extends SessionKey>(options: CreateSessionOptions<T>): Promise<SessionData<SessionTypeMap[T]> | null> {
        const { data, sessionType, visitorId, ttlMs = this.SESSION_TTL_MS } = options;
        const id = uuid();
        try {
            const canCreate = await this.checkSessionLimit(visitorId);
            console.log('can create', canCreate)
            if (!canCreate) {
                throw new Error('Session limit exceeded for user agent');
            }
            console.log('create', canCreate)
            const now = new Date();
            const expiresAt = new Date(now.getTime() + ttlMs);
            const session: SessionData<SessionTypeMap[T]> = {
                id,
                data,
                createdAt: now,
                expiresAt,
                visitorId,
                sessionType
            };
            const sessionKey = this.getSessionKey(sessionType, id);
            const sessionData = JSON.stringify(session);
            const pipeline = this.redisClient.pipeline();

            pipeline.setex(sessionKey, Math.floor(ttlMs / 1000), sessionData);
            const userFingerPrintKey = this.getVisitorKey(visitorId);
            pipeline.hincrby(userFingerPrintKey, sessionType, 1);
            pipeline.expire(userFingerPrintKey, Math.floor(this.SESSION_TTL_MS / 1000));
            const statsKey = this.getStatsKey(sessionType);
            pipeline.hincrby(statsKey, 'totalSession', 1);
            pipeline.hincrby(statsKey, 'activeSession', 1);
            pipeline.expire(statsKey, 3600);
            await pipeline.exec();
            return session;
        } catch (error) {
            console.error('Error creating session:', error);
            return null;
        }
    }

    /**
     * Get a session from Redis.
     */
    async getSession<T extends SessionKey>(options: GetSessionOptions<T>): Promise<SessionData<SessionTypeMap[T]> | null> {
        const { id, sessionType, visitorId } = options;

        try {
            const sessionKey = this.getSessionKey(sessionType, id);
            console.log(sessionKey);
            const raw = await redis.get(sessionKey);

            if (!raw) return null;

            const session: SessionData<SessionTypeMap[T]> = raw as SessionData<SessionTypeMap[T]>;
            if (new Date() > session.expiresAt) {
                await this.deleteSession({ id, sessionType });
                return null;
            }

            if (visitorId && session.visitorId !== visitorId) return null;

            return session;
        } catch (error) {
            console.error('Error getting session:', error);
            return null;
        }
    }

    /**
     * Update a session in Redis.
     */
    async updateSession<T extends SessionKey>(options: UpdateSessionOptions<T>): Promise<SessionData<SessionTypeMap[T]> | null> {
        const { id, sessionType, updatedData } = options;
        try {

            const sessionKey = this.getSessionKey(sessionType, id);
            console.log(sessionKey)
            const session = await this.getSession({ id, sessionType }) as SessionData<SessionTypeMap[T]>;

            if (!session) return null;
            session.data = { ...session.data, ...updatedData };
            const ttl = await this.redisClient.ttl(sessionKey);
            const sessionStr = JSON.stringify(session);
            await this.redisClient.setex(
                sessionKey,
                ttl > 0 ? ttl : Math.floor(this.SESSION_TTL_MS / 1000),
                sessionStr
            );
            console.log('updated',sessionStr , ttl, await this.redisClient.setex(
                sessionKey,
                ttl > 0 ? ttl : Math.floor(this.SESSION_TTL_MS / 1000),
                sessionStr
            ))
            return session;
        } catch (error) {
            console.error('Error updating session:', error);
            return null;
        }
    }

    /**
     * Delete a session from Redis.
     */
    async deleteSession(options: DeleteSessionOptions): Promise<boolean> {
        const { id, sessionType } = options;
        try {
            const sessionKey = this.getSessionKey(sessionType, id);
            const session = await this.getSession({ id, sessionType });
            if (!session) return false;
            const pipeline = this.redisClient.multi();
            pipeline.del(sessionKey);
            if (session.visitorId) {
                const userFingerPrintKey = this.getVisitorKey(session.visitorId);
                pipeline.hincrby(userFingerPrintKey, sessionType, -1);
            }
            const statsKey = this.getStatsKey(sessionType);
            pipeline.hincrby(statsKey, 'activeSessions', -1);
            pipeline.hincrby(statsKey, 'expiredSessions', 1);
            await pipeline.exec();
            return true;
        } catch (error) {
            console.error('Error deleting session:', error);
            return false;
        }
    }

    async getAllSessions<T extends SessionKey>(
        sessionType: T
    ): Promise<SessionData<SessionTypeMap[T]>[]> {
        try {

            const pattern = this.getSessionKey(sessionType, '*');
            let cursor = "0";
            const sessions: SessionData<SessionTypeMap[T]>[] = [];

            do {
                const [newCursor, keys] = await this.redisClient.scan(cursor, {
                    match: pattern,
                    count: this.BATCH_SIZE
                })

                cursor = newCursor;

                if (keys.length > 0) {
                    const pipeline = this.redisClient.multi();
                    keys.forEach(key => pipeline.get(key));
                    const results = await pipeline.exec() as Array<[Error | null, string | null]>;
                    results?.forEach(([err, value]) => {
                        if (!err && value) {
                            try {
                                const session = JSON.parse(value);
                                if (new Date() <= new Date(session.expiresAt)) {
                                    sessions.push(session);
                                }
                            } catch (e) {
                                console.error('Error parsing session:', e);
                            }
                        }
                    })
                }
            } while (cursor !== "0")

            return sessions;
        } catch (error) {
            console.error('Error getting all sessions:', error);
            return [];
        }
    }

    async checkRateLimit(userFingerPrint: string): Promise<boolean> {
        try {

            const rateLimitKey = this.getRateLimitKey(userFingerPrint);
            const now = Date.now();

            const pipeline = this.redisClient.pipeline();
            pipeline.get(rateLimitKey);
            pipeline.ttl(rateLimitKey);

            const results = await pipeline.exec() as Array<[Error | null, string | null]>;
            const [countResult, ttlResult] = results;

            const currentCount = countResult?.[1] ? parseInt(countResult[1] as string) : 0;
            const ttl = ttlResult?.[1] ? parseInt(ttlResult[1] as string) : -1;
            if (ttl === -1 || ttl === -2) {
                // No rate limit exists or expired, create new one
                await this.redisClient.setex(
                    rateLimitKey,
                    Math.floor(this.RATE_LIMIT_WINDOW / 1000),
                    '1'
                );
                return false;
            }

            const newCount = currentCount + 1;
            await this.redisClient.setex(
                rateLimitKey,
                Math.floor(this.RATE_LIMIT_WINDOW / 1000),
                newCount.toString()
            );

            return newCount > this.MAX_REQUESTS_PER_WINDOW;
        } catch (error) {
            console.error('Error checking rate limit:', error);
            return false;
        }
    }

    async getSessionStats<T extends SessionKey>(
        sessionType: T
    ): Promise<SessionStats> {
        try {
            const statsRaw = await redis.hgetall(this.getStatsKey(sessionType));
            const stats = statsRaw ?? {}; // fallback to empty object if null

            return {
                totalSessions: parseInt((stats as Record<string, string>).totalSessions ?? '0'),
                activeSessions: parseInt((stats as Record<string, string>).activeSessions ?? '0'),
                expiredSessions: parseInt((stats as Record<string, string>).expiredSessions ?? '0')
            };
        } catch (error) {
            console.error('Error getting session stats:', error);
            return { totalSessions: 0, activeSessions: 0, expiredSessions: 0 };
        }
    }

    async getActiveSessionsCount<T extends SessionKey>(
        sessionType: T
    ): Promise<number> {
        try {

            const pattern = this.getSessionKey(sessionType, '*');
            let cursor = "0";
            let count = 0;

            do {
                const [newCursor, keys] = await this.redisClient.scan(cursor, {
                    match: pattern,
                    count: this.BATCH_SIZE
                });
                cursor = newCursor;
                count += keys.length;
            } while (cursor !== "0");

            return count;
        } catch (error) {
            console.error('Error getting active sessions count:', error);
            return 0;
        }
    }

    private async cleanupExpiredSessions(): Promise<void> {
        try {

            for (const sessionType of Object.values(SessionKeys)) {
                let cursor = "0";
                const pattern = this.getSessionKey(sessionType, '*');

                do {
                    const [newCursor, keys] = await this.redisClient.scan(cursor, {
                        match: pattern,
                        count: this.BATCH_SIZE
                    });
                    cursor = newCursor;

                    if (keys.length === 0) continue;

                    const pipeline = this.redisClient.multi();
                    keys.forEach(key => pipeline.get(key));
                    const results = await pipeline.exec();

                    console.log(results.map((result) => {
                        const data = Array.from(result);
                        console.log('cleanup session:result ',result)
                    }))

                    const deletions = results?.map(async ([err, value], index) => {
                        if (!err && value) {
                            try {
                                const session = JSON.parse(value);
                                if (new Date() > new Date(session.expiresAt)) {
                                    await this.deleteSession({ id: session.id, sessionType });
                                }
                            } catch {
                                await this.redisClient.del(keys[index]);
                            }
                        }
                    }) ?? [];

                    await Promise.all(deletions);
                } while (cursor !== "0");
            }
        } catch (error) {
            console.error('Error cleaning up expired sessions:', error);
        }
    }

    private startCleanupInterval(): void {
        setInterval(() => {
            this.cleanupExpiredSessions();
        }, this.CLEANUP_INTERVAL);
    }

    private getRateLimitKey(user_agent: string): string {
        return `${this.RATE_LIMIT_PREFIX}${user_agent}`;
    }

    // check session limit for user fingerPrint 
    async checkSessionLimit(visitorId: string): Promise<boolean> {
        try {

            const visitorKey = this.getVisitorKey(visitorId);
            const sessionCounts = await redis.hgetall(visitorKey) as Record<string, string> | null;

            if (!sessionCounts) return true; // No sessions yet

            const totalSessions = Object.values(sessionCounts).reduce(
                (sum, count) => sum + parseInt(count || '0', 10),
                0
            );

            return totalSessions < this.MAX_SESSIONS_PER_USER_FINGER_PRINT;
        } catch (error) {
            console.error('Error checking session limit:', error);
            return false;
        }
    }

    private getSessionKey(sessionType: SessionKey, id: string): string {
        return `${this.SESSION_PREFIX}${sessionType}:${id}`;
    };

    private getVisitorKey(visitorId: string): string {
        return `${this.VISITOR_ID_PREFIX}${visitorId}`;
    };

    private getStatsKey(sessionType: SessionKey): string {
        return `${this.STATS_PREFIX}${sessionType}`;
    }

    async isSessionExpired<T extends SessionKey>(
        sessionType: T,
        sessionId: string
    ): Promise<boolean> {
        try {
            const session = await this.getSession({ id: sessionId, sessionType });
            return !session || new Date() > session.expiresAt;
        } catch (error) {
            console.error('Error checking session expiration:', error);
            return true;
        }
    }

    // Health Check Method
    async healthCheck(): Promise<boolean> {
        try {
            await this.redisClient.ping();
            return true;
        } catch (error) {
            console.error('Redis health check failed:', error);
            return false;
        }
    }

}

export const redisSessionService = RedisSessionService.getInstance();



export function getSessionManager<T extends SessionKey>(sessionType: T) {
    return {
        createSession: (options: Omit<CreateSessionOptions<T>, 'sessionType'>) =>
            redisSessionService.createSession({ ...options, sessionType }),
        getSession: (id: string, visitorId?: string) =>
            redisSessionService.getSession<T>({ id, sessionType, visitorId }),
        updateSession: (id: string, updatedData: Partial<SessionTypeMap[T]>) =>
            redisSessionService.updateSession<T>({ id, sessionType, updatedData }),
        deleteSession: (id: string) =>
            redisSessionService.deleteSession({ id, sessionType }),
        getAllSessions: () => redisSessionService.getAllSessions(sessionType),
        isSessionExpired: (sessionId: string) => redisSessionService.isSessionExpired(sessionType, sessionId),
        checkRateLimit: (userFingerPrint: string) => redisSessionService.checkRateLimit(userFingerPrint)
    };
}