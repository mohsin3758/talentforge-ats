#!/bin/bash
#
# TalentForge ATS — VPS Deploy Script
#
# Run this on the VPS after setup-vps.sh:
#   cd /var/www/talentforge-ats && bash scripts/deploy-vps.sh
#
set -e

APP_DIR="/var/www/talentforge-ats"
cd "$APP_DIR"

echo "🚀 TalentForge ATS — Deploying"
echo "================================"

if [ ! -f .env.production ]; then
  echo "❌ .env.production not found. Create it first:"
  echo "   cp .env.production.example .env.production"
  echo "   nano .env.production"
  exit 1
fi

export $(grep -v '^#' .env.production | xargs)

echo ""
echo "=== Step 1: Install Dependencies ==="
bun install --frozen-lockfile
echo "✓ Dependencies installed"

echo ""
echo "=== Step 2: Generate Prisma Client ==="
bun run db:generate
echo "✓ Prisma client generated"

echo ""
echo "=== Step 3: Push Database Schema ==="
bun run db:push
echo "✓ Database schema pushed"

echo ""
echo "=== Step 4: Seed Database (if empty) ==="
USER_COUNT=$(bun -e "import {db} from './src/lib/db'; const c = await db.user.count(); console.log(c)" 2>/dev/null || echo "0")
if [ "$USER_COUNT" = "0" ]; then
  echo "Seeding database..."
  bun scripts/seed-ats.ts
  bun scripts/seed-admin.ts
  echo "✓ Database seeded"
else
  echo "✓ Database already has data ($USER_COUNT users), skipping seed"
fi

echo ""
echo "=== Step 5: Build Production App ==="
bun run build
echo "✓ Build complete"

echo ""
echo "=== Step 6: Start with PM2 ==="
pm2 delete talentforge-ats 2>/dev/null || true
pm2 start bun --name talentforge-ats -- run start
pm2 save
echo "✓ App started with PM2"

echo ""
echo "=== Step 7: Verify ==="
sleep 3
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
if [ "$STATUS" = "200" ]; then
  echo "✓ App is running on port 3000"
else
  echo "⚠️  App returned status $STATUS — check PM2 logs: pm2 logs talentforge-ats"
fi

echo ""
echo "================================"
echo "✅ Deployment Complete!"
echo ""
echo "   Login:   https://your-domain.com/login"
echo "   Email:   admin@talentforge.com"
echo "   Pass:    Admin123!"
echo ""
echo "   PM2 logs:     pm2 logs talentforge-ats"
echo "   PM2 restart:  pm2 restart talentforge-ats"
echo "================================"
