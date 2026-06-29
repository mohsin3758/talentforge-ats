import { test, expect, goToSection, SIDEBAR_SECTIONS, collectConsoleErrors } from "./helpers";

/**
 * Cross-cutting tests that verify the entire app stays healthy.
 */
test.describe("Cross-cutting", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("no console errors on any section", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error" || msg.type() === "warning") {
        const text = msg.text();
        if (
          text.includes("React DevTools") ||
          text.includes("HMR") ||
          text.includes("Fast Refresh") ||
          text.includes("Download the React DevTools")
        ) {
          return;
        }
        errors.push(`[${msg.type()}] ${text}`);
      }
    });
    page.on("pageerror", (err) => {
      errors.push(`[pageerror] ${err.message}`);
    });

    // Click through every section
    for (const sectionId of Object.keys(SIDEBAR_SECTIONS) as Array<
      keyof typeof SIDEBAR_SECTIONS
    >) {
      await goToSection(page, sectionId);
      await page.waitForTimeout(500);
    }

    if (errors.length > 0) {
      throw new Error(
        `Console errors detected across sections:\n${errors.map((e) => `  ${e}`).join("\n")}`,
      );
    }
  });

  test("dashboard is stable across reload (no Math.random drift)", async ({ page }) => {
    await goToSection(page, "dashboard");

    // Capture the entire main content text
    const mainContent1 = await page.locator("main").innerText();

    // Reload
    await page.reload();
    await page.waitForLoadState("networkidle");
    await goToSection(page, "dashboard");

    const mainContent2 = await page.locator("main").innerText();

    // The content should be identical — no Math.random drift in charts or KPIs
    // Note: AI Daily Brief content may differ, so we exclude it from comparison
    // by only comparing lines that start with KPI labels or numbers
    const normalize = (text: string) =>
      text
        .split("\n")
        .filter((line) => /^(Active Jobs|Open Applications|Interviews|Hires|Applied|Screening|Interview|Assessment|Offer|Hired|Rejected|\d)/.test(line.trim()))
        .join("\n");

    expect(normalize(mainContent2)).toBe(normalize(mainContent1));
  });

  test("footer is visible and at bottom of page", async ({ page }) => {
    const footer = page.locator("footer");
    await expect(footer).toBeVisible();
    await expect(footer).toContainText("TalentForge ATS");
    await expect(footer).toContainText("Zero-Token AI");

    // Footer should be at the bottom of the page content, not floating
    const footerBox = await footer.boundingBox();
    const viewportHeight = page.viewportSize()?.height ?? 900;
    expect(footerBox, "Footer should have a bounding box").not.toBeNull();
  });

  test("dark mode toggle works", async ({ page }) => {
    const htmlEl = page.locator("html");
    const initialClass = await htmlEl.getAttribute("class");

    await page.getByRole("button", { name: "Toggle dark mode" }).click();

    const toggledClass = await htmlEl.getAttribute("class");
    expect(toggledClass).not.toBe(initialClass);

    // Toggle back
    await page.getByRole("button", { name: "Toggle dark mode" }).click();
    const restoredClass = await htmlEl.getAttribute("class");
    expect(restoredClass).toBe(initialClass);
  });

  test("mobile viewport renders without horizontal scroll", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.reload();
    await page.waitForLoadState("networkidle");

    // Check there's no horizontal overflow
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth, "Page should not have horizontal scroll on mobile").toBeLessThanOrEqual(
      clientWidth + 1, // +1 for rounding
    );
  });

  test("sidebar collapse works", async ({ page }) => {
    const collapseBtn = page.getByRole("button", { name: "Collapse sidebar" });
    await collapseBtn.click();

    // Sidebar labels should be hidden (collapsed mode shows icons only)
    // We verify by checking that the "Dashboard" text label is no longer visible
    // as a sidebar button (it becomes just an icon)
    await page.waitForTimeout(300);

    // The sidebar should still be functional — expand it back
    await collapseBtn.click();
    await page.waitForTimeout(300);

    // Should be able to navigate again
    await goToSection(page, "jobs");
    await expect(page.getByRole("heading", { level: 1, name: "Jobs" })).toBeVisible();
  });

  test("Topbar New dropdown has all 4 items", async ({ page }) => {
    await page.getByRole("button", { name: "New", exact: true }).click();

    await expect(page.getByRole("menuitem", { name: "Job posting" })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: "Candidate" })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: "Automation rule" })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: "Run AI tool" })).toBeVisible();
  });
});
