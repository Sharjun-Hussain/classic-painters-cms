const { createClient } = require('@libsql/client');

async function migrateHero() {
    const url = "libsql://classic-painters-cms-vercel-icfg-r3lafaz8tyflv3oeslbihuyy.aws-us-east-1.turso.io";
    const authToken = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NjgyMjU1MjQsImlkIjoiNDZiODE1ZTQtMjFhNS00YmNiLWExZTAtNjVjZTRmNzY5OTQ2IiwicmlkIjoiZmMxNGEzYzMtZjY5NC00OTljLWI4ZDktYzQzMzhiNTU3NWM4In0.QdjpC3g9-vTxrZLskOmei-faaiRKEaLB8JiKZwPuIZ0bPh07ukOfxahtRwkk6wOYd1hyOekZA_D7a9cbl4pbCg";

    const client = createClient({
        url: url,
        authToken: authToken,
    });

    console.log('🚀 Starting migration for HeroSection...');

    try {
        // Add availabilityText column
        try {
            console.log('Adding availabilityText column...');
            await client.execute("ALTER TABLE HeroSection ADD COLUMN availabilityText TEXT");
            console.log('✅ availabilityText column added.');
        } catch (e) {
            if (e.message.includes('duplicate column name')) {
                console.log('ℹ️ availabilityText column already exists.');
            } else {
                throw e;
            }
        }

        // Add locations column
        try {
            console.log('Adding locations column...');
            await client.execute("ALTER TABLE HeroSection ADD COLUMN locations TEXT");
            console.log('✅ locations column added.');
        } catch (e) {
            if (e.message.includes('duplicate column name')) {
                console.log('ℹ️ locations column already exists.');
            } else {
                throw e;
            }
        }

        console.log('🎉 Migration completed successfully!');

    } catch (error) {
        console.error('❌ Error during migration:', error);
        process.exit(1);
    } finally {
        client.close();
    }
}

migrateHero();
