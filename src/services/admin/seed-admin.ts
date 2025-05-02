import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';


// Initialize Prisma client
const db = new PrismaClient();

async function main() {
    try {

        // Hash the default password
        const hashedPassword = await bcryptjs.hash('admin123', 10);

        // create or update admin user
        const admin = await db.admin.create({
            data: {
                email: 'anujkashyap123000@gmail.com',
                phoneCountryCode: '+91',
                role: 'super_admin',
                phonenumber: '8448468489',
                password: hashedPassword,
            }
        });

        console.log('Admin user created successfully!');
        console.log('Admin email:', admin.email);
    } catch (error) {
        console.error('Error seeding admin:', error);
    } finally {
        await db.$disconnect();
    }
}

main();