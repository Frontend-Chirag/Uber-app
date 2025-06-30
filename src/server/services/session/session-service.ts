

import { FlowType, EventType } from "@/types";
import { OTP } from "../security/otp";
import { createClient, RedisClientType } from 'redis';
import { v4 as uuid } from 'uuid';
import { keys } from "lodash";



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
    userFingerPrint?: string;
    sessionType: SessionKey;
}


interface SessionStats {
    totalSessions: number;
    activeSessions: number;
    expiredSessions: number;
}


export class RedisSessionService {
    private static instance: RedisSessionService;
    private redisClient: RedisClientType;
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
    private readonly USER_FINGER_PRINT_PREFIX = 'user_agent:';
    private readonly STATS_PREFIX = 'stats:';


    private constructor() {
        this.redisClient = createClient({
            url: process.env.REDIS_URL,
            socket: {
                reconnectStrategy: (retries) => {
                    if (retries > 10) {
                        console.error('Redis connection failed after 10 retries');
                        return false;
                    }
                    return Math.min(retries * 100, 3000);
                }
            }
        });

        this.setupEventHandlers();
        this.startCleanupInterval();
    }


    public static getInstance(): RedisSessionService {
        if (!RedisSessionService.instance) {
            RedisSessionService.instance = new RedisSessionService();
        }
        return RedisSessionService.instance;
    }

    private setupEventHandlers(): void {
        this.redisClient.on('connect', () => {
            console.log('Redis client connected');
            this.isConnected = true;
        });

        this.redisClient.on('error', (err) => {
            console.error('Redis client error:', err);
            this.isConnected = false;
        });

        this.redisClient.on('end', () => {
            console.log('Redis client disconnected');
            this.isConnected = false;
        });
    }


    private async ensureConnection(): Promise<void> {
        if (this.isConnected) return;

        if (!this.connectionPromise) {
            this.connectionPromise = this.redisClient.connect().then(() => console.log('Redis client connected successfully'));
        }

        await this.connectionPromise;
    }



    // create session
    async createSession<T extends SessionKey>(
        id: string = uuid(),
        data: SessionTypeMap[T],
        sessionType: T,
        userFingerPrint: string,
        ttlMs: number = this.SESSION_TTL_MS,
    ): Promise<SessionData<SessionTypeMap[T]> | null> {
        try {
            await this.ensureConnection();

            // check session limit for user fingerPrint
            const canCreate = await this.checkSessionLimit(userFingerPrint);
            if (!canCreate) {
                throw new Error('Session limit exceeded for user agent');
            }

            const now = new Date();
            const expiresAt = new Date(now.getTime() + ttlMs);

            const session: SessionData<SessionTypeMap[T]> = {
                id,
                data,
                createdAt: now,
                expiresAt,
                userFingerPrint,
                sessionType
            };

            const sessionKey = this.getSessionKey(sessionType, id);
            const sessionData = JSON.stringify(session)
            // Redis pipeline 
            const pipeline = this.redisClient.multi();

            pipeline.setEx(sessionKey, Math.floor(ttlMs / 1000), sessionData);

            const userFingerPrintKey = this.getUserFingerPrintKey(userFingerPrint);
            pipeline.hIncrBy(userFingerPrintKey, sessionType, 1);
            pipeline.expire(userFingerPrintKey, Math.floor(this.SESSION_TTL_MS / 1000));

            const statsKey = this.getStatsKey(sessionType);
            pipeline.hIncrBy(statsKey, 'totalSession', 1);
            pipeline.hIncrBy(statsKey, 'activeSession', 1);
            pipeline.expire(statsKey, 3600);

            await pipeline.exec();

            return session;
        } catch (error) {
            console.error('Error creating session:', error);
            return null;
        }
    };

    async getSession<T extends SessionKey>(
        sessionType: T,
        id: string,
        userFingerPrint?: string,
        ttlMs?: number
    ): Promise<SessionData<SessionTypeMap[T]> | null> {
        try {
            await this.ensureConnection();

            const sessionKey = this.getSessionKey(sessionType, id);
            const sessionData = await this.redisClient.get(sessionKey);

            if (!sessionData) {
                return await this.createSession(id, {} as SessionTypeMap[T], sessionType, userFingerPrint!, ttlMs!);
            };

            console.log('before parsing a data', sessionData);

            const session: SessionData<SessionTypeMap[T]> = JSON.parse(sessionData);

            console.log('with parsing a data', sessionData);

            if (new Date() > session.expiresAt) {
                await this.deleteSession(sessionType, id);
                return null
            }

            if (userFingerPrint && session.userFingerPrint !== userFingerPrint) return null;

            return session;
        } catch (error) {
            console.error('Error getting session:', error);
            return null;
        }
    };


