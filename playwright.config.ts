import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright configuration for TalentForge ATS
 *
 * Run tests:
 *   bunx playwright test              # headless
 *   bunx playwright test --headed     # show browser
 *   bunx playwright test --ui         # interactive UI mode
 *   bunx playwright test --reporter=html  # HTML report
 *
 * Run a single file:
 *   bunx playwright tests/e2e/dashboard.spec.ts
 *
 * Generate/update visual regression baselines:
 *   bunx playwright test tests/e2e/visual-regression.spec.ts --update-snapshots
 *
 * Run reconciliation script separately:
 *   bun scripts/reconcile.ts
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false, // ATS uses shared SQLite — avoid concurrent writes
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1, // single worker — shared DB
  reporter: process.env.CI ? "github" : [["list"], ["html", { open: "never" }]],
  timeout: 60_000,
  // Snapshot storage for visual regression tests
  snapshotPathTemplate: "{snapshotDir}/{testFileDir}/{testName}-{projectName}-{arg}{ext}",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    viewport: { width: 1440, height: 900 },
    expect: {
      timeout: 10_000,
      toHaveScreenshot: {
        maxDiffPixelRatio: 0.01,
        animations: "disabled",
      },
    },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  // We don't auto-start the web server because it's already running via `bun run dev`
  // in this sandbox. If you want auto-start, uncomment the webServer block below.
  // webServer: {
  //   command: "bun run dev",
  //   url: "http://localhost:3000",
  //   reuseExistingServer: true,
  //   timeout: 60_000,
  // },
});
