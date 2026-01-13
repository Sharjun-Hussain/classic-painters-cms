const { PrismaClient } = require('@prisma/client');
const { PrismaLibSQL } = require('@prisma/adapter-libsql');
const { createClient } = require('@libsql/client');
const bcrypt = require('bcryptjs');

const databaseUrl = process.env.DATABASE_URL || process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

let prisma;

if (authToken && databaseUrl?.startsWith('libsql://')) {
    const libsql = createClient({
        url: databaseUrl,
        authToken: authToken,
    });
    const adapter = new PrismaLibSQL(libsql);
    prisma = new PrismaClient({ adapter });
} else {
    prisma = new PrismaClient();
}

async function main() {
    const email = 'admin@gmail.com';
    const password = 'Inzeedo@123';
    const name = 'Admin User';

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.upsert({
        where: { email },
        update: {
            password: hashedPassword,
            isSuperAdmin: true,
        },
        create: {
            email,
            password: hashedPassword,
            name,
            isSuperAdmin: true,
        },
    });

    console.log(`Upserted super admin user: ${user.email}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
