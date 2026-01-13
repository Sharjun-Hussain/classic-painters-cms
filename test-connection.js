import prisma from './lib/prisma.js';

async function testConnection() {
    console.log('Testing connection to Turso Cloud Database...');
    try {
        const userCount = await prisma.user.count();
        const serviceCount = await prisma.service.count();
        const settings = await prisma.siteSettings.findFirst();
        console.log(`✅ Connection successful!`);
        console.log(`   - Found ${userCount} users in the cloud database.`);
        console.log(`   - Found ${serviceCount} services in the cloud database.`);
        console.log(`   - Settings fetch: ${settings ? 'SUCCESS' : 'EMPTY'}`);
        if (settings) {
            console.log(`   - Navbar Links: ${settings.navbarLinks}`);
            console.log(`   - Navbar CTA: ${settings.navbarCtaText} -> ${settings.navbarCtaLink}`);
        }

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
