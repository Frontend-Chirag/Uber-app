import { BaseDocumentStepId, BaseStepId, IndiaStepId, TemplateStepId, TypedDocumentStep } from "@/types/step-hub";
import { StepType, StepDisplay} from "@prisma/client";

// Constants
const DEFAULT_DISPLAY_DOCUMENT_STEPS: StepDisplay = {
    StepTitle: '',
    StepPreviewTopInstruction: null,
    StepPreviewBottomInstruction: null,
    StepUseMyPhoneText: null,
    StepUploadActionText: null,
    StepPreviewInstructionsList: [],
    StepPreviewImageURL: null,
} as const;



// Helper function to create document steps
const createDocumentStep = (
    title: string,
    type: StepType,
    stepId: TemplateStepId,
    display: Partial<StepDisplay>
): TypedDocumentStep => ({
    title,
    step: {
        type,
        stepId,
        display: {
            ...DEFAULT_DISPLAY_DOCUMENT_STEPS,
            ...display,
        },
    },
});

// Base document steps
const baseDocumentSteps: Record<BaseDocumentStepId, TypedDocumentStep> = {
    [BaseStepId.driverLicense]: createDocumentStep(
        "Driver license - Front",
        "driverLicense",
        "driverLicense",
        {
            StepTitle: "Enter your license number and date of birth",
        }
    ),
    [BaseStepId.profilePhoto]: createDocumentStep(
        'Profile Photo',
        "profilePhoto",
        "profilePhoto",
        {
            StepTitle: "Take your profile photo",
            StepPreviewTopInstruction:
                "Uber has partnered with veriff to verify your profile photo. Please note that once you submit your profile photo it can only be changed in limited circumstances.",
            StepPreviewBottomInstruction:
                "Veriff will verify your photo is of a live person, taken in real-time and uber will use the photo to check for duplication across other accounts",
            StepUseMyPhoneText: "Use my phone",
            StepPreviewInstructionsList: [
                "Face the camera directly with your eyes and mouth clearly visible",
                "Make sure the photo us well in, free of glare, and in focus",
                "No photos of a photo, filters, or alternative",
            ],
        }
    ),
    [BaseStepId.vehicleRegistration]: createDocumentStep(
        "Vehicle Registration",
        "vehicleRegistration",
        "vehicleRegistration",
        {
            StepTitle: "Let's find your Registration certificate(RC)",
            StepPreviewTopInstruction:
                "Enter your license plate number and we'll get the required information from the Vahan and Sarathi portal of MoRTh, or your can upload your Registration certificate(RC) instead",
            StepPreviewBottomInstruction: "This will be used to verify your vehicle",
        }
    ),
    [BaseStepId.vehicleInsurance]: createDocumentStep(
        "Vehicle Insurance",
        "vehicleInsurance",
        "vehicleInsurance",
        {
            StepTitle: "Let's find your vehicle insurance",
            StepPreviewTopInstruction:
                "Enter your license plate number and we'll get the required vehicle information from the Vahan and Sarathi portal of MoRTh, or you can upload your vehicle insurance instead",
            StepPreviewBottomInstruction: "This will be used to verify your vehicle",
        }
    ),
};

// India document steps
const indiaDocumentSteps: Record<IndiaStepId, TypedDocumentStep> = {
    [IndiaStepId.aadhaar]: createDocumentStep(
        'Aadhaar Card',
        "document",
        IndiaStepId.aadhaar,
        {
            StepTitle: "Let's find your Aadhaar card",
            StepPreviewTopInstruction:
                "Enter your Aadhaar and we'll get your information from UIDAI. By sharing your Aadhaar details, you hereby confirm that you have shared such details voluntarily",
            StepPreviewBottomInstruction: "",
        }
    ),
    [IndiaStepId.pan]: createDocumentStep(
        'Pan Card',
        "document",
        IndiaStepId.pan,
        {
            StepTitle: "Let's find your PAN card",
            StepPreviewTopInstruction:
                "Enter your PAN card number and we'll get your information from NSDL, or you can upload your PAN card instead",
        }
    ),
    [IndiaStepId.vehiclePermit]: createDocumentStep(
        "Vehicle Permit",
        "document",
        IndiaStepId.vehiclePermit,
        
        {
            StepTitle: "Take a photo of your Vehicle Permit",
            StepPreviewTopInstruction: "",
            StepPreviewBottomInstruction:
                "If the vehicle owner name on the vehicle documents is different from mine. then I hereby confirm that I have the vehicle owner's consent to",
            StepUseMyPhoneText: "Use my phone",
            StepUploadActionText: "Upload photo",
        }
    ),
};

// Export combined templates
export const templates: Record<TemplateStepId, TypedDocumentStep> = {
    [BaseStepId.driverLicense]: baseDocumentSteps[BaseStepId.driverLicense],
    [BaseStepId.profilePhoto]: baseDocumentSteps[BaseStepId.profilePhoto],
    [IndiaStepId.aadhaar]: indiaDocumentSteps[IndiaStepId.aadhaar],
    [IndiaStepId.pan]: indiaDocumentSteps[IndiaStepId.pan],
    [BaseStepId.vehicleRegistration]: baseDocumentSteps[BaseStepId.vehicleRegistration],
    [BaseStepId.vehicleInsurance]: baseDocumentSteps[BaseStepId.vehicleInsurance],
    [IndiaStepId.vehiclePermit]: indiaDocumentSteps[IndiaStepId.vehiclePermit],
} as const;

console.log(Object.values(templates))


export type { TypedDocumentStep }

// const usDocumentSteps: TypedDocumentStep = {
//     ssn: {
//         type: "document",
//         stepId: "ssn",
//         stepVersion: 1,
//         display: {
//             StepTitle: "Let's find your SSN",
//             StepPreviewTopInstruction: "Enter your SSN and we'll verify your information",
//             StepPreviewBottomInstruction: "",
//             StepUseMyPhoneText: null,
//             StepUploadActionText: null,
//             StepPreviewInstructionsList: [],
//             StepPreviewImageURL: null,
//         },
//     },
//     stateId: {
//         type: "document",
//         stepId: "stateId",
//         stepVersion: 1,
//         display: {
//             StepTitle: "Let's find your State ID",
//             StepPreviewTopInstruction: "Enter your State ID and we'll verify your information",
//             StepPreviewBottomInstruction: "",
//             StepUseMyPhoneText: null,
//             StepUploadActionText: null,
//             StepPreviewInstructionsList: [],
//             StepPreviewImageURL: null,
//         },
//     },
//     vehiclePermit: {
//         type: "document",
//         stepId: "vehiclePermit",
//         stepVersion: 1,
//         display: {
//             StepTitle: "Take a photo of your Vehicle Permit",
//             StepPreviewTopInstruction: "",
//             StepPreviewBottomInstruction:
//                 "If the vehicle owner name on the vehicle documents is different from mine, then I hereby confirm that I have the vehicle owner's consent",
//             StepUseMyPhoneText: "Use my phone",
//             StepUploadActionText: "Upload photo",
//             StepPreviewInstructionsList: [],
//             StepPreviewImageURL: null,
//         },
//     },
// };






