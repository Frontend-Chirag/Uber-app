import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "@/lib/db/prisma";
import { getSessionManager } from "@/server/services/session/session-service";
// import { getSessionManager } from "@/server/services/session/session-service";




export async function AuthSessionMiddleware(request: NextRequest) {

    const sessionId = request.cookies.get('x-uber-session')?.value;
    const headersList = request.headers.get('x-visitor-id') || '';

    console.log('headersList', headersList)
    const response = NextResponse.next();


    if (!sessionId) {
        return null
    }


    try {
        // Get Session from database
        const session = await getSessionManager('USER_SESSION').getSession(sessionId);

        const user = await db.user.findUnique({
            where: {
                id: session?.data.userId
             }
        });

        if(!user) {
            return null
        }


        return response;

    } catch (error) {
        console.error('Auth Session middleware error:', error);
        return null
    }
}
