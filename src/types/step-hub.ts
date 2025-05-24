import { StepDisplay, StepType } from "@prisma/client";

export type CountryCode = "IN" | "US" | "UK";

// Types
export interface BaseDocumentStep {
    stepId: string;
    type: StepType;
    display: StepDisplay;
}


export interface TypedDocumentStep {
    title: string;
    step: BaseDocumentStep & {
        type: StepType;
        stepId: TemplateStepId;
    };
}

// Enums and Constants
export const BaseStepId = {
    driverLicense: 'driverLicense',
    profilePhoto: 'profilePhoto',
    vehicleRegistration: 'vehicleRegistration',
    vehicleInsurance: 'vehicleInsurance'
} as const;


export enum IndiaStepId {
    aadhaar = 'aadhaar',
    pan = 'pan',
    vehiclePermit = 'vehiclePermit',
}

export enum USStepId {
    ssn = 'ssn',
    stateId = 'stateId',
    vehiclePermit = 'vehiclePermit'
}

export type BaseDocumentStepId = keyof typeof BaseStepId;
export type TemplateStepId = BaseDocumentStepId | IndiaStepId;

