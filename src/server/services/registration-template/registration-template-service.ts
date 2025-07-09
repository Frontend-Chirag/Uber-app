import { db } from "@/lib/db/prisma.js";
import { RegistrationStep, RegistrationTemplate } from "@prisma/client";
import { CountryCode } from "@/types/step-hub.js";

export class RegistrationTemplateService {
    private static instance: RegistrationTemplateService;
    private templateCache: Map<CountryCode, {
        data: RegistrationTemplate & { steps: RegistrationStep[] }
        timestamp: number
    }>;
    private readonly CACHE_TTL = 5 * 60 * 1000

    constructor() {
        this.templateCache = new Map();
    }

    public static getInstance(): RegistrationTemplateService {
        if (!RegistrationTemplateService.instance) {
            RegistrationTemplateService.instance = new RegistrationTemplateService()
        }
        return RegistrationTemplateService.instance;
    }

    private isCachedValid(timestamp: number): boolean {
        return Date.now() - timestamp < this.CACHE_TTL;
    };

    private async fetchAndCacheTemplate(country: CountryCode): Promise<RegistrationTemplate & { steps: RegistrationStep[] } | null> {
        try {
            const template = await db.registrationTemplate.findFirst({
                where: { country },
                include: {
                    steps: {
                        orderBy: {
                            createdAt: 'asc'
                        }
                    }
                }
            });

            if (!template) return null;

            this.templateCache.set(country, {
                data: template,
                timestamp: Date.now()
            });

            return template
        } catch (error) {
            console.error('Error fetching registration template:', error);
            return null;
        }
    };

    public async getRegistrationSteps(country: CountryCode): Promise<RegistrationStep[] | null> {
        try {
            const cachedData = this.templateCache.get(country);
            
            if (cachedData && this.isCachedValid(cachedData.timestamp)) {
                return cachedData.data.steps;
            }

            const template = await this.fetchAndCacheTemplate(country);
            return template?.steps ?? null;
        } catch (error) {
            console.error('Error in getRegistrationSteps:', error);
            return null;
        }
    }
};

export const registrationService = RegistrationTemplateService.getInstance();

