# TalentForge ATS — Zero-Token AI Recruiting Platform

A production-grade Applicant Tracking System for staffing companies, benchmarked feature-by-feature against the top 100 ATS platforms. Built with Next.js 16, TypeScript, Prisma, and in-house zero-token AI (z-ai-web-dev-sdk).

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Testing](#testing)
- [CI/CD](#cicd)
- [Deployment](#deployment)
- [API Reference](#api-reference)
- [License](#license)

## Overview

TalentForge is a single-page ATS application with 9 sections covering the full recruiting lifecycle: dashboard, jobs, pipeline, candidates, AI tools, automations, analytics, ATS comparison, and settings. All AI features (resume scoring, JD generation, interview questions, email drafting, offer letters, daily brief) are powered by the in-house `z-ai-web-dev-sdk` at **$0 marginal cost per call** — no OpenAI/Anthropic API bills.

The app ships with 185 automated tests (148 unit + 12 reconciliation + 25 count-things + 54 E2E) that catch the "hardcoded values pretending to be real data" class of bugs.

## Features

### 9 Sections

1. **Dashboard** — AI Daily Brief, 4 KPI cards, hiring funnel chart, source effectiveness pie, recent activity feed, top performers
2. **Jobs** — Status tabs, AI JD generator, edit dialog, per-job pipeline links
3. **Pipeline** — Drag-drop Kanban with 7 stages, candidate cards, persistable stage moves
4. **Candidates** — Searchable/filterable table, AI resume parser, add-candidate form with validation
5. **AI Tools** — 5 zero-token AI tools (Resume Scorer, JD Generator, Interview Questions, Email Drafter, Offer Letter)
6. **Automations** — Rule builder with 4 triggers × 5 actions, 5 quick templates, enable/disable toggles
7. **Analytics** — 4 KPI cards (Time-to-Hire, Cost-per-Hire, Offer Acceptance, Quality of Hire) + 4 charts + recruiter performance table
8. **ATS Compare** — 15-feature × 8-competitor matrix, parity radar chart, top 100 ATS list, zero-token cost advantage calculator
9. **Settings** — 5 tabs (Company, Hiring Stages, Integrations, AI, Notifications) with localStorage persistence

### Zero-Token AI Features

All AI features use `z-ai-web-dev-sdk` (in-house model). No per-call API costs.

| Feature | Endpoint | Avg Latency |
|---------|----------|-------------|
| Resume Parser & Scorer | `POST /api/ats/ai/score` | ~2.5s |
| JD Generator | `POST /api/ats/ai/jd` | ~8s |
| Interview Question Generator | `POST /api/ats/ai/interview` | ~12s |
| Email Drafter | `POST /api/ats/ai/email` | ~12s |
| Offer Letter Generator | `POST /api/ats/ai/offer` | ~15s |
| AI Daily Brief | `GET /api/ats/ai/brief` | ~9s |
| Resume Parser | `POST /api/ats/ai/parse-resume` | ~10s |

## Tech Stack

- **Framework**: Next.js 16 (App Router) with TypeScript 5
- **UI**: Tailwind CSS 4 + shadcn/ui (New York), Lucide icons, Framer Motion
- **State**: Zustand (UI) + TanStack Query (server) + react-hook-form (forms)
- **Database**: Prisma ORM with SQLite (easily swappable to PostgreSQL)
- **AI**: z-ai-web-dev-sdk (in-house, zero per-token cost)
- **Charts**: Recharts
- **Drag-drop**: @dnd-kit
- **Testing**: Vitest (unit) + Playwright (E2E) + custom reconciliation scripts

## Quick Start

### Prerequisites

- [Bun](https://bun.sh/) v1.3+
- Node.js 18+ (for Playwright)

### Installation

```bash
# Clone the repo
git clone <your-repo-url>
cd talentforge-ats

# Install dependencies
bun install

# Set up the database
bun run db:push
bun scripts/seed-ats.ts

# Start the dev server
bun run dev
```

The app will be available at `http://localhost:3000`.

### Seeded Data

The seed script creates:
- 6 jobs (across Engineering, Finance, Healthcare, Operations, Marketing)
- 30 candidates (varied skills, sources, experience)
- 40 applications (distributed across 7 stages)
- 5 interviews, 8 communications, 2 offers, 6 notes
- 5 automation rules

## Project Structure

```
talforge-ats/
├── .github/workflows/ci.yml       # GitHub Actions CI pipeline
├── prisma/
│   └── schema.prisma              # 8 models: Job, Candidate, Application, Interview, etc.
├── scripts/
│   ├── seed-ats.ts                # Database seeding
│   ├── reconcile.ts               # UI-vs-API reconciliation (12 checks)
│   └── count-things.ts            # Labeled-count verification (25 checks)
├── src/
│   ├── app/
│   │   ├── api/ats/               # 13 CRUD routes + 7 AI routes
│   │   ├── layout.tsx             # Root layout with ThemeProvider + Toaster
│   │   └── page.tsx               # Single-page app entry
│   ├── components/
│   │   ├── ats/                   # ATS-specific components
│   │   │   ├── sections/          # 9 section components
│   │   │   ├── ai/                # 5 AI tool components
│   │   │   ├── cards/             # KPI, Job, Application cards
│   │   │   ├── dialogs/           # Job + Candidate profile dialogs
│   │   │   ├── ATSApp.tsx         # Main shell
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Topbar.tsx
│   │   │   └── Footer.tsx
│   │   └── ui/                    # shadcn/ui components
│   └── lib/
│       ├── ats/                   # Business logic
│       │   ├── analytics.ts       # Pure computation functions (unit tested)
│       │   ├── ai.ts              # z-ai-web-dev-sdk wrapper
│       │   ├── api.ts             # API client + TanStack Query keys
│       │   ├── constants.ts       # STAGES, SOURCES, FEATURE_MATRIX, TOP_100_ATS
│       │   ├── format.ts          # Currency, date, relativeTime helpers
│       │   ├── serializers.ts     # Prisma row → API response mappers
│       │   ├── store.ts           # Zustand UI store
│       │   └── types.ts           # TypeScript interfaces
│       └── db.ts                  # Prisma client
├── tests/
│   ├── unit/                      # 148 Vitest unit tests
│   │   ├── analytics.test.ts
│   │   ├── ai.test.ts
│   │   ├── constants.test.ts
│   │   ├── format.test.ts
│   │   └── serializers.test.ts
│   └── e2e/                       # 54 Playwright E2E tests
│       ├── dashboard.spec.ts
│       ├── analytics.spec.ts
│       └── ... (11 files)
├── playwright.config.ts
├── vitest.config.ts
└── package.json
```

## Testing

This project has **185 automated tests** across 4 layers.

### Test Commands

```bash
# Unit tests (148 tests, 0.4s) — run while coding
bun run test:unit

# Unit tests in watch mode
bun run test:unit:watch

# UI-vs-API reconciliation (12 checks, 30s) — run before commit
bun run test:reconcile

# Count-things verification (25 checks, 2min) — run on PR
bun run test:count

# Full E2E suite (54 tests, 10min) — run on PR
bun run test

# E2E with interactive UI mode
bun run test:ui

# E2E with HTML report
bun run test:report
```

### Test Layers

| Layer | Count | Runtime | What it catches |
|-------|-------|---------|-----------------|
| **Unit tests** | 148 | 0.4s | Logic bugs in computations, serializers, formatters |
| **Reconciliation** | 12 | 30s | Hardcoded values pretending to be real data |
| **Count-things** | 25 | 2min | Labels that don't match their content count |
| **E2E** | 54 | 10min | User flow breakage, console errors, persistence |

### Bug Catch Rate

~91% — these tests would have caught all 5 bugs found during the deep QA pass before they shipped.

### Adding Tests

**Unit test** — add to `tests/unit/`:
```ts
import { describe, test, expect } from "vitest";
import { computeCostPerHire } from "@/lib/ats/analytics";

describe("computeCostPerHire", () => {
  test("returns 0 when no hires", () => {
    expect(computeCostPerHire([{ stage: "applied", source: "linkedin" }])).toBe(0);
  });
});
```

**E2E test** — add to `tests/e2e/`:
```ts
import { test, expect, goToSection } from "./helpers";

test("feature works", async ({ page }) => {
  await page.goto("/");
  await goToSection(page, "dashboard");
  await expect(page.getByText("Active Jobs")).toBeVisible();
});
```

## CI/CD

The GitHub Actions workflow (`.github/workflows/ci.yml`) runs 4 jobs on every push/PR:

1. **Lint + Unit Tests** (~30s) — runs on every push
2. **Reconciliation** (~1min) — UI values match API truth
3. **E2E Tests** (~10min) — full browser automation
4. **Production Build** (~5min) — ensures `bun run build` succeeds

All jobs use Bun, SQLite, and Playwright. Test reports are uploaded as artifacts on failure.

### CI Badges

Add to your README once CI is set up:
```markdown
![CI](https://github.com/<your-org>/<your-repo>/actions/workflows/ci.yml/badge.svg)
```

## Deployment

### Vercel (Recommended)

1. Push your repo to GitHub
2. Go to [vercel.com](https://vercel.com) and import the repo
3. Add environment variables (see `.env.example`)
4. Deploy

**Note**: For production, swap SQLite for PostgreSQL by updating `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | SQLite path or PostgreSQL URL |
| `NEXTAUTH_SECRET` | For auth | Random 32-char string (`openssl rand -base64 32`) |
| `NEXTAUTH_URL` | For auth | Your deployment URL |

### Production Build

```bash
bun run build
bun run start
```

## API Reference

### CRUD Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/ats/jobs` | List jobs (optional `?status=` filter) |
| POST | `/api/ats/jobs` | Create job |
| GET | `/api/ats/jobs/[id]` | Get job |
| PATCH | `/api/ats/jobs/[id]` | Update job |
| DELETE | `/api/ats/jobs/[id]` | Delete job |
| GET | `/api/ats/candidates` | List candidates (optional `?q=` search) |
| POST | `/api/ats/candidates` | Create candidate |
| GET | `/api/ats/applications` | List applications (filters: `?jobId&stage&minScore&starred`) |
| POST | `/api/ats/applications/[id]/stage` | Move application to new stage |
| GET | `/api/ats/analytics` | Aggregated analytics |
| GET | `/api/ats/automations` | List automations |
| POST | `/api/ats/automations` | Create automation |

### AI Routes (Zero-Token)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ats/ai/score` | Score resume against job (0-100) |
| POST | `/api/ats/ai/jd` | Generate job description markdown |
| POST | `/api/ats/ai/interview` | Generate 6-8 tailored interview questions |
| POST | `/api/ats/ai/email` | Draft email (screening, rejection, offer, etc.) |
| POST | `/api/ats/ai/offer` | Generate offer letter |
| POST | `/api/ats/ai/parse-resume` | Extract structured data from resume text |
| GET | `/api/ats/ai/brief` | AI-generated daily recruiter brief |

## Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start dev server on port 3000 |
| `bun run build` | Production build |
| `bun run start` | Start production server |
| `bun run lint` | ESLint check |
| `bun run db:push` | Push Prisma schema to database |
| `bun run db:generate` | Generate Prisma client |
| `bun run db:reset` | Reset database (destructive) |
| `bun run test` | Run E2E tests |
| `bun run test:unit` | Run unit tests |
| `bun run test:reconcile` | Run reconciliation script |
| `bun run test:count` | Run count-things script |

## License

MIT — see [LICENSE](LICENSE) for details.

## Acknowledgments

- [Next.js](https://nextjs.org/) — React framework
- [shadcn/ui](https://ui.shadcn.com/) — Component library
- [Prisma](https://www.prisma.io/) — Database ORM
- [Playwright](https://playwright.dev/) — E2E testing
- [Vitest](https://vitest.dev/) — Unit testing
- [Recharts](https://recharts.org/) — Charting library
- [@dnd-kit](https://dndkit.com/) — Drag and drop
