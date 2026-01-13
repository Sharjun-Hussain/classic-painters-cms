const { createClient } = require('@libsql/client');

async function migrate() {
    const url = "libsql://classic-painters-cms-vercel-icfg-r3lafaz8tyflv3oeslbihuyy.aws-us-east-1.turso.io";
    const authToken = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NjgyMjU1MjQsImlkIjoiNDZiODE1ZTQtMjFhNS00YmNiLWExZTAtNjVjZTRmNzY5OTQ2IiwicmlkIjoiZmMxNGEzYzMtZjY5NC00OTljLWI4ZDktYzQzMzhiNTU3NWM4In0.QdjpC3g9-vTxrZLskOmei-faaiRKEaLB8JiKZwPuIZ0bPh07ukOfxahtRwkk6wOYd1hyOekZA_D7a9cbl4pbCg";

    const client = createClient({
        url: url,
        authToken: authToken,
    });

    console.log('🚀 Adding missing columns to SiteSettings table in Turso...');

    try {
        await client.execute('ALTER TABLE "SiteSettings" ADD COLUMN "navbarCtaText" TEXT;');
        console.log('✅ Added navbarCtaText column.');

        await client.execute('ALTER TABLE "SiteSettings" ADD COLUMN "navbarCtaLink" TEXT;');
        console.log('✅ Added navbarCtaLink column.');

        console.log('✨ Migration completed successfully!');
    } catch (error) {
        if (error.message.includes('duplicate column name')) {
            console.log('ℹ️ Columns already exist, skipping.');
        } else {
            console.error('❌ Migration failed:', error);
        }
    } finally {
        client.close();
    }
}

migrate();
