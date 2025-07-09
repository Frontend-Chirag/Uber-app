"use server";

// lib/user-logged-in.ts
import { getSessionManager, UserSession } from "@/server/services/session/session-service";
import { cookies } from "next/headers";


const { getSession } = getSessionManager('USER_SESSION');


export async function isUserLoggedIn(): Promise<UserSession | null> {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('x-uber-session')?.value;

    if (!sessionId) return null;

    const session = await getSession(sessionId);

    if (!session) return null;

    console.log(session)

    return session.data.userId ? session.data : null;
}
