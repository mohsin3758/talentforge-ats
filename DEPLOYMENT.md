# Deployment Guide — TalentForge ATS

Complete guide to deploy TalentForge ATS to production.

## Table of Contents

- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [Option 1: Vercel (Recommended)](#option-1-vercel-recommended)
- [Option 2: Self-Hosted (Docker)](#option-2-self-hosted-docker)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Post-Deployment Verification](#post-deployment-verification)
- [Troubleshooting](#troubleshooting)

## Pre-Deployment Checklist

Before deploying, verify:

```bash
# 1. All tests pass
bun run lint                    # 0 errors
bun run test:unit               # 148/148 pass
bun run test:reconcile          # 12/12 pass (requires dev server)
bun run test:count              # 25/25 pass (requires dev server)

# 2. Production build succeeds
bun run build                   # Should complete without errors

# 3. Database schema is current
bun run db:push

# 4. Seed data (optional, for demo)
bun scripts/seed-ats.ts         # 6 jobs, 30 candidates, 40 apps
bun scripts/seed-admin.ts       # Admin user for login

# 5. Environment variables are set
cp .env.example .env.production
# Edit .env.production with real values
```

## Option 1: Vercel (Recommended)

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: TalentForge ATS"
git branch -M main
git remote add origin https://github.com/<your-username>/talentforge-ats.git
git push -u origin main
```

### Step 2: Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your GitHub repository
4. Vercel auto-detects Next.js — keep the default settings

### Step 3: Configure Environment Variables

In the Vercel dashboard, add these environment variables:

| Variable | Value | Notes |
|----------|-------|-------|
| `DATABASE_URL` | `file:./prisma/prod.db` (SQLite) or PostgreSQL URL | See [Database Setup](#database-setup) |
| `NEXTAUTH_SECRET` | Generate with `openssl rand -base64 32` | **Required** for JWT signing |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` | Your Vercel URL (add after first deploy) |

### Step 4: Deploy

Click "Deploy". The first build takes ~3-5 minutes.

### Step 5: Update NEXTAUTH_URL

After the first deploy, update `NEXTAUTH_URL` in Vercel to match your deployment URL (e.g., `https://talentforge-ats.vercel.app`).

### Step 6: Seed Admin User

After deployment, run the admin seed script against your production database:

```bash
# For Vercel with PostgreSQL:
DATABASE_URL="your-production-postgres-url" \
NEXTAUTH_SECRET="your-secret" \
bun scripts/seed-admin.ts
```

Or use the Vercel CLI:
```bash
vercel env pull .env.production
bun scripts/seed-admin.ts
```

## Option 2: Self-Hosted (Docker)

### Dockerfile

Create `Dockerfile`:

```dockerfile
FROM oven/bun:1 AS base
WORKDIR /app

# Install dependencies
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

# Copy source
COPY . .

# Build
RUN bun run build

# Expose port
EXPOSE 3000

# Start
CMD ["bun", "run", "start"]
```

### Build and Run

```bash
# Build image
docker build -t talentforge-ats .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL="file:./prisma/prod.db" \
  -e NEXTAUTH_SECRET="your-secret" \
  -e NEXTAUTH_URL="http://localhost:3000" \
  talentforge-ats
```

## Environment Variables

### Required

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Database connection string | `file:./prisma/dev.db` (SQLite) or `postgresql://user:pass@host:5432/db` |
| `NEXTAUTH_SECRET` | Random string for JWT signing | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Your app's canonical URL | `https://your-app.vercel.app` |

### Optional

| Variable | Default | Description |
|----------|---------|-------------|
| `ADMIN_EMAIL` | `admin@talentforge.com` | Override default admin email in seed script |
| `ADMIN_PASSWORD` | `Admin123!` | Override default admin password (change in production!) |
| `ADMIN_NAME` | `Admin Recruiter` | Override default admin name |

## Database Setup

### SQLite (Development / Small Deployments)

Default. No setup needed — Prisma creates the file automatically.

```
DATABASE_URL="file:./prisma/dev.db"
```

**Limitation**: SQLite doesn't support concurrent writes well. Use PostgreSQL for production with multiple users.

### PostgreSQL (Production)

1. Update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

2. Set `DATABASE_URL`:
```
DATABASE_URL="postgresql://user:password@host:5432/talentforge?schema=public"
```

3. Push schema:
```bash
bun run db:push
```

### Managed PostgreSQL Providers

- **Vercel Postgres** — easiest for Vercel deployments
- **Supabase** — free tier, 500MB
- **Neon** — serverless Postgres, scales to zero
- **Railway** — simple, $5/mo starting

## Post-Deployment Verification

After deploying, verify:

### 1. App loads
Visit your deployment URL. The dashboard should render with seeded data.

### 2. Login works
- Visit `/login`
- Sign in with `admin@talentforge.com` / `Admin123!`
- Should redirect to dashboard
- Topbar should show "A Admin Recruiter" avatar

### 3. AI features work
- Go to AI Tools section
- Try the Resume Scorer (paste any resume text)
- Should return a 0-100 score within 30 seconds

### 4. Database persistence
- Create a new job
- Reload the page
- The job should still be there

### 5. Run smoke tests
```bash
# Against your production URL
BASE_URL="https://your-app.vercel.app" bun scripts/reconcile.ts
```

## Troubleshooting

### Build fails with `useSearchParams() should be wrapped in suspense`

The login page uses `useSearchParams()` which requires a Suspense boundary for static generation. This is already fixed in `src/app/login/page.tsx` — the `LoginForm` component is wrapped in `<Suspense>`.

### `NEXTAUTH_SECRET` error

Generate a secure secret:
```bash
openssl rand -base64 32
```
Add it to your environment variables.

### Database connection fails

- **SQLite**: Ensure the `prisma/` directory is writable
- **PostgreSQL**: Check your connection string format — must include `?schema=public`
- **Vercel**: Use Vercel Postgres or an external database (SQLite doesn't persist on serverless)

### AI features return 500

The AI features use `z-ai-web-dev-sdk` which requires the `ZAI_API_KEY` environment variable on Vercel. Check that it's set in your Vercel project settings.

### Login redirects loop

Ensure `NEXTAUTH_URL` matches your exact deployment URL (including `https://`).

### Prisma client stale in development

If you see `Cannot read properties of undefined (reading 'findUnique')` after schema changes:
```bash
rm -rf .next
bun run db:generate
bun run dev
```

## Production Security Checklist

- [ ] Change `ADMIN_PASSWORD` from default `Admin123!`
- [ ] Set a strong `NEXTAUTH_SECRET` (32+ characters)
- [ ] Use HTTPS (Vercel does this automatically)
- [ ] Set up rate limiting (Vercel has built-in DDoS protection)
- [ ] Enable database backups (if using external PostgreSQL)
- [ ] Review and remove demo seed data if not needed
- [ ] Set up error monitoring (Sentry, LogRocket, etc.)
- [ ] Configure CORS if using a separate frontend

## CI/CD

The GitHub Actions workflow (`.github/workflows/ci.yml`) runs on every push:
1. Lint + Unit Tests (~30s)
2. Reconciliation checks (~1min)
3. E2E tests (~10min)
4. Production build verification (~5min)

All must pass before merging to main. Vercel auto-deploys on merge to main.

## Support

- **Docs**: See `README.md` for full documentation
- **Tests**: See `tests/README.md` for testing guide
- **Issues**: File on GitHub
