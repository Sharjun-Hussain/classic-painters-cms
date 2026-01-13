#!/bin/bash

# Vercel Login Diagnostic Script
# This script helps diagnose why login is failing on Vercel

echo "🔍 Vercel Login Diagnostic Tool"
echo "================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check 1: Turso database connectivity
echo "1️⃣ Checking Turso Database Connection..."
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ DATABASE_URL not set in .env${NC}"
    echo "   Add: DATABASE_URL=\"libsql://your-database-url\""
else
    echo -e "${GREEN}✅ DATABASE_URL is set${NC}"
    echo "   Value: $DATABASE_URL"
    
    if [[ $DATABASE_URL == libsql://* ]]; then
        echo -e "${GREEN}✅ Using Turso (libsql://)${NC}"
    elif [[ $DATABASE_URL == file:* ]]; then
        echo -e "${YELLOW}⚠️  Using local SQLite (won't work on Vercel!)${NC}"
    fi
fi
echo ""

# Check 2: Turso auth token
echo "2️⃣ Checking Turso Auth Token..."
if [ -z "$TURSO_AUTH_TOKEN" ]; then
    echo -e "${RED}❌ TURSO_AUTH_TOKEN not set${NC}"
    echo "   This is required for Turso database access"
else
    echo -e "${GREEN}✅ TURSO_AUTH_TOKEN is set${NC}"
    echo "   Length: ${#TURSO_AUTH_TOKEN} characters"
fi
echo ""

# Check 3: AUTH_SECRET
echo "3️⃣ Checking AUTH_SECRET..."
if [ -z "$AUTH_SECRET" ]; then
    echo -e "${RED}❌ AUTH_SECRET not set${NC}"
    echo "   Generate one with: openssl rand -base64 32"
else
    echo -e "${GREEN}✅ AUTH_SECRET is set${NC}"
    echo "   Length: ${#AUTH_SECRET} characters"
    if [ ${#AUTH_SECRET} -lt 32 ]; then
        echo -e "${YELLOW}⚠️  AUTH_SECRET is too short (should be 32+ chars)${NC}"
    fi
fi
echo ""

# Check 4: NEXTAUTH_URL
echo "4️⃣ Checking NEXTAUTH_URL..."
if [ -z "$NEXTAUTH_URL" ]; then
    echo -e "${YELLOW}⚠️  NEXTAUTH_URL not set${NC}"
    echo "   NextAuth will try to auto-detect, but it's better to set it explicitly"
else
    echo -e "${GREEN}✅ NEXTAUTH_URL is set${NC}"
    echo "   Value: $NEXTAUTH_URL"
fi
echo ""

# Check 5: Database connection test
echo "5️⃣ Testing Database Connection..."
if command -v turso &> /dev/null && [[ $DATABASE_URL == libsql://* ]]; then
    DB_NAME=$(echo $DATABASE_URL | sed 's/libsql:\/\/\([^.]*\).*/\1/')
    echo "   Database name: $DB_NAME"
    
    if turso db shell $DB_NAME "SELECT COUNT(*) as user_count FROM User;" 2>/dev/null; then
        echo -e "${GREEN}✅ Database connection successful${NC}"
    else
        echo -e "${RED}❌ Cannot connect to database${NC}"
        echo "   Make sure TURSO_AUTH_TOKEN is correct"
    fi
else
    echo -e "${YELLOW}⚠️  Skipping (Turso CLI not installed or not using Turso)${NC}"
fi
echo ""

# Check 6: Admin user exists
echo "6️⃣ Checking Admin User..."
if command -v turso &> /dev/null && [[ $DATABASE_URL == libsql://* ]]; then
    DB_NAME=$(echo $DATABASE_URL | sed 's/libsql:\/\/\([^.]*\).*/\1/')
    
    USER_COUNT=$(turso db shell $DB_NAME "SELECT COUNT(*) FROM User;" 2>/dev/null | tail -1)
    if [ "$USER_COUNT" -gt 0 ]; then
        echo -e "${GREEN}✅ Found $USER_COUNT user(s) in database${NC}"
        
        # Show admin users
        echo "   Admin users:"
        turso db shell $DB_NAME "SELECT email, isSuperAdmin FROM User;" 2>/dev/null | tail -n +2
    else
        echo -e "${RED}❌ No users found in database${NC}"
        echo "   Run: node scripts/seed-admin.js"
    fi
else
    echo -e "${YELLOW}⚠️  Skipping (Turso CLI not installed or not using Turso)${NC}"
fi
echo ""

# Check 7: Prisma Client
echo "7️⃣ Checking Prisma Client..."
if [ -d "node_modules/@prisma/client" ]; then
    echo -e "${GREEN}✅ Prisma Client is installed${NC}"
else
    echo -e "${RED}❌ Prisma Client not found${NC}"
    echo "   Run: npx prisma generate"
fi
echo ""

# Check 8: Required packages
echo "8️⃣ Checking Required Packages..."
PACKAGES=("@libsql/client" "@prisma/adapter-libsql" "next-auth" "bcryptjs")
for pkg in "${PACKAGES[@]}"; do
    if [ -d "node_modules/$pkg" ]; then
        echo -e "${GREEN}✅ $pkg installed${NC}"
    else
        echo -e "${RED}❌ $pkg not installed${NC}"
    fi
done
echo ""

# Summary
echo "================================"
echo "📋 Summary"
echo "================================"
echo ""

ISSUES=0

if [ -z "$DATABASE_URL" ] || [[ $DATABASE_URL == file:* ]]; then
    echo -e "${RED}❌ Database not configured for Vercel${NC}"
    ISSUES=$((ISSUES+1))
fi

if [ -z "$TURSO_AUTH_TOKEN" ]; then
    echo -e "${RED}❌ Turso auth token missing${NC}"
    ISSUES=$((ISSUES+1))
fi

if [ -z "$AUTH_SECRET" ]; then
    echo -e "${RED}❌ AUTH_SECRET missing${NC}"
    ISSUES=$((ISSUES+1))
fi

if [ $ISSUES -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed!${NC}"
    echo ""
    echo "If login still fails on Vercel:"
    echo "1. Check Vercel function logs for errors"
    echo "2. Verify environment variables are set in Vercel dashboard"
    echo "3. Make sure you redeployed after adding env vars"
else
    echo -e "${RED}Found $ISSUES issue(s) that need to be fixed${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Fix the issues above"
    echo "2. Run ./setup-turso.sh if you haven't already"
    echo "3. Add environment variables to Vercel"
    echo "4. Redeploy"
fi

echo ""
echo "================================"
echo "🔗 Useful Commands"
echo "================================"
echo ""
echo "# Test database connection:"
echo "turso db shell classic-painters"
echo ""
echo "# Check users in database:"
echo "turso db shell classic-painters \"SELECT * FROM User;\""
echo ""
echo "# Seed admin user:"
echo "node scripts/seed-admin.js"
echo ""
echo "# Generate new AUTH_SECRET:"
echo "openssl rand -base64 32"
echo ""
echo "# Check Vercel logs:"
echo "vercel logs [deployment-url]"
