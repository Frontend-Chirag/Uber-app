import { db } from "@/lib/db/prisma";
import { Admin } from "@prisma/client";


export interface AdminResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    error?: {
        code?: string;
        details?: string
    }
}


export class AdminResponseBuilder {
    private response: AdminResponse;

    constructor() {
        this.response = {
            message: '',
            success: false
        }
    }

    setSuccess(success: boolean) {
        this.response.success = success
        return this
    }

    setMessage(message: string) {
        this.response.message = message;
        return this;
    }

    setError(code: string, details: string) {
        this.response.error = {
            code,
            details
        }
        return this;
    }

    setData<T>(data: T) {
        this.response.data = data;
        return this;
    }

    build() {
        return this.response;
    }

}


export class AdminService {
    private static instance: AdminService;
    private response: AdminResponseBuilder;
    private cachedAdmin: Admin | null;
    private cacheExpiry: number | null;
    private readonly CACHE_DURATION_MX = 5 * 60 * 1000 // 5 min


    private constructor() {
        this.cachedAdmin = null;
        this.cacheExpiry = null;
        this.response = new AdminResponseBuilder();
        return AdminService.instance
    }

    public static getInstance(): AdminService {
        if (!AdminService.instance) {
            AdminService.instance = new AdminService();
        }
        return AdminService.instance;
    };


    /**
     * Get admin by ID with caching
     * @param id - Admin Id
     * @returns Admin object 
     */
    public async getCachedAdmin(id: string): Promise<AdminResponse> {
        try {
            // check if we have a valid cached admin
            if (this.cachedAdmin && this.cacheExpiry && Date.now() < this.cacheExpiry) {
                return this.response
                    .setSuccess(true)
                    .setData(this.cachedAdmin)
                    .setMessage('Admin retrived from cache')
                    .build();
            }

            // Fetch from database
            const admin = await db.admin.findUnique({
                where: {
                    id
                }
            });

            if (!admin) {
                return this.response
                    .setSuccess(false)
                    .setMessage('Admin not found')
                    .setError('ADMIN_NOT_FOUND', `No admin found with ID: ${id}`)
                    .build();
            }

            this.cachedAdmin = admin;
            return this.response
                .setSuccess(true)
                .setData(admin)
                .setMessage('Admin retrieved successfully')
                .build();

        } catch (error) {
            console.error('Error fetching admin:', error);
            return new AdminResponseBuilder()
                .setSuccess(false)
                .setMessage('Failed to retrieve admin')
                .setError('FETCH_ERROR', error instanceof Error ? error.message : 'Unknown error')
                .build();
        }
    }


    /**
     * Clear the admin cache
     */
    public clearCache(): void {
        this.cachedAdmin = null;
        this.cacheExpiry = null;
    }

    /**
     * Update admin information
     * @param id - Admin ID
     * @param data - Admin data to update
     * @returns Updated admin or null if not found
     */

    public async updateAdmin(id: string, data: Partial<Admin>): Promise<AdminResponse> {
        try {
            const updatedAdmin = await db.admin.update({
                where: { id },
                data
            });

            this.cachedAdmin = updatedAdmin;
            this.cacheExpiry = Date.now() + this.CACHE_DURATION_MX;

            return this.response
                .setSuccess(true)
                .setMessage('Admin updated')
                .setData(updatedAdmin)
                .build()

        } catch (error) {
            console.error('Failed to updated admin', error)
            return this.response
                .setSuccess(false)
                .setMessage('Something wen wrong')
                .build();
        }
    }

};


export const adminInstance = AdminService.getInstance();

