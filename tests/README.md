# TalentForge ATS — Test Suite

This project includes two types of automated tests that catch the bugs found during QA:

## 1. Reconciliation Script (`scripts/reconcile.ts`)

**What it does**: Compares UI values against API truth — catches "hardcoded values pretending to be real data" bugs.

**Run it**:
```bash
bun scripts/reconcile.ts
```

**What it checks** (12 checks):
- Dashboard KPIs match `/api/ats/analytics` (Active Jobs, Open Applications, Hires This Month)
- Analytics KPIs match API (Cost per Hire, Offer Acceptance, Quality of Hire — NOT hardcoded)
- Pipeline column counts match `byStageRecord`
- TOP_100_ATS array has exactly 100 items (no duplicates)
- No `Math.random()` in app source code (catches non-deterministic renders)
- Data integrity (6 jobs, 30 candidates, 40 applications)

## 2. Playwright E2E Tests (`tests/e2e/`)

**What they do**: Full browser automation tests that exercise every feature.

### Run all tests
```bash
bunx playwright test
```

### Run a specific test file
```bash
bunx playwright test tests/e2e/dashboard.spec.ts
```

### Run with UI mode (interactive)
```bash
bunx playwright test --ui
```

### Run with HTML report
```bash
bunx playwright test --reporter=html
# Then open playwright-report/index.html
```

### Test files (9 files, 54 tests)

| File | Tests | What it covers |
|------|-------|----------------|
| `dashboard.spec.ts` | 4 | KPI cards match API, Top Performers, AI Brief, charts |
| `analytics.spec.ts` | 6 | All 4 KPIs match API (catches hardcoded values), chart stability across reload (catches Math.random), real recruiter data |
| `ats-compare.spec.ts` | 4 | TOP_100_ATS count = 100, feature matrix, parity radar, Zero-Token callout |
| `jobs.spec.ts` | 4 | Status tab counts match DB, Edit pre-fills, Edit persists, Generate JD |
| `pipeline.spec.ts` | 3 | Column counts match API, stage move persists + history, card click opens dialog |
| `candidates.spec.ts` | 6 | Row count = DB, search accuracy, source filter, min score filter, empty state, validation |
| `candidate-dialog.spec.ts` | 3 | All 5 tabs work, Notes persist to DB, stage change persists |
| `ai-tools.spec.ts` | 5 | All 5 cards visible, Zero-Token explainer, gibberish handling, JD generation, button validation |
| `automations.spec.ts` | 5 | Trigger→action flow, templates, invalid JSON error, switch toggle, valid JSON creates |
| `settings.spec.ts` | 7 | All 5 tabs, Company save, Stage add/remove, Integrations toggle, AI save, Notifications persist |
| `cross-cutting.spec.ts` | 7 | No console errors on any section, reload stability, footer, dark mode, mobile, sidebar, Topbar dropdown |

## Bugs These Tests Would Have Caught

| Bug | Test that catches it |
|-----|---------------------|
| Hardcoded Analytics KPIs ($3,250 / 92% / 4.3/5) | `analytics.spec.ts` — "Cost per Hire matches API", "Offer Acceptance matches API", "Quality of Hire matches API" |
| Math.random in charts (values change on reload) | `analytics.spec.ts` — "charts are stable across reload" + `reconcile.ts` — "No Math.random in source" |
| Hardcoded department/recruiter data | `analytics.spec.ts` — "recruiter performance table shows real hiring managers from DB" |
| TOP_100_ATS has 105 items | `ats-compare.spec.ts` + `reconcile.ts` — "TOP_100_ATS count = 100" |
| Raw JSON.parse error in Automations | `automations.spec.ts` — "invalid JSON in trigger config shows helpful error" |

## CI Integration

To run tests in CI, add to your GitHub Actions workflow:

```yaml
- name: Run reconciliation
  run: bun scripts/reconcile.ts

- name: Run E2E tests
  run: bunx playwright test

- name: Upload test report
  if: always()
  uses: actions/upload-artifact@v4
  with:
    name: playwright-report
    path: playwright-report/
```

## Notes

- Tests run single-worker (`workers: 1`) because the app uses SQLite (shared DB).
- AI tests have 2-minute timeouts because AI calls can take 60s+.
- Console errors from AI rate-limiting (429/500) are ignored — they're environmental, not code bugs.
- The reconciliation script is fast (~30s) and should run on every commit.
- E2E tests are slower (~10 min total) and should run on PRs.
