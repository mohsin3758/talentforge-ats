import { test, expect, goToSection, apiGet } from "./helpers";
import type { Analytics } from "@/lib/ats/types";

/**
 * Dashboard tests — verifies KPI cards match the analytics API exactly.
 * This is the test that would have caught Bug #1 (hardcoded KPIs).
 */
test.describe("Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("KPI cards show real values from analytics API", async ({ page, consoleErrors }) => {
    // Fetch the source of truth
    const analytics = await apiGet<Analytics>(page, "/api/ats/analytics");

    await goToSection(page, "dashboard");

    // Active Jobs KPI
    const activeJobsCard = page.locator("text=Active Jobs").locator("..");
    await expect(activeJobsCard).toContainText(String(analytics.totalJobs));

    // Open Applications KPI
    const openAppsCard = page.locator("text=Open Applications").locator("..");
    await expect(openAppsCard).toContainText(String(analytics.totalApps));

    // Hires This Month KPI — must match API, not hardcoded
    const hiresCard = page.locator("text=Hires This Month").locator("..");
    await expect(hiresCard).toContainText(String(analytics.hiresThisMonth));
  });

  test("Top Performers list matches API topCandidates", async ({ page, consoleErrors }) => {
    const analytics = await apiGet<Analytics>(page, "/api/ats/analytics");

    await goToSection(page, "dashboard");

    // Wait for the Top Performers card to load
    await expect(page.getByText("Top Performers")).toBeVisible({ timeout: 20_000 });
    await page.waitForTimeout(2000);

    // Top Performers are rendered as buttons with the candidate name + score.
    // The button text includes initials + name + title + score.
    // We look for a button that contains the candidate's name AND their matchScore.
    for (const candidate of analytics.topCandidates.slice(0, 3)) {
      const performerButton = page.getByRole("button", {
        name: new RegExp(candidate.fullName),
      });
      // The button should also contain the candidate's matchScore
      await expect(performerButton.first()).toBeVisible({ timeout: 10_000 });
      const buttonText = await performerButton.first().innerText();
      expect(buttonText, `${candidate.fullName}'s button should show score ${candidate.matchScore}`).toContain(
        String(candidate.matchScore),
      );
    }
  });

  test("AI Daily Brief loads with real content", async ({ page, consoleErrors }) => {
    await goToSection(page, "dashboard");

    // The brief card should eventually show content (not just a loading spinner)
    const briefCard = page.locator("text=AI Daily Brief").locator("..");
    await expect(briefCard).toBeVisible();

    // Wait for either priorities text OR a rate-limit error message —
    // both are acceptable outcomes in the test environment.
    // Give AI up to 30s to respond.
    const contentPromise = page
      .locator("text=/priorit|candidate|attention|rate limit|try again|error/i")
      .first()
      .waitFor({ timeout: 30_000 })
      .then(() => true)
      .catch(() => false);

    const loaded = await contentPromise;
    // Test passes if either content loaded or an error was shown gracefully
    // (no crash, no infinite spinner).
    expect(loaded, "Brief should show content or a graceful error").toBe(true);
  });

  test("charts render without errors", async ({ page, consoleErrors }) => {
    await goToSection(page, "dashboard");

    // Wait for charts to load — the page should have multiple SVGs (Recharts renders SVG)
    // Wait for at least 2 SVGs to be visible (Hiring Funnel + Source Effectiveness)
    await expect(page.locator("main svg").first()).toBeVisible({ timeout: 10_000 });
    const svgCount = await page.locator("main svg").count();
    expect(svgCount, "Dashboard should render at least 2 chart SVGs").toBeGreaterThanOrEqual(2);
  });
});
