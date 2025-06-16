import { z } from 'zod';
import { OCRService } from './orc-service';
import { LocationService } from './location-service';


// Document validation schemas
const drivingLicenseSchema = z.object({
    licenseNumber: z.string().regex(/^[A-Z]{2}[0-9]{2}[0-9]{4}[0-9]{7}$/, {
        message: "Invalid license number format. Expected format: XX99XXXX9999999"
    }),
    dob: z.string().refine((date) => {
        const parsedDate = new Date(date);
        const today = new Date();
        const age = today.getFullYear() - parsedDate.getFullYear();
        return age >= 18;
    }, {
        message: "You must be at least 18 years old"
    })
});

const aadhaarSchema = z.object({
    aadhaarNumber: z.string().regex(/^\d{12}$/, {
        message: "Invalid Aadhaar number. Must be 12 digits"
    }),
});

const panSchema = z.object({
    panNumber: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, {
        message: "Invalid PAN number. Expected format: XXXXX9999X"
    }),
});



export class DocumentVerificationService {
    private static instance: DocumentVerificationService;
    private ocrService: OCRService;
    private locationService: LocationService;

    private constructor() {
        this.ocrService = new OCRService();
        this.locationService = LocationService.getInstance();
    }

    public static getInstance(): DocumentVerificationService {
        if (!DocumentVerificationService.instance) {
            DocumentVerificationService.instance = new DocumentVerificationService();
        }
        return DocumentVerificationService.instance;
    }

    async verifyDrivingLicense(image: File): Promise<{
        isValid: boolean;
        data?: any;
        error?: string;
    }> {
        try {
            // Extract text from image using OCR
            const extractedData = await this.ocrService.extractText(image);

            // Parse and validate the extracted data
            const parsedData = drivingLicenseSchema.parse(extractedData);

            // Get user's location to verify against regional requirements
            const location = await this.locationService.getCurrentLocation();
            
            // Verify against regional requirements
            const isValid = await this.validateDrivingLicense(parsedData, location);

            return {
                isValid,
                data: parsedData
            };
        } catch (error) {
            if (error instanceof z.ZodError) {
                return {
                    isValid: false,
                    error: error.errors[0].message
                };
            }
            return {
                isValid: false,
                error: error instanceof Error ? error.message : 'Invalid driving license'
            };
        }
    }

    async verifyAadhaarCard(image: File): Promise<{
        isValid: boolean;
        data?: any;
        error?: string;
    }> {
        try {
            const extractedData = await this.ocrService.extractText(image);
            const parsedData = aadhaarSchema.parse(extractedData);

            // Verify Aadhaar number with UIDAI API
            const isValid = await this.validateAadhaar(parsedData.aadhaarNumber);

            return {
                isValid,
                data: parsedData
            };
        } catch (error) {
            if (error instanceof z.ZodError) {
                return {
                    isValid: false,
                    error: error.errors[0].message
                };
            }
            return {
                isValid: false,
                error: error instanceof Error ? error.message : 'Invalid Aadhaar card'
            };
        }
    }

    async verifyPanCard(image: File): Promise<{
        isValid: boolean;
        data?: any;
        error?: string;
    }> {
        try {
            const extractedData = await this.ocrService.extractText(image);
            const parsedData = panSchema.parse(extractedData);

            // Verify PAN with NSDL API
            const isValid = await this.validatePan(parsedData.panNumber);

            return {
                isValid,
                data: parsedData
            };
        } catch (error) {
            if (error instanceof z.ZodError) {
                return {
                    isValid: false,
                    error: error.errors[0].message
                };
            }
            return {
                isValid: false,
                error: error instanceof Error ? error.message : 'Invalid PAN card'
            };
        }
    }

    private async validateDrivingLicense(data: any, location: any): Promise<boolean> {
        // Check if the license is from the correct region
        const licenseRegion = data.licenseNumber.substring(0, 2);
        
        // Get regional requirements
        const requirements = await this.locationService.getDocumentRequirements();
        
        // Verify against regional requirements
        if (requirements.drivingLicense?.allowedRegions && 
            !requirements.drivingLicense.allowedRegions.includes(licenseRegion)) {
            throw new Error(`Driving license from ${licenseRegion} is not accepted in ${location.region}`);
        }

        // Additional validation logic
        // 1. Check if the license is expired
        if (data.expiryDate && new Date(data.expiryDate) < new Date()) {
            throw new Error('Driving license has expired');
        }

        // 2. Verify against a database of valid license numbers
        // This would typically involve an API call to your backend
        const isValid = await this.verifyLicenseWithBackend(data.licenseNumber);
        
        return isValid;
    }

    private async validateAadhaar(aadhaarNumber: string): Promise<boolean> {
        // Implement Aadhaar validation logic
        // This could include:
        // 1. Verifying with UIDAI API
        // 2. Checking if the number is in the correct format
        // 3. Verifying the checksum
        return true;
    }

    private async validatePan(panNumber: string): Promise<boolean> {
        // Implement PAN validation logic
        // This could include:
        // 1. Verifying with NSDL API
        // 2. Checking if the number is in the correct format
        // 3. Verifying the checksum
        return true;
    }

    private async verifyLicenseWithBackend(licenseNumber: string): Promise<boolean> {
        // This would be an API call to your backend to verify the license
        // For now, we'll return true for demonstration
        return true;
    }
}