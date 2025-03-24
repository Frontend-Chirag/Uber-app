"use server";

import { cookies } from "next/headers";
import { ENV } from "@/lib/config";
import { verifyToken } from "@/lib/utils";
import { db } from '@/lib/db/prisma';
import jwt from 'jsonwebtoken';
import { User } from "@prisma/client";



export const getAuthUser = async (): Promise<{ isAuthenticated: boolean; user: User; } | null> => {
    const cookiesStore = await cookies();
    const accessToken = cookiesStore.get('accessToken')?.value;
    const refreshToken = cookiesStore.get('refreshToken')?.value;

    if (!(accessToken && refreshToken)) return null;


    const userPayload = accessToken ? verifyToken(accessToken, ENV.ACCESS_TOKEN_SECRET) : null;

    if (!userPayload) return null;

    let user = await db.user.findUnique({
        where: { id: userPayload.id },
    });


    if (user) {
        return {
            isAuthenticated: true,
            user,
        }
    }

    if (!refreshToken) return null;

    const refreshPayload = verifyToken(refreshToken, ENV.REFRESH_TOKEN_SECRET);

    if (!refreshPayload) return null;

     user = await db.user.findUnique({
        where: { id: refreshPayload.id },
    });

    if (user && user.refreshToken !== refreshToken) return null;


    const newAccessToken = jwt.sign({
        id: refreshPayload.id,
        contact: refreshPayload.contact,
        name: refreshPayload.name
    }, ENV.ACCESS_TOKEN_SECRET, { expiresIn: ENV.ACCESS_TOKEN_EXPIRY } as jwt.SignOptions);

    (await cookies()).set('accessToken', newAccessToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        path: '/'
    });

    if(user){   
        return {
            isAuthenticated: true,
            user
        };
    }
        
    return null
}
