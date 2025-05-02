import { headers } from "next/headers";
import { CountryCode, getRegistrationSteps } from "../registrationConfig";
import { db } from "@/lib/db/prisma";
import { Driver, Registration, User } from "@prisma/client";
import { userInstance } from "../user/user-service";





/**
 * Fetches the user's location based on their IP address
 * Returns mock location in development environment
 */
async function getLocation() {
    "use server"
    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        headersList.get('x-real-ip') ||
        headersList.get('x-client-ip') ||
        headersList.get('cf-connecting-ip') ||
        headersList.get('true-client-ip') ||
        (process.env.NODE_ENV === 'development' ? '127.0.0.1' : 'unknown');

    if (process.env.NODE_ENV === 'development' && ip === '::1') {
        return {
            city: "Delhi",
            postalCode: "400001",
            state: "New Delhi",
            country: "India",
            countryCode: "IN" as CountryCode,
            coordinates: [72.8777, 19.0760]
        };
    }

    try {
        const location = await fetch(`https://ipapi.co/${ip}/json/`, {
            headers: { 'User-Agent': 'nodejs-ipapi-v1.02' }
        });

        if (!location.ok) {
            throw new Error(`Location API failed: ${location.statusText}`);
        }

        const locationData = await location.json();
        return {
            city: locationData.city,
            postalCode: locationData.postal,
            state: locationData.region,
            country: locationData.country_name,
            countryCode: locationData.country_code as CountryCode,
            coordinates: [locationData.longitude, locationData.latitude]
        };
    } catch (error) {
        return {
            city: "Mumbai",
            postalCode: "400001",
            state: "Maharashtra",
            country: "India",
            countryCode: "IN" as CountryCode,
            coordinates: [72.8777, 19.0760]
        };
    }
};

/**
 * Service class for managing driver-related operations
 * Implements singleton pattern for efficient resource usage
 */
export class DriverServices {
    private static instance: DriverServices;
    private driverCache: Map<string, Driver & { Registration: Registration[]; user: User }> = new Map();

    private constructor() {
        return DriverServices.instance;
    }


    /**
     * Retrieves driver information with associated registrations and user data
     */
    public async getDriver(userId: string) {
        const cachedDriver = this.driverCache.get(userId);
        if (cachedDriver) return cachedDriver;

        const driver = await db.driver.findUnique({
            where: { userId },
            include: {
                Registration: true,
                user: true
            }
        });

        if (driver) {
            this.driverCache.set(userId, driver);
            if (driver.user) {
                userInstance.setCachedUser(userId, driver.user);
            }
        }

        return driver;
    }

    /**
     * Returns the singleton instance of DriverServices
     */
    public static getInstance(): DriverServices {
        if (!DriverServices.instance) {
            DriverServices.instance = new DriverServices();
        }
        return DriverServices.instance;
    }

    /**
     * Initializes driver registration process
     * Creates driver record and registration steps based on country
     * Uses transaction to ensure data consistency
     */
    public async initializeDriverRegistration(userId: string) {
        try {
            const existingDriver = await this.getDriver(userId);
            if (existingDriver?.Registration.length) return existingDriver;

            const location = await getLocation();
            const registrationSteps = getRegistrationSteps(location.countryCode.toUpperCase());
            if (!registrationSteps?.length) return null;

            const driverWithSteps = await db.$transaction(async (tx) => {
                const driver = await tx.driver.upsert({
                    where: { userId },
                    create: {
                        userId,
                        status: 'OFFLINE',
                        isVerified: false,
                        isRegistrationComplete: false,
                        isInServiceArea: true,
                        rating: 5,
                        totalRides: 0,
                        cancelledRides: 0,
                    },
                    update: {}
                });

                const existingSteps = await tx.registration.findMany({
                    where: { driverId: driver.id }
                });

                if (!existingSteps.length) {
                    await tx.registration.createMany({
                        data: registrationSteps.map((step, idx) => ({
                            driverId: driver.id,
                            type: step.type,
                            display: step.display,
                            options: {
                                ...step.options,
                                isRecommended: idx === 0
                            },
                            status: step.status,
                        })),
                    });
                }

                return await tx.driver.findUnique({
                    where: { userId },
                    include: {
                        Registration: true,
                        user: true,
                    },
                });
            });

            if (driverWithSteps) {
                this.driverCache.set(userId, driverWithSteps);
                if (driverWithSteps.user) {
                    userInstance.setCachedUser(userId, driverWithSteps.user)
                }
            }

            return driverWithSteps;
        } catch (error) {
            console.error('Error in initializeDriverRegistration:', error);
            return null;
        }
    }

    /**
     * Clears cached data for a specific user
     */
    public clearCache(userId: string) {
        this.driverCache.delete(userId);
        userInstance.deleteCachedUser(userId)
    }
}