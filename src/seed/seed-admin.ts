import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';


// Initialize Prisma client
const db = new PrismaClient();

async function main() {
    try {

        // Hash the default password
        const hashedPassword = await bcryptjs.hash('adminDash@123', 10);

        // create or update admin user
        await db.admin.create({
            data: {
                email: 'anujkashyap123000@gmail.com',
                phoneCountryCode: '+91',
                role: 'super_admin',
                phonenumber: '8448468489',
                password: hashedPassword,
            }
        });
    } catch (error) {
        console.error('Error seeding admin:', error);
    } finally {
        await db.$disconnect();
    }
}

main();