import { test, expect, goToSection } from "./helpers";

/**
 * Settings tests — verifies all 5 tabs persist changes to localStorage
 * and survive a page reload.
 */
test.describe("Settings", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    // Clear any previous test's localStorage
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForLoadState("networkidle");
    await goToSection(page, "settings");
  });

  test("all 5 tabs are visible", async ({ page, consoleErrors }) => {
    await expect(page.getByRole("tab", { name: "Company" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Hiring Stages" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Integrations" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "AI" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Notifications" })).toBeVisible();
  });

  test("Company profile saves and persists across reload", async ({ page, consoleErrors }) => {
    const newName = `E2E Test Co ${Date.now()}`;

    await page.getByLabel("Company name").fill(newName);
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByText("Company profile saved")).toBeVisible();

    // Reload
    await page.reload();
    await page.waitForLoadState("networkidle");
    await goToSection(page, "settings");

    // The saved name should still be there
    await expect(page.getByLabel("Company name")).toHaveValue(newName);
  });

  test("Hiring Stages: add stage persists across reload", async ({ page, consoleErrors }) => {
    await page.getByRole("tab", { name: "Hiring Stages" }).click();

    const stageName = `E2E Stage ${Date.now()}`;
    await page.getByPlaceholder(/New stage name/).fill(stageName);
    await page.getByRole("button", { name: "Add stage" }).click();

    await expect(page.getByText("added")).toBeVisible();
    await expect(page.getByText(stageName)).toBeVisible();

    // Reload
    await page.reload();
    await page.waitForLoadState("networkidle");
    await goToSection(page, "settings");
    await page.getByRole("tab", { name: "Hiring Stages" }).click();

    // The stage should still be there
    await expect(page.getByText(stageName)).toBeVisible();
  });

  test("Hiring Stages: remove stage works", async ({ page, consoleErrors }) => {
    await page.getByRole("tab", { name: "Hiring Stages" }).click();

    // Add a stage to remove
    const stageName = `Remove Me ${Date.now()}`;
    await page.getByPlaceholder(/New stage name/).fill(stageName);
    await page.getByRole("button", { name: "Add stage" }).click();
    await expect(page.getByText(stageName)).toBeVisible();

    // Now remove it — find the remove button for this stage
    const stageRow = page.locator("text=" + stageName).locator("..");
    const removeBtn = stageRow.getByRole("button", { name: new RegExp(`Remove ${stageName}`) });
    await removeBtn.click();

    await expect(page.getByText("removed")).toBeVisible();
    await expect(page.getByText(stageName)).not.toBeVisible();
  });

  test("Integrations: Connect/Disconnect toggles state", async ({ page, consoleErrors }) => {
    await page.getByRole("tab", { name: "Integrations" }).click();

    // Find a "Connect" button (not yet connected integration)
    const connectBtn = page.getByRole("button", { name: "Connect" }).first();
    await connectBtn.click();

    // Should show a success toast
    await expect(page.getByText(/connected/i)).toBeVisible({ timeout: 5_000 });

    // The button should now say "Disconnect"
    await expect(page.getByRole("button", { name: "Disconnect" }).first()).toBeVisible();
  });

  test("AI settings: Save persists changes", async ({ page, consoleErrors }) => {
    await page.getByRole("tab", { name: "AI" }).click();

    // Toggle a feature
    const firstFeatureSwitch = page.getByRole("switch").first();
    const initialState = await firstFeatureSwitch.getAttribute("aria-checked");
    await firstFeatureSwitch.click();

    // Save button should become enabled (dirty state)
    const saveBtn = page.getByRole("button", { name: "Save AI settings" });
    await expect(saveBtn).toBeEnabled();

    // Save
    await saveBtn.click();
    await expect(page.getByText("AI settings saved")).toBeVisible({ timeout: 5_000 });

    // Reload
    await page.reload();
    await page.waitForLoadState("networkidle");
    await goToSection(page, "settings");
    await page.getByRole("tab", { name: "AI" }).click();

    // The toggle state should have persisted
    const restoredState = await page.getByRole("switch").first().getAttribute("aria-checked");
    expect(restoredState).not.toBe(initialState);

    // Restore original state
    await page.getByRole("switch").first().click();
    await page.getByRole("button", { name: "Save AI settings" }).click();
  });

  test("Notifications: toggles persist", async ({ page, consoleErrors }) => {
    await page.getByRole("tab", { name: "Notifications" }).click();

    // Find first Push switch (Push defaults to off)
    const firstPushSwitch = page.getByRole("switch", { name: "Push" }).first();
    await firstPushSwitch.click();

    // Reload
    await page.reload();
    await page.waitForLoadState("networkidle");
    await goToSection(page, "settings");
    await page.getByRole("tab", { name: "Notifications" }).click();

    // Push should still be on
    await expect(page.getByRole("switch", { name: "Push" }).first()).toBeChecked();
  });
});
