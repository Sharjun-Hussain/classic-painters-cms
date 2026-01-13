const { createClient } = require('@libsql/client');
const fs = require('fs');
const path = require('path');

async function pushSchema() {
    const url = "libsql://classic-painters-cms-vercel-icfg-r3lafaz8tyflv3oeslbihuyy.aws-us-east-1.turso.io";
    const authToken = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NjgyMjU1MjQsImlkIjoiNDZiODE1ZTQtMjFhNS00YmNiLWExZTAtNjVjZTRmNzY5OTQ2IiwicmlkIjoiZmMxNGEzYzMtZjY5NC00OTljLWI4ZDktYzQzMzhiNTU3NWM4In0.QdjpC3g9-vTxrZLskOmei-faaiRKEaLB8JiKZwPuIZ0bPh07ukOfxahtRwkk6wOYd1hyOekZA_D7a9cbl4pbCg";

    const client = createClient({
        url: url,
        authToken: authToken,
    });

    const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

    // Split SQL into individual statements
    // This is a simple split, might need refinement for complex SQL
    const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0);

    console.log(`🚀 Pushing ${statements.length} statements to Turso...`);

    try {
        for (const statement of statements) {
            console.log(`Executing: ${statement.substring(0, 50)}...`);
            await client.execute(statement);
        }
        console.log('✅ Schema pushed successfully!');
    } catch (error) {
        console.error('❌ Error pushing schema:', error);
        process.exit(1);
    } finally {
        client.close();
    }
}

pushSchema();
