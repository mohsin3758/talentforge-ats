import { test, expect, goToSection, apiGet, apiPost } from "./helpers";
import type { Application } from "@/lib/ats/types";

/**
 * Pipeline tests — verifies column counts match DB and stage moves persist.
 * Stage-move is tested via API directly because HTML5 drag-and-drop is
 * flaky in headless browsers.
 */
test.describe("Pipeline", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("column counts match DB byStageRecord", async ({ page, consoleErrors }) => {
    const analytics = await apiGet<{ byStageRecord: Record<string, number> }>(
      page,
      "/api/ats/analytics",
    );

    await goToSection(page, "pipeline");

    // Each column has an aria-label like "Applied column with 10 applications"
    const expectedStages = [
      { label: "Applied", count: analytics.byStageRecord.applied },
      { label: "Screening", count: analytics.byStageRecord.screen },
      { label: "Interview", count: analytics.byStageRecord.interview },
      { label: "Assessment", count: analytics.byStageRecord.assessment },
      { label: "Offer", count: analytics.byStageRecord.offer },
      { label: "Hired", count: analytics.byStageRecord.hired },
      { label: "Rejected", count: analytics.byStageRecord.rejected },
    ];

    for (const stage of expectedStages) {
      const ariaLabel = `${stage.label} column with ${stage.count} applications`;
      const column = page.locator(`[aria-label="${ariaLabel}"]`);
      await expect(column).toBeVisible({ timeout: 10_000 });
    }
  });

  test("stage move API persists and appends to stageHistory", async ({ page, consoleErrors }) => {
    // Get one application in 'applied' stage
    const apps = await apiGet<Application[]>(page, "/api/ats/applications?stage=applied");
    expect(apps.length, "Should have at least one applied application").toBeGreaterThan(0);

    const target = apps[0];
    const originalHistoryLength = target.stageHistory.length;

    // Move to 'screen' via API (same endpoint the drag-drop UI calls)
    const updated = await apiPost<Application>(
      page,
      `/api/ats/applications/${target.id}/stage`,
      { stage: "screen" },
    );

    // Verify stage changed
    expect(updated.stage).toBe("screen");

    // Verify stageHistory grew by 1
    expect(updated.stageHistory.length).toBe(originalHistoryLength + 1);
    expect(updated.stageHistory[updated.stageHistory.length - 1].stage).toBe("screen");

    // Restore
    await apiPost(page, `/api/ats/applications/${target.id}/stage`, {
      stage: "applied",
    });
  });

  test("clicking a candidate card opens profile dialog", async ({ page, consoleErrors }) => {
    await goToSection(page, "pipeline");

    // Click the first application card
    const firstCard = page.getByRole("button", { name: /Application from/ }).first();
    await firstCard.click();

    // Dialog should open with candidate name as heading
    await expect(page.getByRole("dialog")).toBeVisible();

    // Should have the 5 tabs visible
    await expect(page.getByRole("tab", { name: "AI Summary" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Stage History" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Interviews" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Communications" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Notes" })).toBeVisible();
  });
});
