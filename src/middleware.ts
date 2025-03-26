import { NextResponse, NextRequest } from 'next/server';
import { ENV } from '@/lib/config/config';
import { db } from '@/lib/db/prisma';
import jwt from 'jsonwebtoken';
import { verifyToken } from './lib/auth/auth';

// Define protected routes and their allowed roles
const protectedRoutes = {
  '/rider': ['Rider'],
  '/driver': ['Driver'],
  '/dashboard': ['Rider', 'Driver'],
};

export async function middleware(req: NextRequest) {
  const accessToken = req.cookies.get('accessToken')?.value;
  const refreshToken = req.cookies.get('refreshToken')?.value;

  // Check if the current path requires authentication
  const path = req.nextUrl.pathname;
  const isProtectedRoute = Object.keys(protectedRoutes).some(route => path.startsWith(route));

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // If no tokens are present, redirect to login
  if (!accessToken && !refreshToken) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  try {
    let userPayload;

    // Try to verify access token first
    if (accessToken) {
      userPayload = await verifyToken(accessToken, ENV.ACCESS_TOKEN_SECRET);
    }

    // If access token is invalid or expired, try refresh token
    if (!userPayload && refreshToken) {
      userPayload = await verifyToken(refreshToken, ENV.REFRESH_TOKEN_SECRET);

      if (userPayload) {
        // Verify refresh token in database
        const user = await db.user.findUnique({
          where: { id: userPayload.id }
        });

        if (!user || user.refreshToken !== refreshToken) {
          return NextResponse.redirect(new URL('/auth/login', req.url));
        }

        // Generate new access token
        const newAccessToken = jwt.sign(
          { id: user.id, role: user.role },
          ENV.ACCESS_TOKEN_SECRET,
          { expiresIn: Number(ENV.ACCESS_TOKEN_EXPIRY) }
        );

        // Set new access token in response
        const response = NextResponse.next();
        response.cookies.set('accessToken', newAccessToken, {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
          path: '/'
        });
        return response;
      }
    }

    // If no valid tokens, redirect to login
    if (!userPayload) {
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }

    // Check role-based access
    const userRole = userPayload.role;
    const matchedRoute = Object.keys(protectedRoutes).find(route => path.startsWith(route)) as keyof typeof protectedRoutes;
    const allowedRoles = protectedRoutes[matchedRoute];

    if (!allowedRoles.includes(userRole)) {
      // Redirect to appropriate dashboard based on role
      return NextResponse.redirect(new URL(`/${userRole.toLowerCase()}`, req.url));
    }

    return NextResponse.next();
  } catch (error) {
    // Handle any errors during token verification
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    '/rider/:path*',
    '/driver/:path*',
    '/dashboard/:path*',
  ]
};