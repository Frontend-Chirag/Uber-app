import { EventType, FlowType } from '@/types';
import { createClient, RedisClientType } from 'redis';
import { OTP } from '../services/security/otp';
import { v6 as uuid } from 'uuid';
import { userAgent } from 'next/server';


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

}

const Sessionkeys = {
    AUTH_SESSIONS: 'AUTH_SESSIONS',
    USER_SESSIONS: 'USER_SESSIONS',
} as const;


type Sessionkey = keyof typeof Sessionkeys;

type SessionTypeMap = {
    [Sessionkeys.AUTH_SESSIONS]: AuthUserSession,
    [Sessionkeys.USER_SESSIONS]: UserSession
}


interface SessionData<T> {
    id: string;
    data: T;
    createdAt: Date;
    expiresAt: Date;
    user_agent?: string;
    sessionType: Sessionkey;
}

interface RateLimit {
    count: number;
    lastAttempt: number;
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
    private readonly MAX_SESSIONS_PER_USER_AGENT = 5; // 15 minutes
    private readonly RATE_LIMIT_WINDOW = 10 * 50 * 1000; // 15 minutes
    private readonly MAX_REQUESTS_PER_WINDOW = 5; // 15 minutes
    private readonly CLEANUP_INTERVAL = 5 * 60 * 1000; // 15 minutes
    private readonly BATCH_SIZE = 100; // 15 minutes


    // Redis key prefixes
    private readonly SESSION_PREFIX = 'session:';
    private readonly RATE_LIMIT_PREFIX = 'rate_limit:';
    private readonly USER_AGENT_PREFIX = 'user_agent:';
    private readonly STATS_PREFIX = 'stats:';


    private constructor() {
        this.redisClient = createClient({
            url: process.env.REDIS_URL,
            socket: {
                reconnectStrategy: (retries) => {
                    if (retries > 10) {
                        console.error('Redis connection false')
                        return false;
                    }
                    return Math.min(retries * 100, 3000)
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
    };


    private async ensureConnection(): Promise<void> {
        if (this.isConnected) return;

        if (!this.connectionPromise) {
            this.connectionPromise = this.redisClient.connect()
        }

        await this.connectionPromise;
    }


    // Session Management Methods
    async createSession<T extends Sessionkey>(
        sessionType: T,
        id: string = uuid(),
        data: SessionTypeMap[T],
        user_agent: string,
        ttlMs: number = this.SESSION_TTL_MS,
        limit: number
    ): Promise<SessionData<SessionTypeMap[T]>> | null {
        try {
            await this.ensureConnection();

            // Check session limit for user agent 
            const canCreate = await this.checkSessionLimit(user_agent, limit);
            if (!canCreate) {
                throw new Error('Session limit exceeded for user agent');
            }
            const now = new Date();
            const expiresAt = new Date(now.getTime() + ttlMs)

            const session: SessionData<SessionTypeMap<T>> = {
                id,
                data,
                createdAt: now,
                expiresAt,
                user_agent,
                sessionType
            }

            const sessionkey = this.getSessionKey(sessionType, id)
            const sessionData = JSON.stringify(session);

            // use Redis pepeline for atomic operations

            const pipeline = this.redisClient.multi();

            // Set session data with TTL
            pipeline.setEx(sessionkey, Math.floor(ttlMs / 1000), sessionData)

            // update user agent sessioncount
            const userAgentkey = this.getUserAgentKey(user_agent);
            pipeline.hIncrBy(userAgentkey, sessionType, 1);
            pipeline.expire(userAgentkey, Math.floor(this.SESSION_TTL_MS))

            const statsKey = this.getStatsKey(sessionType);
            pipeline.hIncrBy(statsKey, 'totalSessions', 1);
            pipeline.hIncrBy(statsKey, 'activeSessions', 1);
            pipeline.expire(statsKey, 3600); // 1 hour TTL for stats

            await pipeline.exec();

            return session;
        } catch {
            console.error('Error creating session:', error);
            return null;
        }
    };

    async getSession<T extends Sessionkey>(
        sessionType: T,
        id: string
    ): Promise<SessionData<SessionTypeMap<T>> | null> {
        try {
            await this.ensureConnection();

            const sessionKey = this.getSesssionKey(sessionType, id);
            const sessionData = await this.redisClient.get(sessionKey);

            if (!sessionData) {
                return null;
            }

            const session: SessionData<SessionTypeMap[T]> = JSON.parse(sessionData);

            // check if session is expired
            if (new Date() > session.expiresAt) {
                await this.deleteSession(sessionType, id)
                return null;
            }

            return session;
        } catch (error) {
            console.error('Error getting session:', error);
            return null;
        }
    }


    async updateSession<T extends Sessionkey>(
        sessionType: T,
        id: string,
        updatedData: Partial<SessionTypeMap[T]>
    ): Promise<SessionData<SessionTypeMap[T]> | null> {
        try {
            await this.ensureConnection();

            const session = await this.getSession(sessionType, id);
            if (!session) {
                return null;
            }

            session.data = { ...session.data, ...updatedData };

            const sessionKey = this.getSessionKey(sessionType, id);
            const sessionData = JSON.stringify(session);

            const ttl = await this.redisClient.ttl(sessionKey);
            if (ttl > 0) {
                await this.redisClient.setEx(sessionKey, ttl, sessionData);
            }

            return session

        } catch (error) {
            console.error('Error updating session:', error);
            return null;
        }

    }

    async deleteSession<T extends Sessionkey>(
        sessionType: T,
        id: string
    ): Promise<boolean>{
        try{

            await this.ensureConnection();

            const sessionKey = this.getSessionKey(sessionType, id);
            const session = await this.getSession(sessionType, id);

            if (!session) {
                return false;
            }

            const pipeline = this.redisClient.multi();

            // Delete session
            pipeline.del(sessionKey);

            // Decrement user agent session count
        



        }catch(error){

        }
    }


}