    async updateSession<T extends SessionKey>(
        sessionType: T,
        id: string,
        updatedData: Partial<SessionTypeMap[T]>
    ): Promise<SessionData<SessionTypeMap[T]> | null> {
        try {
            await this.ensureConnection();

            const session = await this.getSession(sessionType, id);
            if (!session) return null;

            session.data = { ...session.data, ...updatedData };


            const sessionKey = this.getSessionKey(sessionType, id);
            const ttl = await this.redisClient.ttl(sessionKey);

            const sessionStr = JSON.stringify(session);
            await this.redisClient.setEx(
                sessionKey,
                ttl > 0 ? ttl : Math.floor(this.SESSION_TTL_MS / 1000),
                sessionStr
            );

            return session;
        } catch (error) {
            console.error('Error updating session:', error);
            return null;
        }
    }

    async deleteSession<T extends SessionKey>(
        sessionType: T,
        id: string
    ): Promise<boolean> {
        try {
            await this.ensureConnection();

            const sessionKey = this.getSessionKey(sessionType, id);
            const session = await this.getSession(sessionType, id);

            if (!session) return false;

            const pipeline = this.redisClient.multi();
            pipeline.del(sessionKey);

            if (session.userFingerPrint) { // or userFingerPrint if you changed naming
                const userFingerPrintKey = this.getUserFingerPrintKey(session.userFingerPrint);
                pipeline.hIncrBy(userFingerPrintKey, sessionType, -1);
            }

            const statsKey = this.getStatsKey(sessionType);
            pipeline.hIncrBy(statsKey, 'activeSessions', -1);
            pipeline.hIncrBy(statsKey, 'expiredSessions', 1);

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
            await this.ensureConnection();

            const pattern = this.getSessionKey(sessionType, '*');
            let cursor = 0;
            const sessions: SessionData<SessionTypeMap[T]>[] = [];

            do {
                const { cursor: newCursor, keys } = await this.redisClient.scan(cursor, {
                    MATCH: pattern,
                    COUNT: this.BATCH_SIZE
                });

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
            } while (cursor !== 0)

            return sessions;
        } catch (error) {
            console.error('Error getting all sessions:', error);
            return [];
        }
    }

