import { User } from '@prisma/client';
import { db } from "@/lib/db/prisma";
import { BaseResponse, BaseResponseBuilder } from '../response-builder';


export class UserService {
    private static instance: UserService;
    private response: BaseResponseBuilder = new BaseResponseBuilder();

    private constructor() {
        return UserService.instance;
    }


    public static getInstance(): UserService {
        if (!UserService.instance) {
            UserService.instance = new UserService();
        };
        return UserService.instance;
    }

    public async updateUser(id: string, data: Partial<User>) {
        const user = await db.user.update({
            where: { id },
            data
        });

        return user;
    }

    public async getUser(id: string): Promise<BaseResponseBuilder<{ firstname: string, lastname: string }, BaseResponse<{ firstname: string, lastname: string }>>> {
        try {
            const user = await db.user.findUnique({
                where: { id },
                select: {
                    firstname: true,
                    lastname: true
                }
            });

            if (!user) return this.response
                .setSuccess(false)
                .setData({})
                .setError('User not found')
                .build();

            return this.response.setData({
                firstname: user.firstname,
                lastname: user.lastname
            }).build()


        } catch (error) {

        }
    }

};

export const userInstance = UserService.getInstance();
