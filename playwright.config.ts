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
  expect: { timeout: 10_000 },
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    // Collect console errors during every test
    viewport: { width: 1440, height: 900 },
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
