import { test, expect, goToSection, apiPost, apiGet } from "./helpers";

/**
 * Candidate Profile Dialog tests — verifies all 5 tabs render and
 * Notes add actually persists to DB.
 */
test.describe("Candidate Profile Dialog", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await goToSection(page, "pipeline");
  });

  async function openFirstCandidateDialog(page: import("@playwright/test").Page) {
    const firstCard = page.getByRole("button", { name: /Application from/ }).first();
    await firstCard.click();
    await expect(page.getByRole("dialog")).toBeVisible();
  }

  test("all 5 tabs are visible and clickable", async ({ page, consoleErrors }) => {
    await openFirstCandidateDialog(page);

    const tabs = ["AI Summary", "Stage History", "Interviews", "Communications", "Notes"];
    for (const tabName of tabs) {
      const tab = page.getByRole("tab", { name: tabName });
      await expect(tab).toBeVisible();
      await tab.click();
      // Wait a moment for tab content to render
      await page.waitForTimeout(200);
    }
  });

  test("adding a note persists to DB", async ({ page, consoleErrors }) => {
    // Get the first application to know its ID
    const apps = await apiGet<Array<{ id: string; candidate: { fullName: string } }>>(
      page,
      "/api/ats/applications",
    );
    const target = apps[0];
    const noteContent = `E2E test note ${Date.now()}`;

    await openFirstCandidateDialog(page);

    // Go to Notes tab
    await page.getByRole("tab", { name: "Notes" }).click();

    // Type a note
    const noteInput = page.getByPlaceholder(/Add a private note/);
    await noteInput.fill(noteContent);

    // Click Add Note
    await page.getByRole("button", { name: "Add Note" }).click();

    // Wait for success toast
    await expect(page.getByText("Note added")).toBeVisible({ timeout: 5_000 });

    // Verify the note appears in the dialog
    await expect(page.getByText(noteContent)).toBeVisible();

    // Verify the note persisted via API
    const updated = await apiGet<{ notes: Array<{ content: string }> }>(
      page,
      `/api/ats/applications/${target.id}`,
    );
    const persistedNote = updated.notes.find((n) => n.content === noteContent);
    expect(persistedNote, "Note should be persisted in DB").toBeTruthy();
  });

  test("stage dropdown changes persist via API", async ({ page, consoleErrors }) => {
    const apps = await apiGet<Array<{ id: string; stage: string }>>(
      page,
      "/api/ats/applications",
    );
    // Find an application in 'applied' stage so we can move it to 'screen'
    const target = apps.find((a) => a.stage === "applied") ?? apps[0];
    const originalStage = target.stage;

    await openFirstCandidateDialog(page);

    // Find the stage Select dropdown and change to 'screen'
    const stageSelect = page.locator("text=Stage:").locator("..").getByRole("combobox");
    await stageSelect.click();
    await page.getByRole("option", { name: "Screening" }).click();

    // Wait for the mutation to complete (toast appears)
    await expect(page.getByText("Stage updated")).toBeVisible({ timeout: 5_000 });

    // Verify via API
    const updated = await apiGet<{ stage: string }>(
      page,
      `/api/ats/applications/${target.id}`,
    );
    expect(updated.stage).toBe("screen");

    // Restore
    await apiPost(page, `/api/ats/applications/${target.id}/stage`, {
      stage: originalStage,
    });
  });
});
