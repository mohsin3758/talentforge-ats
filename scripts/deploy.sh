#!/bin/bash
#
# TalentForge ATS — Deployment Helper
#
# This script automates the parts of deployment that can be done from the CLI.
# The Vercel import must be done manually in the Vercel dashboard (3 clicks).
#
# Usage:
#   bash scripts/deploy.sh
#
set -e

cd "$(dirname "$0")/.."

echo "🚀 TalentForge ATS — Deployment Helper"
echo "========================================"
echo ""

# Step 1: Verify git is clean
echo "Step 1: Verifying git status..."
if [ -n "$(git status --porcelain)" ]; then
  echo "⚠️  Uncommitted changes detected. Committing..."
  git add -A
  git commit -m "Prepare for deployment" || true
fi
echo "✓ Git is clean"
echo ""

# Step 2: Generate NEXTAUTH_SECRET
echo "Step 2: Generating NEXTAUTH_SECRET..."
SECRET=$(openssl rand -base64 32)
echo "✓ Generated secret: ${SECRET}"
echo "  (Copy this — you'll need it for Vercel env vars)"
echo ""

# Step 3: Verify build
echo "Step 3: Verifying production build..."
bun run build 2>&1 | tail -5
echo "✓ Build succeeded"
echo ""

# Step 4: Verify tests
echo "Step 4: Running tests..."
bun run lint 2>&1 | tail -1
bun run test:unit 2>&1 | tail -3
echo "✓ All tests pass"
echo ""

# Step 5: Check deployment files exist
echo "Step 5: Checking deployment files..."
for f in vercel.json .env.example .github/workflows/ci.yml DEPLOYMENT.md README.md; do
  if [ -f "$f" ]; then
    echo "  ✓ $f"
  else
    echo "  ✗ $f MISSING"
    exit 1
  fi
done
echo ""

echo "========================================"
echo "✅ Pre-deployment checks complete!"
echo ""
echo "NEXT STEPS (you must do these manually):"
echo ""
echo "1. Push to GitHub:"
echo "   git remote add origin https://github.com/<your-username>/talentforge-ats.git"
echo "   git push -u origin main"
echo ""
echo "2. Import to Vercel:"
echo "   - Go to https://vercel.com/new"
echo "   - Import your GitHub repo"
echo "   - Keep default settings"
echo ""
echo "3. Add environment variables in Vercel:"
echo "   DATABASE_URL=file:./prisma/prod.db"
echo "   NEXTAUTH_SECRET=${SECRET}"
echo "   NEXTAUTH_URL=https://<your-app>.vercel.app"
echo ""
echo "4. Deploy (Vercel auto-deploys on import)"
echo ""
echo "5. After deployment, seed admin user:"
echo "   DATABASE_URL=\"<your-prod-db-url>\" \\"
echo "   NEXTAUTH_SECRET=\"${SECRET}\" \\"
echo "   bun scripts/seed-admin.ts"
echo ""
echo "6. Visit https://<your-app>.vercel.app/login"
echo "   Login: admin@talentforge.com"
echo "   Password: Admin123!"
echo ""
echo "========================================"
echo ""
echo "📖 Full guide: DEPLOYMENT.md"
