# Vercel Deployment Guide

## Environment Variables Setup

When deploying to Vercel, you need to set these environment variables in your Vercel project settings:

### Required Environment Variables

1. **Database**
   ```
   DATABASE_URL="file:./dev.db"
   ```

2. **Supabase**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://ferzeypwpcdptuugvjwi.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   SUPABASE_BUCKET_NAME=classic-painters
   ```

3. **NextAuth** ⚠️ **IMPORTANT**
   ```
   AUTH_SECRET=your-auth-secret-here
   NEXTAUTH_URL=https://your-vercel-domain.vercel.app
   ```
   
   **Note:** Replace `https://your-vercel-domain.vercel.app` with your actual Vercel deployment URL.

### How to Add Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Click on **Settings** → **Environment Variables**
3. Add each variable:
   - **Key**: Variable name (e.g., `AUTH_SECRET`)
   - **Value**: Variable value
   - **Environments**: Select all (Production, Preview, Development)
4. Click **Save**

### Auto-Detection (Alternative)

If you don't set `NEXTAUTH_URL`, NextAuth will try to auto-detect using Vercel's `VERCEL_URL` environment variable. However, it's recommended to set it explicitly for production.

### Generate New AUTH_SECRET for Production

For security, generate a new secret for production:

```bash
openssl rand -base64 32
```

Copy the output and use it as your `AUTH_SECRET` in Vercel.

## Deployment Steps

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository
   - Configure environment variables (see above)
   - Deploy!

3. **After Deployment**
   - Note your deployment URL (e.g., `https://your-app.vercel.app`)
   - Update `NEXTAUTH_URL` in Vercel settings to match this URL
   - Redeploy if needed

## Database Note

⚠️ **SQLite on Vercel**: Vercel's serverless functions are read-only. For production, consider:
- Using Vercel Postgres
- Using Supabase Postgres
- Using PlanetScale
- Using any other hosted database

To migrate to Postgres:
1. Update `schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. Get a Postgres connection string from your provider
3. Update `DATABASE_URL` in Vercel
4. Run migrations: `npx prisma migrate deploy`

## Troubleshooting

### Issue: Redirects to localhost
**Solution**: Make sure `NEXTAUTH_URL` is set to your production domain in Vercel environment variables.

### Issue: 500 errors
**Solution**: Check Vercel function logs for detailed error messages.

### Issue: Database errors
**Solution**: SQLite doesn't work on Vercel. Migrate to a hosted database.
