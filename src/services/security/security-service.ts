import { RouteConfigs } from "@/types/auth";
import { ENV } from '@/lib/config/config';


export const SECURITY_CONFIG = {
    MAX_LOGIN_ATTEMPTS: 5,  // Maximum failed login attempts before temporary lockout
    LOCKOUT_DURATION: 15, // Lockout duration in minutes
    TOKEN_EXPIRY: { // Token expiry times in seconds
        ACCESS: Number(ENV.ACCESS_TOKEN_EXPIRY),
        refresh: Number(ENV.REFRESH_TOKEN_EXPIRY),
    },
    accessToken: {
        cookieName: 'accessToken',
        expiry: '1d',
        headerName: 'X-Access-TOsKEN'
    },
    refreshToken: {
        cookieName: 'refreshToken',
        expiry: '7d',
        headerName: 'X-refresh-TOKEN'
    },
    role: {
        headName: 'X-UBER-ROLEf'
    },
    CSRF: {
        cookieName: 'csrf-token',
        headerName: 'X-CSRF-TOKEN'
    },
    COOKIE_OPTIONS: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' as const,
        path: '/'
    },
    ...(process.env.NODE_ENV === 'production' && {
        domain: '' // TODO: ADD DOMAIN IN SECURITY
    })
} as const;

export const ROUTE_CONFIGS: RouteConfigs = {
    '/rider': {
        roles: ['rider'],
        rateLimit: {
            windowMs: 15 * 60 * 1000, // 15 minutes
            maxAttempts: 100
        }
    },
    // '/driver': {
    //     roles: ['driver'],
    //     rateLimit: {
    //         windowMs: 15 * 60 * 1000,
    //         maxAttempts: 100
    //     }
    // },
    '/dashboard': {
        roles: ['rider', 'driver'],
        rateLimit: {
            windowMs: 15 * 60 * 1000,
            maxAttempts: 200
        }
    }

} as const;

export const PUBLIC_ROUTES = ['/', '/login', '/signup'] as const;


// export class SecurityService {
//     // private redis: typeof redisService;
//     private static instance: SecurityService;


//     // TODO: FIX LOGIC FOR CSRF, RATE LIMIT, IP BLOCK, DEVICE FINGERPRINT, SESSION

//     private constructor() {
//         // this.redis = redisService;
//     }


//     public static getInstance(): SecurityService {
//         if (!SecurityService.instance) {
//             SecurityService.instance = new SecurityService();
//         };

//         return SecurityService.instance;
//     };

//     // CSRF Protection 
//     public async generateCSRFToken(): Promise<String> {
//         const array = new Uint8Array(32);
//         crypto.getRandomValues(array);
//         const token = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');

//         const headersList = await headers();
//         const sessionId = headersList.get('x-session-id');

//         if (sessionId) {
//             await this.redis.createFormSession({
//                 sessionId: `csrf:${sessionId}`,
//                 data: {
//                     type: 'rider',
//                     flowType: FlowType.INITIAL,
//                     eventType: EventType.TypeInputMobile
//                 }
//             })
//         }

//         return token
//     };


//     public async ValidateCSRFToken(token: string): Promise<boolean> {
//         const headersList = await headers();
//         const sessionId = headersList.get('x-session-id');

//         if (!sessionId) return false;


//         try {
//             const session = await this.redis.getFormSession(`csrf:${sessionId}`);
//             return session.data.otp?.value === token;
//         } catch (error) {
//             return false;
//         }
//     }


//     // Rate Limiting 
//     public async checkRateLimit(key: string, limit: number, window: number): Promise<boolean> {
//         try {
//             const session = await this.redis.getFormSession(`rate:${key}`);
//             const current = (session.data.otp?.value ? parseInt(session.data.otp.value) : 0) + 1;

//             if (current === 1) {
//                 await this.redis.createFormSession({
//                     sessionId: `rate:${key}`,
//                     data: {
//                         type: 'rider',
//                         flowType: FlowType.INITIAL,
//                         eventType: EventType.TypeInputMobile
//                     }
//                 });
//             } else {
//                 await this.redis.updateFormSession(`rate:${key}`, {
//                     otp: {
//                         value: current.toString(),
//                         expiresAt: session.data.otp?.expiresAt ?? null
//                     }
//                 });
//             }

//             return current <= limit;
//         } catch (error) {
//             return true; // If there's an error, allow the request
//         }
//     }


//     // IP Blocking
//     public async checkIPBlock(ip: string): Promise<boolean> {
//         try {
//             const session = await this.redis.getFormSession(`ip:block:${ip}`);
//             return !session.data.otp?.value;
//         } catch (error) {
//             return true; // If there's an error, allow the request
//         }
//     }

//     // Device Fingerprinting
//     public async validateDeviceFingerprint(fingerprint: string): Promise<boolean> {
//         const headersList = await headers();
//         const userId = headersList.get('x-user-id');

//         if (!userId) return false;

//         try {
//             const session = await this.redis.getFormSession(`device:${userId}`);
//             return session.data.otp?.value === fingerprint;
//         } catch (error) {
//             return false;
//         }
//     }

//     public async createSession(userId: string, deviceInfo: any): Promise<string> {
//         const array = new Uint8Array(32);
//         crypto.getRandomValues(array);
//         const sessionId = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');

//         await this.redis.createFormSession({
//             sessionId: `session:${sessionId}`,
//             data: {
//                 type: 'rider',
//                 flowType: FlowType.INITIAL,
//                 eventType: EventType.TypeInputMobile
//             }
//         });

//         return sessionId;
//     }

//     public async validateSession(sessionId: string): Promise<boolean> {
//         try {
//             const session = await this.redis.getFormSession(`session:${sessionId}`);
//             if (!session.data.otp?.expiresAt || session.data.otp.expiresAt < Date.now()) {
//                 return false;
//             }

//             // Update last active time
//             await this.redis.updateFormSession(`session:${sessionId}`, {
//                 otp: {
//                     value: null,
//                     expiresAt: Date.now() + 86400000 // 24 hours
//                 }
//             });

//             return true;
//         } catch (error) {
//             return false;
//         }
//     }

//     public getSecurityHeaders(): Record<string, string> {
//         return {
//             'X-Frame-Options': 'DENY',
//             'X-Content-Type-Options': 'nosniff',
//             'X-XSS-Protection': '1; mode=block',
//             'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
//             'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';",
//             'Referrer-Policy': 'strict-origin-when-cross-origin',
//             'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
//         };
//     }

// }


