import { db } from "@/lib/db/prisma";
import { RegistrationStepTemplate } from "@prisma/client";
import { InputJsonValue } from "@prisma/client/runtime/library";
import { AdminResponseBuilder, AdminResponse } from "./response";
import { HTTP_STATUS } from "@/lib/constants";

export class RegistrationTemplateService {
    private response = new AdminResponseBuilder();
    private static instance: RegistrationTemplateService;


    public static getInstance(): RegistrationTemplateService {
        if (!RegistrationTemplateService.instance) {
            RegistrationTemplateService.instance = new RegistrationTemplateService();
        }
        return RegistrationTemplateService.instance;
    }

    async create(data: RegistrationStepTemplate): Promise<AdminResponse> {
        try {
            const template = await db.registrationStepTemplate.create({
                data: {
                    title: data.title,
                    subtitle: data.subtitle,
                    type: data.type,
                    countryCode: data.countryCode,
                    regionCode: data.regionCode,
                    options: data.options as InputJsonValue
                }
            });

            return this.response
                .setSuccess(true)
                .setMessage("Template created")
                .setData(template)
                .build();
        } catch (error) {
            return this.response
                .setSuccess(false)
                .setMessage("Failed to create template")
                .setError(HTTP_STATUS.INTERNAL_SERVER_ERROR, error instanceof Error ? error.message : "Unknown error")
                .build();
        }
    }

    async getAll(): Promise<AdminResponse> {
        try {
            const templates = await db.registrationStepTemplate.findMany();
            return this.response
                .setSuccess(true)
                .setMessage("Templates fetched")
                .setData(templates)
                .build();
        } catch (error) {
            return this.response
                .setSuccess(false)
                .setMessage("Failed to fetch templates")
                .setError(HTTP_STATUS.INTERNAL_SERVER_ERROR, error instanceof Error ? error.message : "Unknown error")
                .build();
        }
    }

    async getById(id: string): Promise<AdminResponse> {
        try {
            const template = await db.registrationStepTemplate.findUnique({ where: { id } });
            return this.response
                .setSuccess(true)
                .setMessage("Template fetched")
                .setData(template)
                .build();
        } catch (error) {
            return this.response
                .setSuccess(false)
                .setMessage("Failed to fetch template")
                .setError(HTTP_STATUS.INTERNAL_SERVER_ERROR, error instanceof Error ? error.message : "Unknown error")
                .build();
        }
    }

    async update(id: string, data: Partial<RegistrationStepTemplate>): Promise<AdminResponse> {
        try {
            const updated = await db.registrationStepTemplate.update({
                where: { id },
                data: {
                    title: data.title,
                    subtitle: data.subtitle,
                    type: data.type,
                    countryCode: data.countryCode,
                    regionCode: data.regionCode,
                    options: data.options as InputJsonValue
                }
            });

            return this.response
                .setSuccess(true)
                .setMessage("Template updated")
                .setData(updated)
                .build();
        } catch (error) {
            return this.response
                .setSuccess(false)
                .setMessage("Failed to update template")
                .setError(HTTP_STATUS.INTERNAL_SERVER_ERROR, error instanceof Error ? error.message : "Unknown error")
                .build();
        }
    }

    async delete(id: string): Promise<AdminResponse> {
        try {
            await db.registrationStepTemplate.delete({ where: { id } });
            return this.response
                .setSuccess(true)
                .setMessage("Template deleted")
                .build();
        } catch (error) {
            return this.response
                .setSuccess(false)
                .setMessage("Failed to delete template")
                .setError(HTTP_STATUS.INTERNAL_SERVER_ERROR, error instanceof Error ? error.message : "Unknown error")
                .build();
        }
    }
}
