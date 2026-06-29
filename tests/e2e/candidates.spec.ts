import { test, expect, goToSection, apiGet } from "./helpers";
import type { Candidate, Application } from "@/lib/ats/types";

/**
 * Candidates tests — verifies search accuracy and filter combinations.
 */
test.describe("Candidates", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("row count matches DB count", async ({ page, consoleErrors }) => {
    const candidates = await apiGet<Candidate[]>(page, "/api/ats/candidates");

    await goToSection(page, "candidates");

    // Wait for table to load
    await expect(page.getByRole("row").first()).toBeVisible({ timeout: 10_000 });

    // Count rows in tbody (excludes header)
    const rowCount = await page.locator("tbody tr").count();
    expect(rowCount).toBe(candidates.length);
  });

  test("search filters results accurately", async ({ page, consoleErrors }) => {
    // Find candidates with "React" in their data via API
    const reactCandidates = await apiGet<Candidate[]>(page, "/api/ats/candidates?q=React");
    expect(reactCandidates.length, "API should return some React candidates").toBeGreaterThan(0);
    expect(reactCandidates.length, "API should return fewer than all candidates").toBeLessThan(30);

    await goToSection(page, "candidates");

    // Initially should show all 30 candidates
    await expect(page.locator("tbody tr")).toHaveCount(30, { timeout: 10_000 });

    // Type in the candidates search box (NOT the Topbar global search).
    // The candidates section placeholder is "Search by name, email, title, or skill…"
    const searchBox = page.getByPlaceholder(/Search by name, email, title/);
    await searchBox.click();
    await searchBox.type("React", { delay: 50 });

    // Wait for debounce (300ms) + refetch + render
    await page.waitForTimeout(2000);

    // The row count should now match the filtered count
    await expect(page.locator("tbody tr")).toHaveCount(reactCandidates.length, { timeout: 20_000 });
  });

  test("source filter combined with search", async ({ page, consoleErrors }) => {
    await goToSection(page, "candidates");

    // Apply LinkedIn source filter
    await page.getByRole("combobox").first().click();
    await page.getByRole("option", { name: "LinkedIn" }).click();

    // Wait for filter to apply
    await page.waitForTimeout(1000);

    // Verify all visible candidates are LinkedIn-sourced
    const rows = page.locator("tbody tr");
    const count = await rows.count();
    expect(count, "Should have LinkedIn candidates").toBeGreaterThan(0);

    // Each row should contain "LinkedIn" somewhere
    for (let i = 0; i < count; i++) {
      await expect(rows.nth(i)).toContainText("LinkedIn");
    }
  });

  test("min score filter works", async ({ page, consoleErrors }) => {
    await goToSection(page, "candidates");

    // Set min score to 85
    const scoreInput = page.getByRole("spinbutton");
    await scoreInput.fill("85");

    // Wait for filter
    await page.waitForTimeout(1000);

    // All visible candidates should have score >= 85
    const rows = page.locator("tbody tr");
    const count = await rows.count();
    expect(count, "Should have high-score candidates").toBeGreaterThan(0);

    // Each row should show a score badge >= 85
    for (let i = 0; i < count; i++) {
      const rowText = await rows.nth(i).innerText();
      // Find score numbers in the row (badges show like "92" or "95")
      const scoreMatch = rowText.match(/\b(\d{2,3})\b/g);
      expect(scoreMatch, `Row ${i} should have a score`).not.toBeNull();
      if (scoreMatch) {
        const scores = scoreMatch.map(Number);
        const maxScore = Math.max(...scores);
        expect(maxScore, `Row ${i} max score should be >= 85`).toBeGreaterThanOrEqual(85);
      }
    }
  });

  test("empty search shows no-results message", async ({ page, consoleErrors }) => {
    await goToSection(page, "candidates");

    const searchBox = page.getByPlaceholder(/Search by name, email, title/);
    await searchBox.fill("zzzznonexistentuser12345");

    // Wait for debounce + refetch
    await page.waitForTimeout(1500);

    await expect(page.getByText(/No candidates match/)).toBeVisible({ timeout: 10_000 });
  });

  test("Add Candidate button disabled until required fields filled", async ({ page, consoleErrors }) => {
    await goToSection(page, "candidates");

    await page.getByRole("button", { name: "Add Candidate" }).first().click();
    await expect(page.getByRole("dialog")).toBeVisible();

    // Submit button should be disabled
    const submitBtn = page.getByRole("button", { name: "Add Candidate" }).last();
    await expect(submitBtn).toBeDisabled();

    // Fill just email — should still be disabled (name required)
    await page.getByLabel("Email *").fill("test@example.com");
    await expect(submitBtn).toBeDisabled();

    // Fill name — now enabled
    await page.getByLabel("Full Name *").fill("Test User");
    await expect(submitBtn).toBeEnabled();
  });
});
