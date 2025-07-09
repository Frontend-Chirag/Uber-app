import { db } from "@/lib/db/prisma";
import { getSessionManager } from "@/server/services/session/session-service";
import { NextRequest, NextResponse } from "next/server";

export async function AuthSessionMiddleware(request: NextRequest) {
    const sessionId = request.cookies.get('x-uber-session')?.value;
    if (!sessionId) {
        console.log('No session cookie');
        return null;
    }

    try {
        const session = await getSessionManager('USER_SESSION').getSession(sessionId);
        console.log('Session:', session);

        const user = await db.user.findUnique({
            where: { id: session?.data.userId }
        });
        console.log('User:', user);

        if (!user) {
            console.log('No user found for session');
            return null;
        }

        return NextResponse.next();
    } catch (error) {
        console.error('Auth Session middleware error:', error);
        return null;
    }
}