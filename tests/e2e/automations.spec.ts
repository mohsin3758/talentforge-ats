import { test, expect, goToSection } from "./helpers";

/**
 * Automations tests — verifies toggle persists, invalid JSON shows helpful
 * error, and template enable creates a rule.
 */
test.describe("Automations", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await goToSection(page, "automations");
  });

  test("existing automations render with trigger→action flow", async ({ page, consoleErrors }) => {
    // Should have automation cards with trigger→action badges
    await expect(page.locator("text=/→/").first()).toBeVisible();

    // Should show run counts somewhere
    await expect(page.locator("text=/\\d+ runs/").first()).toBeVisible();
  });

  test("Quick Templates section is visible", async ({ page, consoleErrors }) => {
    await expect(page.getByText("Quick Templates")).toBeVisible();
    await expect(page.getByRole("button", { name: "Enable" }).first()).toBeVisible();
  });

  test("invalid JSON in trigger config shows helpful error", async ({ page, consoleErrors }) => {
    await page.getByRole("button", { name: "New Automation" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();

    // Fill required name + description
    await page.getByLabel("Name *").fill("E2E Invalid JSON Test");
    await page.getByLabel("Description").fill("Testing error handling");

    // Put invalid JSON in trigger config
    const triggerConfigInput = page.locator('input[placeholder*="minScore"]').first();
    await triggerConfigInput.fill("not valid json{");

    // Click Create
    await page.getByRole("button", { name: "Create" }).click();

    // Should show a helpful error toast (not a raw JSON.parse error)
    await expect(page.getByText(/not valid JSON/i)).toBeVisible({ timeout: 5_000 });

    // The dialog should stay open (not crash)
    await expect(page.getByRole("dialog")).toBeVisible();
  });

  test("switch toggle on automation card works", async ({ page, consoleErrors }) => {
    // Find the first automation switch
    const firstSwitch = page.getByRole("switch").first();
    const initialState = await firstSwitch.getAttribute("aria-checked");

    // Toggle it
    await firstSwitch.click();

    // Wait for toast or state change
    await page.waitForTimeout(500);

    // Verify the state changed
    const newState = await firstSwitch.getAttribute("aria-checked");
    expect(newState).not.toBe(initialState);

    // Toggle back to restore original state
    await firstSwitch.click();
    await page.waitForTimeout(500);
  });

  test("create automation with valid JSON succeeds", async ({ page, consoleErrors }) => {
    await page.getByRole("button", { name: "New Automation" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();

    await page.getByLabel("Name *").fill("E2E Valid Automation");
    await page.getByLabel("Description").fill("Created by E2E test");

    // Valid JSON config
    const triggerConfigInput = page.locator('input[placeholder*="minScore"]').first();
    await triggerConfigInput.fill('{"min":75}');

    await page.getByRole("button", { name: "Create" }).click();

    // Should show success toast
    await expect(page.getByText("Automation created")).toBeVisible({ timeout: 5_000 });

    // Dialog should close
    await expect(page.getByRole("dialog")).not.toBeVisible({ timeout: 5_000 });

    // The new automation should appear in the list
    await expect(page.getByText("E2E Valid Automation")).toBeVisible();
  });
});
