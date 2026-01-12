# Turso Setup Guide for Vercel

## What is Turso?
Turso is a distributed SQLite database that works perfectly with serverless platforms like Vercel. It's **much simpler** than PostgreSQL and uses the same SQLite syntax you're already familiar with!

## Step 1: Create Turso Database

1. **Install Turso CLI** (on your local machine):
   ```bash
   curl -sSfL https://get.tur.so/install.sh | bash
   ```

2. **Sign up and login**:
   ```bash
   turso auth signup
   turso auth login
   ```

3. **Create your database**:
   ```bash
   turso db create classic-painters
   ```

4. **Get your database URL**:
   ```bash
   turso db show classic-painters --url
   ```
   Copy this URL - you'll need it!

5. **Create an auth token**:
   ```bash
   turso db tokens create classic-painters
   ```
   Copy this token too!

## Step 2: Update Prisma Schema

Your schema is already perfect for Turso! Just need to update the datasource:

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

## Step 3: Add Environment Variables to Vercel

Go to Vercel → Settings → Environment Variables and add:

```
DATABASE_URL=libsql://your-database-url-from-turso
TURSO_AUTH_TOKEN=your-auth-token-from-turso
```

## Step 4: Update Prisma Client for Turso

Install the Turso adapter:
```bash
npm install @libsql/client
```

Update `lib/prisma.js`:
```javascript
import { PrismaClient } from '@prisma/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';
import { createClient } from '@libsql/client';

const libsql = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const adapter = new PrismaLibSQL(libsql);

const prismaClientSingleton = () => {
  return new PrismaClient({ adapter });
};

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;
```

## Step 5: Run Migrations

Locally (after setting DATABASE_URL in .env):
```bash
npx prisma migrate dev
```

Or push schema directly to Turso:
```bash
npx prisma db push
```

## Step 6: Seed Admin User

Run your seed script:
```bash
node scripts/seed-admin.js
```

## Step 7: Deploy to Vercel

```bash
git add .
git commit -m "Switch to Turso database"
git push origin main
```

## Why Turso is Better for You:

✅ **SQLite syntax** - You already know it!
✅ **No connection pooling complexity** - Just works
✅ **Fast** - Edge-replicated globally
✅ **Free tier** - 500 databases, 9GB storage
✅ **Simple setup** - No complex configuration
✅ **Works with Prisma** - Same workflow

## Troubleshooting

If you get errors, make sure:
- DATABASE_URL starts with `libsql://`
- TURSO_AUTH_TOKEN is set in Vercel
- @libsql/client is installed
- @prisma/adapter-libsql is installed

That's it! Much simpler than PostgreSQL! 🎉
