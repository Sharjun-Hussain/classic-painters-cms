import prisma from './lib/prisma.js';

async function testConnection() {
    console.log('Testing connection to Turso Cloud Database...');
    try {
        const userCount = await prisma.user.count();
        const serviceCount = await prisma.service.count();
        console.log(`✅ Connection successful!`);
        console.log(`   - Found ${userCount} users in the cloud database.`);
        console.log(`   - Found ${serviceCount} services in the cloud database.`);

        const users = await prisma.user.findMany({
            select: { email: true, isSuperAdmin: true }
        });
        console.log('Users:', users);
    } catch (error) {
        console.error('❌ Connection failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testConnection();
