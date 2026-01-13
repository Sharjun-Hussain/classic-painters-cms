#!/bin/bash

# Setup Turso and Seed Admin User
# This script configures your local environment to use Turso and seeds the admin user

echo "🔧 Setting up Turso Database"
echo "=============================="
echo ""

# Turso credentials
TURSO_URL="libsql://classic-painters-cms-vercel-icfg-r3lafaz8tyflv3oeslbihuyy.aws-us-east-1.turso.io"
TURSO_TOKEN="eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NjgyMjU1MjQsImlkIjoiNDZiODE1ZTQtMjFhNS00YmNiLWExZTAtNjVjZTRmNzY5OTQ2IiwicmlkIjoiZmMxNGEzYzMtZjY5NC00OTljLWI4ZDktYzQzMzhiNTU3NWM4In0.QdjpC3g9-vTxrZLskOmei-faaiRKEaLB8JiKZwPuIZ0bPh07ukOfxahtRwkk6wOYd1hyOekZA_D7a9cbl4pbCg"

# Export environment variables for this session
export TURSO_DATABASE_URL="$TURSO_URL"
export TURSO_AUTH_TOKEN="$TURSO_TOKEN"
export DATABASE_URL="$TURSO_URL"

echo "✅ Environment variables set for this session"
echo ""

# Push schema to Turso
echo "📊 Pushing Prisma schema to Turso..."
npx prisma db push --accept-data-loss

if [ $? -eq 0 ]; then
    echo "✅ Schema pushed successfully!"
else
    echo "❌ Failed to push schema"
    exit 1
fi

echo ""

# Seed admin user
echo "👤 Seeding admin user..."
node scripts/seed-admin.js

if [ $? -eq 0 ]; then
    echo "✅ Admin user seeded successfully!"
else
    echo "❌ Failed to seed admin user"
    exit 1
fi

echo ""
echo "=============================="
echo "🎉 Setup Complete!"
echo "=============================="
echo ""
echo "Your Turso database is now ready with:"
echo "  ✅ Schema migrated"
echo "  ✅ Admin user created"
echo ""
echo "Admin Credentials:"
echo "  Email: admin@gmail.com"
echo "  Password: Inzeedo@123"
echo ""
echo "Next steps:"
echo "1. Add environment variables to Vercel (see vercel_setup_final.md)"
echo "2. Redeploy your application"
echo "3. Test login on Vercel"
