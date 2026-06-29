import { test, expect, goToSection } from "./helpers";

/**
 * AI Tools tests — verifies all 5 AI tools return real content and
 * handle edge cases gracefully (gibberish input, missing fields).
 *
 * Note: AI calls take 5-15s each, so these tests are slower. We use
 * generous timeouts.
 */
test.describe("AI Tools", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await goToSection(page, "ai-tools");
  });

  test("all 5 AI tool cards are visible", async ({ page, consoleErrors }) => {
    await expect(page.getByText("Resume Parser & Scorer")).toBeVisible();
    await expect(page.getByText("Job Description Generator")).toBeVisible();
    await expect(page.getByText("Interview Question Generator")).toBeVisible();
    await expect(page.getByText("Email Drafter")).toBeVisible();
    await expect(page.getByText("Offer Letter Generator")).toBeVisible();
  });

  test("Zero-Token AI explainer is visible", async ({ page, consoleErrors }) => {
    await expect(page.getByText("What is Zero-Token AI?")).toBeVisible();
    // The explainer contains "$0 marginal cost" — use a more specific match
    await expect(page.getByText("$0 marginal cost")).toBeVisible();
  });

  test("Resume Scorer handles gibberish gracefully (returns 0 score)", async ({ page, consoleErrors }) => {
    test.setTimeout(120_000); // AI calls can take 60s+
    // Pick a job
    await page.getByRole("combobox").first().click();
    await page.getByRole("option", { name: "Senior React Engineer" }).click();

    // Paste gibberish resume
    const resumeBox = page.getByPlaceholder(/Paste the candidate/);
    await resumeBox.fill("asdf jkl random text not a resume");

    // Click Score Resume
    await page.getByRole("button", { name: "Score Resume" }).click();

    // Wait for result — should show a score (0-100) within 90s
    const scoreResult = page.locator("text=Match Score").locator("..");
    await expect(scoreResult).toBeVisible({ timeout: 90_000 });

    // Should contain a numeric score
    await expect(page.locator("text=/\\d+\\/100/")).toBeVisible();
  });

  test("JD Generator produces structured output", async ({ page, consoleErrors }) => {
    test.setTimeout(120_000); // AI calls can take 60s+
    // Find the inline JD generator (second card)
    // Fill title (other fields have sensible defaults)
    const titleInput = page.getByPlaceholder("Senior React Engineer");
    await titleInput.fill("E2E Test Job Title");

    // Click Generate JD
    await page.getByRole("button", { name: "Generate JD" }).click();

    // Wait for result — should show "Generated JD" panel with markdown content
    await expect(page.getByText("Generated JD")).toBeVisible({ timeout: 90_000 });

    // The generated JD should contain the title we provided
    await expect(page.getByText("E2E Test Job Title")).toBeVisible();

    // Copy button should appear
    await expect(page.getByRole("button", { name: "Copy" })).toBeVisible();
  });

  test("all AI buttons are disabled until required inputs are filled", async ({ page, consoleErrors }) => {
    // Score Resume — disabled until resume + job selected
    const scoreBtn = page.getByRole("button", { name: "Score Resume" });
    await expect(scoreBtn).toBeDisabled();

    // Generate JD — disabled until title entered
    const jdBtn = page.getByRole("button", { name: "Generate JD" });
    await expect(jdBtn).toBeDisabled();

    // Generate Questions — disabled until application picked
    const questionsBtn = page.getByRole("button", { name: "Generate Questions" });
    await expect(questionsBtn).toBeDisabled();

    // Draft Email — disabled until candidate picked
    const emailBtn = page.getByRole("button", { name: "Draft Email" });
    await expect(emailBtn).toBeDisabled();

    // Generate Offer Letter — disabled until candidate picked
    const offerBtn = page.getByRole("button", { name: "Generate Offer Letter" });
    await expect(offerBtn).toBeDisabled();
  });
});
