#!/bin/bash

# Generate Vercel Environment Variables
# This script outputs all the environment variables you need to add to Vercel

echo "🔐 Vercel Environment Variables Generator"
echo "=========================================="
echo ""
echo "This script will generate all the environment variables"
echo "you need to add to your Vercel project."
echo ""

# Check if turso is installed
if ! command -v turso &> /dev/null; then
    echo "❌ Turso CLI not found!"
    echo "Please install it first: curl -sSfL https://get.tur.so/install.sh | bash"
    exit 1
fi

# Check if logged in
if ! turso db list &> /dev/null; then
    echo "❌ Not logged in to Turso"
    echo "Please run: turso auth login"
    exit 1
fi

DB_NAME="classic-painters"

# Check if database exists
if ! turso db show $DB_NAME &> /dev/null; then
    echo "❌ Database '$DB_NAME' not found"
    echo ""
    echo "Would you like to create it now? (y/n)"
    read -r response
    if [[ "$response" == "y" ]]; then
        turso db create $DB_NAME
        echo "✅ Database created!"
    else
        echo "Please create the database first: turso db create $DB_NAME"
        exit 1
    fi
fi

echo "📊 Fetching database credentials..."
echo ""

# Get database URL
DB_URL=$(turso db show $DB_NAME --url)

# Create auth token
echo "🔑 Creating new auth token..."
AUTH_TOKEN=$(turso db tokens create $DB_NAME)

# Generate AUTH_SECRET
echo "🔐 Generating AUTH_SECRET..."
AUTH_SECRET=$(openssl rand -base64 32)

# Get Vercel URL (if available)
VERCEL_URL=""
if [ -f ".vercel/project.json" ]; then
    PROJECT_NAME=$(cat .vercel/project.json | grep -o '"name":"[^"]*' | cut -d'"' -f4)
    if [ ! -z "$PROJECT_NAME" ]; then
        VERCEL_URL="https://${PROJECT_NAME}.vercel.app"
    fi
fi

if [ -z "$VERCEL_URL" ]; then
    echo ""
    echo "⚠️  Could not auto-detect Vercel URL"
    echo "Please enter your Vercel deployment URL (e.g., https://your-app.vercel.app):"
    read -r VERCEL_URL
fi

echo ""
echo "=========================================="
echo "✅ Environment Variables Generated!"
echo "=========================================="
echo ""
echo "📋 Copy these to Vercel Dashboard:"
echo "   (Settings → Environment Variables)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1️⃣ DATABASE_URL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "$DB_URL"
echo ""
echo "Environments: ☑ Production ☑ Preview ☑ Development"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "2️⃣ TURSO_AUTH_TOKEN"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "$AUTH_TOKEN"
echo ""
echo "Environments: ☑ Production ☑ Preview ☑ Development"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "3️⃣ AUTH_SECRET"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "$AUTH_SECRET"
echo ""
echo "Environments: ☑ Production ☑ Preview ☑ Development"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "4️⃣ NEXTAUTH_URL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "$VERCEL_URL"
echo ""
echo "Environments: ☑ Production only"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "=========================================="
echo "📝 Next Steps:"
echo "=========================================="
echo ""
echo "1. Go to: https://vercel.com"
echo "2. Select your backend project"
echo "3. Go to: Settings → Environment Variables"
echo "4. Click 'Add New' for each variable above"
echo "5. Copy-paste the values exactly as shown"
echo "6. Click 'Save' after each one"
echo "7. Go to Deployments → Latest → Redeploy"
echo "8. Uncheck 'Use existing Build Cache'"
echo "9. Click 'Redeploy'"
echo ""
echo "=========================================="
echo "💾 Saving to file..."
echo "=========================================="
echo ""

# Save to file
OUTPUT_FILE="vercel-env-vars.txt"
cat > $OUTPUT_FILE << EOF
Vercel Environment Variables
Generated: $(date)

Add these to Vercel Dashboard (Settings → Environment Variables):

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. DATABASE_URL
   Value: $DB_URL
   Environments: Production, Preview, Development

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

2. TURSO_AUTH_TOKEN
   Value: $AUTH_TOKEN
   Environments: Production, Preview, Development

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

3. AUTH_SECRET
   Value: $AUTH_SECRET
   Environments: Production, Preview, Development

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

4. NEXTAUTH_URL
   Value: $VERCEL_URL
   Environments: Production only

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Admin Credentials:
Email: admin@gmail.com
Password: Inzeedo@123

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EOF

echo "✅ Saved to: $OUTPUT_FILE"
echo ""
echo "You can also view this file anytime:"
echo "   cat $OUTPUT_FILE"
echo ""
echo "🎉 Done! Now add these variables to Vercel and redeploy."
