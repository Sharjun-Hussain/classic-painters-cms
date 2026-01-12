import { PrismaClient } from '@prisma/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';
import { createClient } from '@libsql/client';

const prismaClientSingleton = () => {
    // Check if we're using Turso (production) or local SQLite (development)
    if (process.env.TURSO_AUTH_TOKEN && process.env.DATABASE_URL?.startsWith('libsql://')) {
        // Turso configuration for production
        const libsql = createClient({
            url: process.env.DATABASE_URL,
            authToken: process.env.TURSO_AUTH_TOKEN,
        });

        const adapter = new PrismaLibSQL(libsql);
        return new PrismaClient({ adapter });
    } else {
        return new PrismaClient();
    }
};

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;
