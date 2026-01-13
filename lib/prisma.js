import { PrismaClient } from '@prisma/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';
import { createClient } from '@libsql/client';

const prismaClientSingleton = () => {
    // Support both DATABASE_URL and TURSO_DATABASE_URL
    const databaseUrl = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;

    console.log('Prisma Initialization Diagnostic:');
    console.log('  - TURSO_DATABASE_URL exists:', !!process.env.TURSO_DATABASE_URL);
    console.log('  - DATABASE_URL exists:', !!process.env.DATABASE_URL);
    console.log('  - TURSO_AUTH_TOKEN exists:', !!authToken);
    console.log('  - Selected URL protocol:', databaseUrl?.split(':')[0]);

    // Check if we're using Turso (production or local cloud)
    if (authToken && databaseUrl?.startsWith('libsql://')) {
        console.log('  - Mode: TURSO (Cloud)');
        const libsql = createClient({
            url: databaseUrl,
            authToken: authToken,
        });

        const adapter = new PrismaLibSQL(libsql);
        return new PrismaClient({ adapter });
    } else {
        console.log('  - Mode: SQLITE (Local File)');
        return new PrismaClient();
    }
};

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;
