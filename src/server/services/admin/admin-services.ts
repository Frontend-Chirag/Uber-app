import { AdminCacheService } from "./admin-cache";
import { RegistrationTemplateService } from "./registration-template";

export class AdminService {
    public readonly cache = AdminCacheService.getInstance();
    public readonly templates = RegistrationTemplateService.getInstance();
    private static instance: AdminService;


    // Future extensions:
    // public readonly settings = new AdminSettingsService();
    // public readonly analytics = new AdminAnalyticsService();

    public static getInstance(): AdminService {
        if (!AdminService.instance) {
            AdminService.instance = new AdminService();
        }
        return AdminService.instance;
    }
}


export const adminInstance = AdminService.getInstance();
