// import { NextRequest, NextResponse } from "next/server";
// import { getServerSession } from "./lib/auth";


// const securityHeaders = {
//   'X-Frame-Options': 'DENY',
//   'X-Content-Type-Options': 'nosniff',
//   'Referrer-Policy': 'strict-origin-when-cross-origin',
//   'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
//   'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
//   'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;"
// }


// // Define protected routes and their allowed roles 
// const protectedRoutes = {
//   '/driver': ['driver'],
//   '/rider': ['rider'],
//   '/super_admin': ['super_admin'],
//   '/dashboard': ['driver', 'rider']
// } as const;

// // Type for protected routes
// type UserRole = 'driver' | 'rider';

// /**
//  * Gets the client IP address from various headers
//  * @param request The NextRequest object
//  * @returns The client IP address or 'unknown'
//  */

// async function getClientIp(request: NextRequest): Promise<string> {
//   let ip: string;

//   // Try to get the real IP from various headers
//   ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
//        request.headers.get('x-real-ip') ||
//        request.headers.get('x-client-ip') ||
//        request.headers.get('cf-connecting-ip') || // Cloudflare
//        request.headers.get('true-client-ip') || // Akamai
//        (process.env.NODE_ENV === 'development' ? '127.0.0.1' : 'unknown');

//   // Add to headers
//   const requestHeaders = new Headers(request.headers);
//   requestHeaders.set('x-forwarded-for', ip);

//   // Log in development
//   if (process.env.NODE_ENV === 'development') {
//     console.log('IP Address:', ip);
//   }

//   return ip;
// }

// /**
//  * Checks if a user has access to a specific route
//  * @param pathname The current pathname
//  * @param userRole The user's role
//  * @returns boolean indicating if access is allowed
//  */

// function hasRouteAccess(pathname: string, userRole?: UserRole): boolean {
//   if (!userRole) return false;

//   return Object.entries(protectedRoutes).some(([route, roles]) => {
//     const allowedRoles = roles as readonly UserRole[];
//     return pathname.startsWith(route) && allowedRoles.includes(userRole);
//   });
// }

// /**
//  * Creates a response with security headers
//  * @param request The NextRequest object
//  * @returns NextResponse with security headers
//  */

// function createSecureResponse(_: NextRequest): NextResponse {
//   const response = NextResponse.next();

//   // Add security headers
//   Object.entries(securityHeaders).forEach(([key, value]) => {
//     response.headers.set(key, value);
//   });

//   return response;
// }


// export async function middleware(request: NextRequest) {
//   const { session } = await getServerSession();
//   const pathname = request.nextUrl.pathname;
//   const response = createSecureResponse(request);

//   // Add Ip and role headers;
//   await getClientIp(request);

//   console.log('middleware',session)

//   if (session) {
//     response.headers.set('x-user-role', session.role);
//   }

//   // Handle route protection
//   if (!session && Object.keys(protectedRoutes).some(route => pathname.startsWith(route))) {
//     console.log('redirect to home', session)
//     return NextResponse.redirect(new URL('/', request.url))
//   };

//   if (session && !hasRouteAccess(pathname, session.role as UserRole)) {
//     console.log('redirect to role access', session)
//     return NextResponse.redirect(new URL(`/${session.role}`, request.url))
//   };

//   return response;
// };


// export const config = {
//   matcher: [
//     '/driver/:path*',
//     '/rider/:path*',
//     '/dashboard/:path*',
//     '/admin/:path*',
//     '/login',
//     '/signup',
//     '/admin-login',
//     '/'
//   ]
// }