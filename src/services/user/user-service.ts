import { User } from '@prisma/client';
import { db } from "@/lib/db/prisma";


export class UserService {
    private static instance: UserService;
    private userCache: Map<string, User> = new Map();

    private constructor() {
        return UserService.instance;
    }


    public static getInstance(): UserService {
        if (!UserService.instance) {
            UserService.instance = new UserService();
        };
        return UserService.instance;
    }


    /**
     * @param id
     * Retrives user information from cache or database
     * @returns
     */
    public async getCachedUser(id: string): Promise<User | null> {
        const cachedUser = this.userCache.get(id);

        if (cachedUser) return cachedUser;

        const user = await db.user.findUnique({
            where: { id },
            include: {
                driver: true,
                rider: true
            }
        });

        if (user) this.userCache.set(id, user);

        return user
    };

    public setCachedUser(id: string, user: User) {
        return this.userCache.set(id, user);
    }

    public deleteCachedUser(id: string) {
        return this.userCache.delete(id);
    }

    public async updateUser(id: string, data: Partial<User>) {
        const user = await db.user.update({
            where: { id },
            data
        });

        if (user) this.setCachedUser(id, user);

        return user;
    }


};

export const userInstance = UserService.getInstance();
