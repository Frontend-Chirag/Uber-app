import { FlowType, sessionData } from '@/types';
import { createClient, RedisClientType } from 'redis';

class RedisService {
    private static instance: RedisService;
    private client: RedisClientType;
    private isConnected: boolean = false;
    private readonly maxRetries = 3;
    private readonly retryInterval = 5000; // 5 seconds

    private constructor() {
        this.client = createClient({
            username: 'default',
            password: '1PDiRy73cHrscPMZlIBONcVL9l8SwIId',
            socket: {
                host: 'redis-15696.c305.ap-south-1-1.ec2.redns.redis-cloud.com',
                port: 15696,
                reconnectStrategy: (retries: number) => {
                    if (retries > this.maxRetries) {
                        return new Error('Max reconnection attempts exceeded');
                    }
                    return this.retryInterval;
                }
            },
        });

        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        this.client.on('error', (err) => console.error('Redis Client Error:', err));
        this.client.on('connect', () => {
            console.log('Redis Client Connected');
            this.isConnected = true;
        });
        this.client.on('end', () => {
            console.log('Redis Client Disconnected');
            this.isConnected = false;
        });
    }

    public static getInstance(): RedisService {
        if (!RedisService.instance) {
            RedisService.instance = new RedisService();
        }
        return RedisService.instance;
    }

    public async connect(): Promise<void> {
        if (!this.isConnected) {
            await this.client.connect();
        }
    }

    public async disconnect(): Promise<void> {
        if (this.isConnected) {
            await this.client.disconnect();
        }
    }

    // Constants
    private static readonly SESSION_TTL = 60 * 60 * 24; // 24 hours
    public static readonly SESSION_COOKIE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

    private async ensureConnection(): Promise<void> {
        if (!this.isConnected) {
            await this.connect();
        }
    }

    public async createFormSession({ sessionId, data }: CreateSessionProps): Promise<CreateSessionProps> {
        await this.ensureConnection();

        const session: sessionData = {
            email: data?.email ?? null,
            phonenumber: data?.phonenumber ?? null,
            phoneCountryCode: data?.phoneCountryCode ?? null,
            emailVerified: data?.emailVerified ?? false,
            phoneVerified: data?.phoneVerified ?? false,
            flowState: data?.flowState ?? FlowType.INITIAL,
            firstname: data?.firstname ?? null,
            lastname: data?.lastname ?? null,
            otp: data?.otp ?? { value: null, expiresAt: null },
            type: data?.type ?? null
        };

        try {
            await this.client.set(sessionId, JSON.stringify(session), {
                EX: RedisService.SESSION_TTL
            });
            return { data: session, sessionId };
        } catch (error) {
            console.error('Error creating session:', error);
            throw new Error('Failed to create session');
        }
    }

    public async getFormSession(sessionId: string): Promise<{ data: sessionData; sessionId: string }> {
        await this.ensureConnection();

        try {
            const data = await this.client.get(sessionId);
            if (!data) {
                throw new Error(`Session with ID ${sessionId} not found`);
            }
            return { data: JSON.parse(data), sessionId };
        } catch (error) {
            console.error('Error getting session:', error);
            throw error;
        }
    }

    public async updateFormSession(sessionId: string, updates: Partial<sessionData>): Promise<sessionData> {
        await this.ensureConnection();

        try {
            const sessionData = await this.client.get(sessionId);
            if (!sessionData) {
                throw new Error(`Session with ID ${sessionId} not found`);
            }

            const session = JSON.parse(sessionData);
            const updatedSession = { ...session, ...updates };

            await this.client.set(sessionId, JSON.stringify(updatedSession), {
                EX: RedisService.SESSION_TTL // Reset TTL on update
            });

            return updatedSession;
        } catch (error) {
            console.error('Error updating session:', error);
            throw error;
        }
    }

    public async deleteFormSession(sessionId: string): Promise<void> {
        await this.ensureConnection();

        try {
            await this.client.del(sessionId);
        } catch (error) {
            console.error('Error deleting session:', error);
            throw new Error('Failed to delete session');
        }
    }

    public async restartFormSession(sessionId: string, data: sessionData): Promise<void> {
        await this.ensureConnection();

        try {
            await this.deleteFormSession(sessionId);
            await this.createFormSession({ sessionId, data });
        } catch (error) {
            console.error('Error restarting session:', error);
            throw new Error('Failed to restart session');
        }
    }
}

// Export singleton instance and types
export const redisService = RedisService.getInstance();
export const { SESSION_COOKIE_TTL } = RedisService;
export type { CreateSessionProps };

interface CreateSessionProps {
    sessionId: string;
    data: sessionData | null;
}

// Initialize connection when the service is imported
redisService.connect().catch(console.error);


