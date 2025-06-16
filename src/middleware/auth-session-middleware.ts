import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "@/lib/db/prisma";


export async function AuthSessionMiddleware(request: NextRequest) {

    const sessionId = request.cookies.get('sessionId')?.value;
    const response = NextResponse.next();

    // skip middleware for auth routes 
    if (request.nextUrl.pathname.startsWith('/auth')) {
        return response;
    }

    if (!sessionId) {
        return redirectToLogin(request)
    }


    try {
        // Get Session from database
        const session = await db.session.findUnique({
            where: { sessionId },
            include: {
                user: true
            }
        });


        // check if session exists ans is not expired
        if (!session || new Date() > session.expiresAt) {
            // Delete expired session
            if (session) {
                await db.session.delete({
                    where: { id: session.id }
                });
            }

            return redirectToLogin(request);
        }


        // check if device matches
        const device = request.headers.get('user-agent') || 'unknow';

        if (session.device === device) {
            await db.session.delete({
                where: { id: session.id }
            });

            return redirectToLogin(request)
        }

        // Refresh session if it's close to expiring 
        const oneDay = 24 * 60 * 60 * 1000;

        if (session.expiresAt.getTime() - Date.now() < oneDay) {
            const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
            await db.session.update({
                where: { id: session.id },
                data: { expiresAt: newExpiresAt }
            });

            await request.cookies.set('sessionId', sessionId)

            return response;

        }

        return response;

    } catch (error) {
        console.error('Auth Session middleware error:', error);
        return redirectToLogin(request);
    }

}

function redirectToLogin(request: NextRequest) {
    const url = request.nextUrl.clone();
    url.pathname = '/login'
    return NextResponse.redirect(url);
}