
import { RegistrationSteps } from '@/features/driver/registration/registration-steps'
import { getServerSession, getUserIdFromToken } from '@/lib/auth';
import { DriverServices } from '@/services/driver/driver-services';
import { userInstance } from '@/services/user/user-service';
import { redirect } from 'next/navigation';
import React from 'react'

export const metadata = {
    title: 'Driver Registration'
}

export default async function DriverRegistration() {

    const { session } = await getServerSession();

    if (!session || session.role !== 'driver') {
        redirect('/');
    }

    const driverService = DriverServices.getInstance();
    const driver = await driverService.getDriver(session.id);


    // If no driver record exists, initialize registration
    if (!driver) {
        const newDriver = await driverService.initializeDriverRegistration(session.id);
        if (!newDriver) {
            throw new Error('Failed to initialize driver registration');
        }
        console.log('new Driver', newDriver)
        return (
            <RegistrationSteps
                User={newDriver.user}
                Registration={newDriver.Registration}
            />
        );
    }



    // Only fetch full user data if needed

    const user = await userInstance.getCachedUser(session.id)

    return (
        <RegistrationSteps
            User={user!}
            Registration={driver.Registration}
        />
    );
}

