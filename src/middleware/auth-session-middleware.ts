import { getSessionManager } from "@/server/services/session/session-service";
import { NextRequest, NextResponse } from "next/server";

export async function AuthSessionMiddleware(request: NextRequest) {
    const sessionId = request.cookies.get('x-uber-session')?.value;
    if (!sessionId) {
        return null;
    }

    try {
        const session = await getSessionManager('USER_SESSION').getSession(sessionId);
        if (!session || !session.data.userId) {
            return null;
        }
        // Attach userId to request (for Next.js, you may use request.nextUrl or a custom property if supported)
        // For Hono, you would use context.set('userId', ...)
        // Here, just return the userId for further use
        return session.data.userId;
    } catch (error) {
        return null;
    }
}