import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import { createClient } from '@libsql/client';

const prismaClientSingleton = () => {
    // Support both DATABASE_URL and TURSO_DATABASE_URL
    const databaseUrl = process.env.DATABASE_URL || process.env.TURSO_DATABASE_URL;

    // Check if we're using Turso (production) or local SQLite (development)
    if (process.env.TURSO_AUTH_TOKEN && databaseUrl?.startsWith('libsql://')) {
        // Turso configuration for production
        const libsql = createClient({
            url: databaseUrl,
            authToken: process.env.TURSO_AUTH_TOKEN,
        });

        const adapter = new PrismaLibSql(libsql);
        return new PrismaClient({ adapter });
    } else {
        // Local SQLite for development
        return new PrismaClient();
    }
};

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;