    async checkRateLimit(userFingerPrint: string): Promise<boolean> {
        try {
            await this.ensureConnection();

            const rateLimitKey = this.getRateLimitKey(userFingerPrint);
            const now = Date.now();

            const pipeline = this.redisClient.multi();
            pipeline.get(rateLimitKey);
            pipeline.ttl(rateLimitKey);

            const results = await pipeline.exec() as Array<[Error | null, string | null]>;
            const [countResult, ttlResult] = results;

            const currentCount = countResult?.[1] ? parseInt(countResult[1] as string) : 0;
            const ttl = ttlResult?.[1] ? parseInt(ttlResult[1] as string) : -1;
            if (ttl === -1 || ttl === -2) {
                // No rate limit exists or expired, create new one
                await this.redisClient.setEx(
                    rateLimitKey,
                    Math.floor(this.RATE_LIMIT_WINDOW / 1000),
                    '1'
                );
                return false;
            }

            const newCount = currentCount + 1;
            await this.redisClient.setEx(
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
            await this.ensureConnection();

            const statsKey = this.getStatsKey(sessionType);
            const stats = await this.redisClient.hGetAll(statsKey);

            return {
                totalSessions: parseInt(stats.totalSessions || '0'),
                activeSessions: parseInt(stats.activeSessions || '0'),
                expiredSessions: parseInt(stats.expiredSessions || '0')
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
            await this.ensureConnection();

            const pattern = this.getSessionKey(sessionType, '*');
            let cursor = 0;
            let count = 0;

            do {
                const { cursor: newCursor, keys } = await this.redisClient.scan(cursor, {
                    MATCH: pattern,
                    COUNT: this.BATCH_SIZE
                });
                cursor = newCursor;
                count += keys.length;
            } while (cursor !== 0);

            return count;
        } catch (error) {
            console.error('Error getting active sessions count:', error);
            return 0;
        }
    }

    private async cleanupExpiredSessions(): Promise<void> {
        try {
            await this.ensureConnection();

            for (const sessionType of Object.values(SessionKeys)) {
                let cursor = 0;
                const pattern = this.getSessionKey(sessionType, '*');

                do {
                    const { cursor: newCursor, keys } = await this.redisClient.scan(cursor, {
                        MATCH: pattern,
                        COUNT: this.BATCH_SIZE
                    });
                    cursor = newCursor;

                    if (keys.length === 0) continue;

                    const pipeline = this.redisClient.multi();
                    keys.forEach(key => pipeline.get(key));
                    const results = await pipeline.exec() as Array<[Error | null, string | null]>;

                    const deletions = results?.map(async ([err, value], index) => {
                        if (!err && value) {
                            try {
                                const session = JSON.parse(value);
                                if (new Date() > new Date(session.expiresAt)) {
                                    await this.deleteSession(session.sessionType, session.id);
                                }
                            } catch {
                                await this.redisClient.del(keys[index]);
                            }
                        }
                    }) ?? [];

                    await Promise.all(deletions);
                } while (cursor !== 0);
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
    async checkSessionLimit(userFingerPrint: string): Promise<boolean> {
        try {

            await this.ensureConnection();

            const userFingerPrintKey = this.getUserFingerPrintKey(userFingerPrint);
            const sessionCounts = await this.redisClient.hGetAll(userFingerPrintKey);

            const totalSessions = Object.values(sessionCounts).reduce(
                (sum, count) => sum + parseInt(count || '0'),
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

    private getUserFingerPrintKey(userFingerPrint: string): string {
        return `${this.USER_FINGER_PRINT_PREFIX}${userFingerPrint}`;
    };

    private getStatsKey(sessionType: SessionKey): string {
        return `${this.STATS_PREFIX}${sessionType}`;
    }



    async isSessionExpired<T extends SessionKey>(
        sessionType: T,
        sessionId: string
    ): Promise<boolean> {
        try {
            const session = await this.getSession(sessionType, sessionId);
            return !session || new Date() > session.expiresAt;
        } catch (error) {
            console.error('Error checking session expiration:', error);
            return true;
        }
    }

    // Health Check Method
    async healthCheck(): Promise<boolean> {
        try {
            await this.ensureConnection();
            await this.redisClient.ping();
            return true;
        } catch (error) {
            console.error('Redis health check failed:', error);
            return false;
        }
    }

    // Graceful Shutdown
    async disconnect(): Promise<void> {
        try {
            if (this.isConnected) {
                await this.redisClient.quit();
                this.isConnected = false;
            }
        } catch (error) {
            console.error('Error disconnecting Redis client:', error);
        }
    }

}

export const redisSessionService = RedisSessionService.getInstance();

export function getSessionManager<T extends SessionKey>(sessionType: T
): {
    createSession: (args: {
        id?: string;
        data: SessionTypeMap[T];
        userFingerPrint: string;
        ttlMs?: number;
    }) => Promise<SessionData<SessionTypeMap[T]> | null>;
    getSession: (id: string, userFingerPrint?: string, ttlMs?: number) => Promise<SessionData<SessionTypeMap[T]> | null>;
    updateSession: (id: string, updatedData: Partial<SessionTypeMap[T]>) => Promise<SessionData<SessionTypeMap[T]> | null>;
    deleteSession: (id: string) => Promise<boolean>;
    getAllSessions: () => Promise<SessionData<SessionTypeMap[T]>[]>;
    isSessionExpired: (sessionId: string) => Promise<boolean>;
} {
    return {
        createSession: ({
            id = uuid(),
            data,
            userFingerPrint,
            ttlMs,
        }: {
            id?: string;
            data: SessionTypeMap[T];
            userFingerPrint: string;
            ttlMs?: number;
        }) =>
            redisSessionService.createSession(id, data, sessionType, userFingerPrint, ttlMs),
        getSession: (id: string, userFingerPrint?: string, ttlMs?: number) => redisSessionService.getSession(sessionType, id, userFingerPrint, ttlMs),
        updateSession: (id: string, updatedData: Partial<SessionTypeMap[T]>) =>
            redisSessionService.updateSession(sessionType, id, updatedData),
        deleteSession: (id: string) => redisSessionService.deleteSession(sessionType, id),
        getAllSessions: () => redisSessionService.getAllSessions(sessionType),
        isSessionExpired: (sessionId: string) => redisSessionService.isSessionExpired(sessionType, sessionId)
    };
}