# Quick Fix: Migrate to Vercel Postgres

## The Problem
SQLite (`file:./dev.db`) doesn't work on Vercel because:
- Vercel functions are stateless and read-only
- Each request runs in a new container
- File system changes don't persist

## Solution: Use Vercel Postgres

### Step 1: Create Vercel Postgres Database

1. Go to your Vercel project dashboard
2. Click **Storage** tab
3. Click **Create Database**
4. Select **Postgres**
5. Choose a name (e.g., `classic-painters-db`)
6. Select region closest to your users
7. Click **Create**

### Step 2: Connect Database to Project

Vercel will automatically add these environment variables to your project:
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL` ← **Use this one**
- `POSTGRES_URL_NON_POOLING`

### Step 3: Update Prisma Schema

Update `prisma/schema.prisma`:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

### Step 4: Update Environment Variables

In Vercel → Settings → Environment Variables:

1. **Add/Update**:
   ```
   DATABASE_URL=${POSTGRES_PRISMA_URL}
   DIRECT_URL=${POSTGRES_URL_NON_POOLING}
   ```

2. **For local development**, update your `.env`:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
   ```
   Or keep SQLite for local and use Postgres only in production.

### Step 5: Run Migrations on Vercel

After deploying with the new schema:

1. Go to Vercel project → **Deployments**
2. Click on your latest deployment
3. Go to **Functions** tab
4. You'll need to run migrations. Add this to `package.json`:

```json
{
  "scripts": {
    "build": "npx prisma generate && npx prisma migrate deploy && next build",
    "vercel-build": "npx prisma generate && npx prisma migrate deploy && next build"
  }
}
```

### Step 6: Seed Admin User on Postgres

After deployment, you need to create the admin user. Two options:

**Option A: Create API endpoint** (Temporary, remove after use)

Create `app/api/setup/route.js`:
```javascript
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { secret } = await request.json();
    
    // Security: Use a secret key
    if (secret !== process.env.SETUP_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if admin exists
    const existing = await prisma.user.findUnique({
      where: { email: 'admin@example.com' }
    });

    if (existing) {
      return NextResponse.json({ message: 'Admin already exists' });
    }

    // Create admin
    const hashedPassword = await bcrypt.hash('your-secure-password', 10);
    const user = await prisma.user.create({
      data: {
        email: 'admin@example.com',
        password: hashedPassword,
        name: 'Admin'
      }
    });

    return NextResponse.json({ message: 'Admin created', id: user.id });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

Add to Vercel environment variables:
```
SETUP_SECRET=your-random-secret-key
```

Then call: `POST https://your-domain.vercel.app/api/setup` with body `{"secret": "your-random-secret-key"}`

**Option B: Use Vercel Postgres Dashboard**

1. Go to Vercel → Storage → Your Postgres DB
2. Click **Data** tab
3. Run SQL directly:

```sql
INSERT INTO "User" (email, password, name, "createdAt", "updatedAt")
VALUES (
  'admin@example.com',
  '$2a$10$hashed-password-here',
  'Admin',
  NOW(),
  NOW()
);
```

Generate the hashed password locally first:
```bash
node -e "console.log(require('bcryptjs').hashSync('your-password', 10))"
```

## Alternative: Use Supabase Postgres

If you prefer Supabase:

1. Go to Supabase → SQL Editor
2. Your database URL is already in your env vars
3. Update `DATABASE_URL` in Vercel to your Supabase Postgres URL
4. Run migrations
5. Seed admin user via Supabase dashboard

## Quick Test

After setup, test the database connection:

Create `app/api/test-db/route.js`:
```javascript
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const userCount = await prisma.user.count();
    return NextResponse.json({ 
      success: true, 
      userCount,
      message: 'Database connected!' 
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
```

Visit: `https://your-domain.vercel.app/api/test-db`

## Summary

1. ✅ Create Vercel Postgres database
2. ✅ Update `schema.prisma` to use PostgreSQL
3. ✅ Update environment variables
4. ✅ Update build script to run migrations
5. ✅ Deploy
6. ✅ Seed admin user
7. ✅ Test login

This will fix the "Something went wrong" error! 🎉
