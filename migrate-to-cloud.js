import { PrismaClient as PrismaClientLocal } from '@prisma/client';
import { PrismaClient as PrismaClientCloud } from '@prisma/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';
import { createClient } from '@libsql/client';

async function migrate() {
    console.log('🚀 Starting data migration from Local SQLite to Turso Cloud...');

    // 1. Setup Local Client
    const localPrisma = new PrismaClientLocal({
        datasources: {
            db: {
                url: 'file:./dev.db',
            },
        },
    });

    // 2. Setup Cloud Client
    const databaseUrl = "libsql://classic-painters-cms-vercel-icfg-r3lafaz8tyflv3oeslbihuyy.aws-us-east-1.turso.io";
    const authToken = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NjgyMjU1MjQsImlkIjoiNDZiODE1ZTQtMjFhNS00YmNiLWExZTAtNjVjZTRmNzY5OTQ2IiwicmlkIjoiZmMxNGEzYzMtZjY5NC00OTljLWI4ZDktYzQzMzhiNTU3NWM4In0.QdjpC3g9-vTxrZLskOmei-faaiRKEaLB8JiKZwPuIZ0bPh07ukOfxahtRwkk6wOYd1hyOekZA_D7a9cbl4pbCg";

    const libsql = createClient({
        url: databaseUrl,
        authToken: authToken,
    });
    const adapter = new PrismaLibSQL(libsql);
    const cloudPrisma = new PrismaClientCloud({ adapter });

    const tables = [
        'user',
        'galleryImage',
        'heroSection',
        'sectionContent',
        'service',
        'testimonial',
        'siteSettings',
        'auditLog'
    ];

    try {
        for (const table of tables) {
            console.log(`📦 Migrating table: ${table}...`);

            // Read from local
            const data = await localPrisma[table].findMany();
            console.log(`   Found ${data.length} records locally.`);

            if (data.length === 0) continue;

            // Push to cloud
            // We use createMany if supported, or loop
            // Note: Turso/libsql adapter might have some limitations with createMany depending on version
            // so we'll do it in a loop or batch for safety

            let count = 0;
            for (const item of data) {
                await cloudPrisma[table].upsert({
                    where: { id: item.id },
                    update: item,
                    create: item,
                });
                count++;
            }
            console.log(`   ✅ Successfully migrated ${count} records to cloud.`);
        }

        console.log('\n✨ Migration completed successfully!');
    } catch (error) {
        console.error('\n❌ Migration failed:', error);
    } finally {
        await localPrisma.$disconnect();
        await cloudPrisma.$disconnect();
    }
}

migrate();
