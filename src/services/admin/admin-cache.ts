import { db } from "@/lib/db/prisma";
import { Admin } from "@prisma/client";

export class AdminCacheService {
    private cachedAdmin: Admin | null = null;
    private cacheExpiry: number | null = null;
    private readonly CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes
    private static instance: AdminCacheService;

    public static getInstance(): AdminCacheService {
        if (!AdminCacheService.instance) {
            AdminCacheService.instance = new AdminCacheService();
        }
        return AdminCacheService.instance;
    }
    async getCachedAdmin(id: string): Promise<Admin | null> {
        try {
            if (this.cachedAdmin && this.cacheExpiry && Date.now() < this.cacheExpiry) {
                return this.cachedAdmin;
            }

            const admin = await db.admin.findUnique({ where: { id } });

            if (!admin) {
                return null;
            }

            this.cachedAdmin = admin;
            this.cacheExpiry = Date.now() + this.CACHE_DURATION_MS;

            return admin;
        } catch (error) {
            return null;
        }
    }

    clearCache(): void {
        this.cachedAdmin = null;
        this.cacheExpiry = null;
    }

    async updateAdmin(id: string, data: Partial<Admin>): Promise<Admin | null> {
        try {
            const updatedAdmin = await db.admin.update({
                where: { id },
                data,
            });

            this.cachedAdmin = updatedAdmin;
            this.cacheExpiry = Date.now() + this.CACHE_DURATION_MS;

            return updatedAdmin;
        } catch (error) {
            return null;
        }
    }
}
