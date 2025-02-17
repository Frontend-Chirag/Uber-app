import { FlowType, sessionData } from '@/types';
import { createClient } from 'redis';

export const redisClient = createClient({
    username: 'default',
    password: '1PDiRy73cHrscPMZlIBONcVL9l8SwIId',
    socket: {
        host: 'redis-15696.c305.ap-south-1-1.ec2.redns.redis-cloud.com',
        port: 15696
    }
});


redisClient.connect().then(() => {
    console.log('Redis Client Connected')
}).catch((err) => {
    console.log('Redis Client Error', err)
});


interface CreateSessionProps {
    sessionId: string;
    data: sessionData | null
}

export const SESSION_TTL = 60 * 60 * 24;
export const SESSION_COOKIE_TTL=24 * 60 * 60 * 1000;
export const expiresAt = Date.now() + SESSION_TTL * 1000

export const createFormSession = ({ sessionId, data }: CreateSessionProps): CreateSessionProps => {
    const session: sessionData = {
        email: data?.email || null,
        phonenumber: data?.phonenumber || null,
        phoneCountryCode: data?.phoneCountryCode || null,
        emailVerified: data?.emailVerified || false,
        phoneVerified: data?.phoneVerified || false,
        flowState: data?.flowState || FlowType.INITIAL,
        firstname: data?.firstname || null,
        lastname: data?.lastname || null,
        otp: data?.otp || { value: null, expiresAt: null },
        type: data?.type || null
    };
    redisClient.set(sessionId, JSON.stringify(session), {
        EX: SESSION_TTL
    });
    return { data: session, sessionId };;
};

export const getFormSession = async (sessionId: string) => {
    const data = await redisClient.get(sessionId);
    if (!data) {
        throw new Error(`Session with ID ${sessionId} not found`);
    }
    return { sessiondata: JSON.parse(data) as sessionData, sessionId };
};

export const updateFormSession = async (sessionId: string, updates: Partial<sessionData>) => {
    const sessionData = await redisClient.get(sessionId);

    if (!sessionData) {
        throw new Error(`Session with ID ${sessionId} not found`);
    }

    const session = JSON.parse(sessionData);
    Object.assign(session, updates);

    console.log('new session', session);

    await redisClient.set(sessionId, JSON.stringify(session));
    return session as sessionData;
};

export const deleteFormSession = async (sessionId: string) => {
    await redisClient.del(sessionId);
}

export const restartFormSession = async (sessionId: string, data: sessionData) => {
    await redisClient.del(sessionId);
    createFormSession({ sessionId, data });
};


