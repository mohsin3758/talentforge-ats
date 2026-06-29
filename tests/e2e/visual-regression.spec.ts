import { test, expect, goToSection } from "./helpers";

/**
 * Visual Regression Tests
 *
 * Captures screenshots of each section and compares them against baseline
 * snapshots. Fails if any visual change is detected (layout break, color
 * change, missing element, etc.).
 *
 * First run generates baselines:
 *   bunx playwright test tests/e2e/visual-regression.spec.ts --update-snapshots
 *
 * Subsequent runs compare against baselines:
 *   bunx playwright test tests/e2e/visual-regression.spec.ts
 *
 * To update baselines after intentional changes:
 *   bunx playwright test tests/e2e/visual-regression.spec.ts --update-snapshots
 */

// Use a fixed viewport for consistent screenshots
test.use({ viewport: { width: 1440, height: 900 } });

test.describe("Visual Regression — Light Mode", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(3000); // Wait for hydration + initial data load

    // Ensure light mode (default)
    const htmlClass = await page.locator("html").getAttribute("class");
    if (htmlClass?.includes("dark")) {
      await page.getByRole("button", { name: "Toggle dark mode" }).click();
      await page.waitForTimeout(500);
    }

    // Clear any localStorage settings from previous tests
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(3000);
  });

  test("Dashboard section", async ({ page }) => {
    await goToSection(page, "dashboard");
    // Wait for charts to render
    await page.waitForTimeout(3000);
    // Wait for KPI cards to load
    await expect(page.getByText("Active Jobs")).toBeVisible();
    await expect(page.getByText("Hires This Month")).toBeVisible();

    await expect(page).toHaveScreenshot("dashboard-light.png", {
      fullPage: true,
      mask: [
        // Mask the AI Daily Brief card (content varies between runs)
        page.locator("text=AI Daily Brief").locator("xpath=ancestor::div[contains(@class, 'rounded-lg')]").first(),
      ],
      maxDiffPixelRatio: 0.01, // Allow 1% pixel difference (for anti-aliasing)
    });
  });

  test("Jobs section", async ({ page }) => {
    await goToSection(page, "jobs");
    await page.waitForTimeout(2000);
    await expect(page.getByText("New Job")).toBeVisible();

    await expect(page).toHaveScreenshot("jobs-light.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    });
  });

  test("Pipeline section", async ({ page }) => {
    await goToSection(page, "pipeline");
    await page.waitForTimeout(3000);
    // Wait for columns to render
    await expect(page.locator("[aria-label*='column with']")).toHaveCount(7, { timeout: 10_000 });

    await expect(page).toHaveScreenshot("pipeline-light.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    });
  });

  test("Candidates section", async ({ page }) => {
    await goToSection(page, "candidates");
    await page.waitForTimeout(2000);
    // Wait for table rows
    await expect(page.locator("tbody tr").first()).toBeVisible({ timeout: 10_000 });

    await expect(page).toHaveScreenshot("candidates-light.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    });
  });

  test("AI Tools section", async ({ page }) => {
    await goToSection(page, "ai-tools");
    await page.waitForTimeout(2000);
    await expect(page.getByText("What is Zero-Token AI?")).toBeVisible();

    await expect(page).toHaveScreenshot("ai-tools-light.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    });
  });

  test("Automations section", async ({ page }) => {
    await goToSection(page, "automations");
    await page.waitForTimeout(2000);
    await expect(page.getByText("Quick Templates")).toBeVisible();

    await expect(page).toHaveScreenshot("automations-light.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    });
  });

  test("Analytics section", async ({ page }) => {
    await goToSection(page, "analytics");
    await page.waitForTimeout(3000);
    await expect(page.getByText("Time to Hire")).toBeVisible();

    await expect(page).toHaveScreenshot("analytics-light.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    });
  });

  test("ATS Compare section", async ({ page }) => {
    await goToSection(page, "ats-compare");
    await page.waitForTimeout(2000);
    await expect(page.getByText("Feature Matrix")).toBeVisible();

    await expect(page).toHaveScreenshot("ats-compare-light.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    });
  });

  test("Settings section", async ({ page }) => {
    await goToSection(page, "settings");
    await page.waitForTimeout(2000);
    await expect(page.getByRole("tab", { name: "Company" })).toBeVisible();

    await expect(page).toHaveScreenshot("settings-light.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    });
  });
});

test.describe("Visual Regression — Dark Mode", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(2000);

    // Clear localStorage to ensure clean state
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(2000);

    // Switch to dark mode
    await page.getByRole("button", { name: "Toggle dark mode" }).click();
    await page.waitForTimeout(1000);
  });

  test("Dashboard in dark mode", async ({ page }) => {
    await goToSection(page, "dashboard");
    await page.waitForTimeout(3000);
    await expect(page.getByText("Active Jobs")).toBeVisible();

    await expect(page).toHaveScreenshot("dashboard-dark.png", {
      fullPage: true,
      mask: [
        page.locator("text=AI Daily Brief").locator("xpath=ancestor::div[contains(@class, 'rounded-lg')]").first(),
      ],
      maxDiffPixelRatio: 0.01,
    });
  });

  test("Pipeline in dark mode", async ({ page }) => {
    await goToSection(page, "pipeline");
    await page.waitForTimeout(3000);
    await expect(page.locator("[aria-label*='column with']")).toHaveCount(7, { timeout: 10_000 });

    await expect(page).toHaveScreenshot("pipeline-dark.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    });
  });

  test("Analytics in dark mode", async ({ page }) => {
    await goToSection(page, "analytics");
    await page.waitForTimeout(3000);
    await expect(page.getByText("Time to Hire")).toBeVisible();

    await expect(page).toHaveScreenshot("analytics-dark.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    });
  });
});

test.describe("Visual Regression — Mobile (375px)", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(3000);
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(3000);
  });

  test("Dashboard on mobile", async ({ page }) => {
    await goToSection(page, "dashboard");
    await page.waitForTimeout(3000);
    // On mobile, KPI labels may be abbreviated. Wait for the AI Daily Brief card instead.
    await expect(page.getByText("AI Daily Brief")).toBeVisible({ timeout: 10_000 });

    await expect(page).toHaveScreenshot("dashboard-mobile.png", {
      fullPage: true,
      mask: [
        page.locator("text=AI Daily Brief").locator("xpath=ancestor::div[contains(@class, 'rounded-lg')]").first(),
      ],
      maxDiffPixelRatio: 0.02, // Slightly more tolerance for mobile rendering
    });
  });

  test("Jobs on mobile", async ({ page }) => {
    await goToSection(page, "jobs");
    await page.waitForTimeout(2000);
    await expect(page.getByText("New Job")).toBeVisible();

    await expect(page).toHaveScreenshot("jobs-mobile.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.02,
    });
  });

  test("Pipeline on mobile", async ({ page }) => {
    await goToSection(page, "pipeline");
    await page.waitForTimeout(3000);

    await expect(page).toHaveScreenshot("pipeline-mobile.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.02,
    });
  });
});
