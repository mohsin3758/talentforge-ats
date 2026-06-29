import { test, expect, goToSection, apiGet } from "./helpers";
import type { Analytics } from "@/lib/ats/types";

/**
 * Analytics tests — verifies all KPIs are computed from real DB data,
 * not hardcoded. This is the test that would have caught Bugs #1, #2, #3.
 */
test.describe("Analytics", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("Time-to-Hire KPI matches API (not hardcoded)", async ({ page, consoleErrors }) => {
    const analytics = await apiGet<Analytics>(page, "/api/ats/analytics");

    await goToSection(page, "analytics");

    const tthCard = page.locator("text=Time to Hire").locator("..");
    await expect(tthCard).toContainText(`${analytics.timeToHireAvgDays}d`);
  });

  test("Cost per Hire KPI matches API (not hardcoded $3,250)", async ({ page, consoleErrors }) => {
    const analytics = await apiGet<Analytics>(page, "/api/ats/analytics");

    await goToSection(page, "analytics");

    const cphCard = page.locator("text=Cost per Hire").locator("..");
    const expected = `$${analytics.costPerHire.toLocaleString()}`;
    await expect(cphCard).toContainText(expected);

    // Explicitly assert it's NOT the old hardcoded value (unless they happen to match)
    // This catches regressions where someone re-hardcodes it.
    if (analytics.costPerHire !== 3250) {
      await expect(cphCard).not.toContainText("$3,250");
    }
  });

  test("Offer Acceptance KPI matches API (not hardcoded 92%)", async ({ page, consoleErrors }) => {
    const analytics = await apiGet<Analytics>(page, "/api/ats/analytics");

    await goToSection(page, "analytics");

    const oaCard = page.locator("text=Offer Acceptance").locator("..");
    await expect(oaCard).toContainText(`${analytics.offerAcceptanceRate}%`);

    if (analytics.offerAcceptanceRate !== 92) {
      await expect(oaCard).not.toContainText("92%");
    }
  });

  test("Quality of Hire KPI matches API (not hardcoded 4.3/5)", async ({ page, consoleErrors }) => {
    const analytics = await apiGet<Analytics>(page, "/api/ats/analytics");

    await goToSection(page, "analytics");

    const qohCard = page.locator("text=Quality of Hire").locator("..");
    await expect(qohCard).toContainText(`${analytics.qualityOfHire.toFixed(1)}/5`);
  });

  test("charts are stable across reload (no Math.random)", async ({ page, consoleErrors }) => {
    test.setTimeout(120_000); // 2 minutes — reload is slow in dev
    await goToSection(page, "analytics");

    // Wait for the Applications Over Time chart SVG to load
    const chartContainer = page.locator("text=Applications Over Time").locator("..");
    await expect(chartContainer.locator("svg").first()).toBeVisible({ timeout: 30_000 });
    const svg1 = await chartContainer.locator("svg").first().innerHTML();

    // Reload
    await page.reload();
    await page.waitForLoadState("networkidle");
    await goToSection(page, "analytics");

    // Wait for chart to load again
    await expect(chartContainer.locator("svg").first()).toBeVisible({ timeout: 30_000 });
    const svg2 = await chartContainer.locator("svg").first().innerHTML();

    // The chart should be identical — no Math.random drift
    expect(svg2).toBe(svg1);
  });

  test("recruiter performance table shows real hiring managers from DB", async ({ page, consoleErrors }) => {
    const analytics = await apiGet<Analytics>(page, "/api/ats/analytics");

    await goToSection(page, "analytics");

    // The recruiter table is at the bottom. Hiring managers come from job.hiringManager.
    // We don't know exact names without fetching jobs, but we can verify the table
    // has rows and at least one hiring manager from the jobs API appears.
    const jobs = await apiGet<Array<{ hiringManager: string }>>(page, "/api/ats/jobs");
    const hiringManagers = new Set(jobs.map((j) => j.hiringManager));

    // Find the recruiter performance table — it's the last table on the page
    const tables = page.locator("table");
    const lastTable = tables.last();
    await expect(lastTable).toBeVisible();

    // At least one hiring manager from the jobs API should appear in the table
    let found = false;
    for (const hm of hiringManagers) {
      const cellCount = await lastTable.getByText(hm, { exact: false }).count();
      if (cellCount > 0) {
        found = true;
        break;
      }
    }
    expect(found, "At least one real hiring manager should appear in the recruiter table").toBe(true);
  });
});
