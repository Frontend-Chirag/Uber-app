"use server";

import { db } from '../db/prisma';
import { User } from '@prisma/client';
import { ENV } from '../config/config';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { AUTH_ERRORS } from '../config/constants';
import { AuthError } from '../utils/error-handler';

export interface TokenPayload {
  id: string;
  role: string;
  email?: string;
  phone?: string;
}



export const generateTokens = async (user: User) => {
  const payload: TokenPayload = {
    id: user.id,
    role: user.role,
    email: user.email || undefined,
    phone: user.phonenumber || undefined,
  };

  const accessToken = jwt.sign(payload, ENV.ACCESS_TOKEN_SECRET, {
    expiresIn: Number(ENV.ACCESS_TOKEN_EXPIRY)
  });

  const refreshToken = jwt.sign(payload, ENV.REFRESH_TOKEN_SECRET, {
    expiresIn: Number(ENV.REFRESH_TOKEN_EXPIRY)
  });

  return { accessToken, refreshToken };
};

export const verifyToken = async (token: string, secret: string): Promise<JwtPayload | null> => {
  try {
    const decoded = jwt.verify(token, secret) as JwtPayload;
    const now = Math.floor(Date.now() / 1000);

    // Check expiration
    if (decoded.exp && decoded.exp < now) {
      console.warn('Token has expired');
      return null;
    }

    return decoded;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
};

export const setAuthCookies = async (accessToken: string, refreshToken: string) => {
  const cookieStore = await cookies();

  cookieStore.set('accessToken', accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24, // 24 hours
  });

  cookieStore.set('refreshToken', refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
};

export const clearAuthCookies = async () => {
  const cookieStore = await cookies();

  cookieStore.delete('accessToken');
  cookieStore.delete('refreshToken');
};

export const verifyUser = async (emailOrPhone: string) => {
  const user = await db.user.findFirst({
    where: {
      OR: [
        { email: emailOrPhone },
        { phonenumber: emailOrPhone },
      ],
    },
  });

  if (!user) {
    throw new AuthError(AUTH_ERRORS.USER_NOT_FOUND);
  }

  // Here you would verify the password
  // For now, we'll assume the password is correct
  // In a real app, you should use bcrypt or similar

  return user;
};

export const refreshUserSession = async (refreshToken: string) => {
  try {
    const payload = jwt.verify(refreshToken, ENV.REFRESH_TOKEN_SECRET) as TokenPayload;

    const user = await db.user.findUnique({
      where: { id: payload.id },
    });

    if (!user || user.refreshToken !== refreshToken) {
      throw new AuthError(AUTH_ERRORS.INVALID_REFRESH_TOKEN);
    }

    const { accessToken, refreshToken: newRefreshToken } = await generateTokens(user);

    // Update refresh token in database
    await db.user.update({
      where: { id: user.id },
      data: { refreshToken: newRefreshToken },
    });

    return { accessToken, refreshToken: newRefreshToken };
  } catch (error) {
    throw new AuthError(AUTH_ERRORS.INVALID_REFRESH_TOKEN);
  }
};

export const getUserFromToken = async (token: string) => {
  try {
    const payload = jwt.verify(token, ENV.ACCESS_TOKEN_SECRET) as TokenPayload;

    const user = await db.user.findUnique({
      where: { id: payload.id },
    });

    if (!user) {
      throw new AuthError(AUTH_ERRORS.USER_NOT_FOUND);
    }

    return user;
  } catch (error) {
    throw new AuthError(AUTH_ERRORS.INVALID_TOKEN);
  }
}; 