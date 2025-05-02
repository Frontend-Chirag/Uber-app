import "server-only";

import { db } from './db/prisma';
import { Admin, Role, User } from '@prisma/client';
import { ENV } from './config/config';
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from 'jose';
import { redirect } from "next/navigation";
import { userInstance } from "@/services/user/user-service";
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { adminInstance } from "@/services/admin/admin-services";



export interface Session {
  session: {
    id: string,
    role: string
  } | null,
  accessToken: string | null;
  refreshToken: string | null;
  expires: number | null;
};



export async function verifyToken(token: string, secret: string): Promise<{ user: { id: string, role: string }, exp: number } | null> {
  const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));

  if (payload.exp && payload.exp * 1000 > Date.now()) {
    return {
      user: {
        id: payload.sub as string,
        role: payload.role as string,
      },
      exp: payload.exp
    };
  }
  return null;
}

export async function verifyRefreshTokenAndIssueNewTokens(token: string, cookieStore: ReadonlyRequestCookies): Promise<Session | null> {
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(ENV.REFRESH_TOKEN_SECRET));

    if (payload.exp && payload.exp * 1000 > Date.now()) {

      let user: User | Admin;

      if (payload.role !== 'admin') {
        user = await userInstance.getCachedUser(payload.sub as string) as User;
      } else {
        user = (await adminInstance.getCachedAdmin(payload.sub as string)).data as Admin;
      }


      if (!user || user.refreshToken === token) return null;

      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await generateTokens(user.id, user.role);

      // Update refresh token in database
      await db.user.update({
        where: { id: user.id },
        data: { refreshToken: newRefreshToken }
      });

      // Set new cookies
      cookieStore.set('accessToken', newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 // 1 hour
      });

      cookieStore.set('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 // 7 days
      });

      return {
        session: {
          id: user.id,
          role: user.role
        },
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expires: Date.now() + (60 * 60 * 1000) // 1 hour from now
      };
    }

    return null;
  } catch (error) {
    console.log(error);
    return null;
  }
}



export async function getServerSession(): Promise<Session> {
  "use server";
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value ?? null;
  const refreshToken = cookieStore.get('refreshToken')?.value ?? null;

  if (!accessToken && !refreshToken) {
    return {
      session: null,
      accessToken: null,
      refreshToken: null,
      expires: null
    }
  }

  try {
    // First try to verify access token
    if (accessToken) {
      try {
        const isValidToken = await verifyToken(accessToken, ENV.ACCESS_TOKEN_SECRET)

        if (isValidToken) {
          return {
            session: isValidToken.user,
            refreshToken,
            accessToken,
            expires: isValidToken.exp
          }
        }
      } catch (error) {
        // Only log if it's not an expiration error
        if (error instanceof Error && !error.message.includes('JWTExpired')) {
          console.log('Access token verification failed:', error);
        }
      }
    }

    // If access token is invalid or expired, try refresh token
    if (refreshToken) {
      try {
        const session = await verifyRefreshTokenAndIssueNewTokens(refreshToken, cookieStore);

        if (session) {
          return session;
        }

      } catch (error) {
        console.log('Refresh token verification failed:', error);
        // Clear invalid tokens
        cookieStore.delete('accessToken');
        cookieStore.delete('refreshToken');
      }
    }

    return {
      session: null,
      accessToken: null,
      refreshToken: null,
      expires: null
    };
  } catch (error) {
    console.error('Session error:', error);
    return {
      session: null,
      accessToken: null,
      refreshToken: null,
      expires: null
    };
  }
}

export async function generateTokens(id: string, role: Role) {
  const accessToken = await new SignJWT({ role })
    .setSubject(id)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('1h')
    .sign(new TextEncoder().encode(ENV.ACCESS_TOKEN_SECRET));

  const refreshToken = await new SignJWT({ role })
    .setSubject(id)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(new TextEncoder().encode(ENV.REFRESH_TOKEN_SECRET));

  return { accessToken, refreshToken };
};

export async function getUserIdFromToken(): Promise<string | null> {
  "use server";
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;

  if (!accessToken) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(accessToken, new TextEncoder().encode(ENV.ACCESS_TOKEN_SECRET));
    return payload.sub as string;
  } catch (error) {
    return null;
  }
}

export async function clearSession() {
  "use server";
  const cookieStore = await cookies();
  cookieStore.delete('accessToken');
  cookieStore.delete('refreshToken');

  redirect('/')
};
