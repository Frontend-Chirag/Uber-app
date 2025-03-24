import { NextResponse, NextRequest } from 'next/server';
import { verifyToken } from './lib/utils';
import { ENV } from '@/lib/config';


export function middleware(req: NextRequest) {

    const accessToken = req.cookies.get('accessToken')?.value;

    if (!accessToken) {
        return NextResponse.redirect(new URL('/', req.url));
    }

    const userPayload = verifyToken(accessToken, ENV.ACCESS_TOKEN_SECRET);

    if (!userPayload) {
        return NextResponse.redirect(new URL("/", req.url));
    }

    const { role } = userPayload;

    if (req.nextUrl.pathname.startsWith("/rider") && role !== "Rider") {
        return NextResponse.redirect(new URL("/driver", req.url));
    }

    if (req.nextUrl.pathname.startsWith("/driver") && role !== "Driver") {
        return NextResponse.redirect(new URL("/rider", req.url));
    }

    return NextResponse.next();

}

export const config = {
    matcher: ["/rider/:path*", "/driver/:path*"],
};