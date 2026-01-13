#!/bin/bash

# Turso Setup Script for Classic Painters Backend
# This script helps you set up Turso database for Vercel deployment

set -e  # Exit on error

echo "🎨 Classic Painters - Turso Database Setup"
echo "=========================================="
echo ""

# Check if turso CLI is installed
if ! command -v turso &> /dev/null; then
    echo "❌ Turso CLI not found!"
    echo "📦 Installing Turso CLI..."
    curl -sSfL https://get.tur.so/install.sh | bash
    echo "✅ Turso CLI installed!"
    echo ""
    echo "⚠️  Please restart your terminal and run this script again."
    exit 0
fi

echo "✅ Turso CLI found!"
echo ""

# Check if user is logged in
if ! turso db list &> /dev/null; then
    echo "🔐 Please login to Turso..."
    turso auth login
fi

echo "✅ Logged in to Turso!"
echo ""

# Create database
DB_NAME="classic-painters"
echo "📊 Creating database: $DB_NAME"

if turso db show $DB_NAME &> /dev/null; then
    echo "⚠️  Database '$DB_NAME' already exists!"
    read -p "Do you want to use the existing database? (y/n): " use_existing
    if [[ $use_existing != "y" ]]; then
        echo "❌ Aborted. Please use a different database name or delete the existing one."
        exit 1
    fi
else
    turso db create $DB_NAME
    echo "✅ Database created!"
fi

echo ""

# Get database URL
echo "🔗 Getting database URL..."
DB_URL=$(turso db show $DB_NAME --url)
echo "✅ Database URL: $DB_URL"
echo ""

# Create auth token
echo "🔑 Creating auth token..."
AUTH_TOKEN=$(turso db tokens create $DB_NAME)
echo "✅ Auth token created!"
echo ""

# Update .env file
ENV_FILE=".env"
echo "📝 Updating $ENV_FILE..."

# Backup existing .env
if [ -f "$ENV_FILE" ]; then
    cp "$ENV_FILE" "${ENV_FILE}.backup"
    echo "✅ Backed up existing .env to ${ENV_FILE}.backup"
fi

# Update or add DATABASE_URL and TURSO_AUTH_TOKEN
if grep -q "^DATABASE_URL=" "$ENV_FILE" 2>/dev/null; then
    # Update existing
    sed -i.bak "s|^DATABASE_URL=.*|DATABASE_URL=\"$DB_URL\"|" "$ENV_FILE"
else
    # Add new
    echo "" >> "$ENV_FILE"
    echo "# Turso Database" >> "$ENV_FILE"
    echo "DATABASE_URL=\"$DB_URL\"" >> "$ENV_FILE"
fi

if grep -q "^TURSO_AUTH_TOKEN=" "$ENV_FILE" 2>/dev/null; then
    sed -i.bak "s|^TURSO_AUTH_TOKEN=.*|TURSO_AUTH_TOKEN=\"$AUTH_TOKEN\"|" "$ENV_FILE"
else
    echo "TURSO_AUTH_TOKEN=\"$AUTH_TOKEN\"" >> "$ENV_FILE"
fi

echo "✅ Updated .env file!"
echo ""

# Push schema to Turso
echo "🚀 Pushing Prisma schema to Turso..."
npx prisma db push --accept-data-loss
echo "✅ Schema pushed!"
echo ""

# Seed admin user
echo "👤 Seeding admin user..."
node scripts/seed-admin.js
echo "✅ Admin user seeded!"
echo ""

# Generate AUTH_SECRET
echo "🔐 Generating AUTH_SECRET..."
AUTH_SECRET=$(openssl rand -base64 32)
echo "✅ Generated AUTH_SECRET: $AUTH_SECRET"
echo ""

# Display summary
echo "=========================================="
echo "🎉 Setup Complete!"
echo "=========================================="
echo ""
echo "📋 Add these to Vercel Environment Variables:"
echo ""
echo "DATABASE_URL=$DB_URL"
echo ""
echo "TURSO_AUTH_TOKEN=$AUTH_TOKEN"
echo ""
echo "AUTH_SECRET=$AUTH_SECRET"
echo ""
echo "NEXTAUTH_URL=https://your-vercel-app.vercel.app"
echo ""
echo "=========================================="
echo ""
echo "📝 Next Steps:"
echo "1. Go to Vercel → Settings → Environment Variables"
echo "2. Add the above variables (for all environments)"
echo "3. Update NEXTAUTH_URL with your actual Vercel URL"
echo "4. Redeploy your application"
echo ""
echo "🔍 Admin Credentials:"
echo "Email: admin@gmail.com"
echo "Password: Inzeedo@123"
echo ""
echo "✅ Done! Your database is ready for Vercel deployment."
