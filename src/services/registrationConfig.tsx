import { RegistrationStatus, RegistrationStepOptions, RegistrationStepType } from "@prisma/client";

// Base Types 
type DisplayConfig = {
    title: string;
    subtitle: string;
}

type RegistrationStep = {
    display: DisplayConfig;
    options: RegistrationStepOptions;
    status: RegistrationStatus;
    type: RegistrationStepType;
}


// Default options for steps 
const defaultStepOptions: RegistrationStepOptions = {
    isDisabled: false,
    isOptional: false,
    isRecommended: false,
    isUpcoming: false,
    redirectURL: ''
};

// Step factory function 
const createStep = (
    title: string,
    subtitle: string,
    type: RegistrationStepType,
    options: Partial<RegistrationStepOptions> = {}
): RegistrationStep => ({
    display: { title, subtitle },
    type,
    status: 'not_started',
    options: { ...defaultStepOptions, ...options }
})

// Country-Specific configurations
const indiaSteps: RegistrationStep[] = [
    createStep("Driving License - Front", "Recommended next step", "driversLicense"),
    createStep("Profile photo", "", "profilePhoto"),
    createStep("Aadhaar Card", "", "document"),
    createStep("PAN Card", "", "document"),
    createStep("Registration Certificate (RC)", "", "vehicleRegistration"),
    createStep("Vehicle Insurance", "", "vehicleInsurance"),
    createStep("Vehicle Permit", "", "document")
];

const usSteps: RegistrationStep[] = [
    // Add US specific steps
];

const ukSteps: RegistrationStep[] = [
    // Add UK specific steps
];

// Type for country codes 
export type CountryCode = "IN" | "US" | "UK";

// Main configuration 
export const RegistrationConfig: Record<CountryCode, RegistrationStep[]> = {
    IN: indiaSteps,
    US: usSteps,
    UK: ukSteps
} as const;


// Helper function to get steps for a country
export const getRegistrationSteps = (country: string) => {
    return RegistrationConfig[country as CountryCode] || [];
};

