// lib/user-logged-in.ts
import { cookies } from "next/headers";

export async function isUserLoggedIn(): Promise<boolean> {
    const cookieStore = await cookies();
    const token = cookieStore.get("sessionId");
    return !!token;
}
