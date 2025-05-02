import { getServerSession } from "@/lib/auth"
import { DriverServices } from "@/services/driver/driver-services";
import { redirect } from "next/navigation";

export const metadata = {
    title: 'Driver Dashboard'
}

export default async function DriverPage() {

    const { session } = await getServerSession();

    if (!session || session?.role !== 'driver') {
        redirect('/')
    };


    const driverService = DriverServices.getInstance();
    const driver = await driverService.initializeDriverRegistration(session.id);

    // If no driver record or incomplete registration, redirect to registration
    if (!driver || !driver.Registration.length) {
        redirect('/driver/registration');
    }

    // Check if all registration steps are completed
    const isRegistrationComplete = driver.Registration.every(
        step => step.status === 'completed'
    );

    if (!isRegistrationComplete) {
        redirect('/driver/registration');
    }

    return (
        <div>
            DRIVER DASHBOARD
        </div>
    )


}