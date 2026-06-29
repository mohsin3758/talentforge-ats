import { test, expect, goToSection, apiGet } from "./helpers";
import type { Job } from "@/lib/ats/types";

/**
 * Jobs tests — verifies status tab counts match DB, Edit dialog pre-fills,
 * and Edit actually persists changes.
 */
test.describe("Jobs", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("status tab counts match DB", async ({ page, consoleErrors }) => {
    const jobs = await apiGet<Job[]>(page, "/api/ats/jobs");
    const counts = {
      all: jobs.length,
      open: jobs.filter((j) => j.status === "open").length,
      paused: jobs.filter((j) => j.status === "paused").length,
      draft: jobs.filter((j) => j.status === "draft").length,
      closed: jobs.filter((j) => j.status === "closed").length,
    };

    await goToSection(page, "jobs");

    // Count "Edit" buttons per tab — each job card has one Edit button
    const editButtons = page.getByRole("button", { name: "Edit" });

    // All tab — should show all jobs
    await page.getByRole("tab", { name: "All", exact: true }).click();
    await page.waitForTimeout(500);
    await expect(editButtons).toHaveCount(counts.all);

    // Open tab
    await page.getByRole("tab", { name: "Open", exact: true }).click();
    await page.waitForTimeout(500);
    await expect(editButtons).toHaveCount(counts.open);

    // Paused tab
    await page.getByRole("tab", { name: "Paused", exact: true }).click();
    await page.waitForTimeout(500);
    await expect(editButtons).toHaveCount(counts.paused);
  });

  test("Edit dialog pre-fills with job data", async ({ page, consoleErrors }) => {
    const jobs = await apiGet<Job[]>(page, "/api/ats/jobs");
    const firstJob = jobs[0];

    await goToSection(page, "jobs");

    // Click the first Edit button
    await page.getByRole("button", { name: "Edit" }).first().click();

    // Dialog should be open with pre-filled title
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByLabel("Title *")).toHaveValue(firstJob.title);
    await expect(page.getByLabel("Department *")).toHaveValue(firstJob.department);
    await expect(page.getByLabel("Location *")).toHaveValue(firstJob.location);
  });

  test("Edit persists changes to DB", async ({ page, consoleErrors }) => {
    const jobs = await apiGet<Job[]>(page, "/api/ats/jobs");
    const targetJob = jobs.find((j) => j.title === "Warehouse Associate") ?? jobs[0];
    const originalOpenings = targetJob.openings;

    await goToSection(page, "jobs");

    // Find the Warehouse Associate card (or first card) and click Edit
    const editButtons = page.getByRole("button", { name: "Edit" });
    await editButtons.first().click();
    await expect(page.getByRole("dialog")).toBeVisible();

    // Change openings
    const openingsInput = page.getByLabel("Openings");
    await openingsInput.fill("99");

    // Save
    await page.getByRole("button", { name: "Save changes" }).click();

    // Wait for dialog to close
    await expect(page.getByRole("dialog")).not.toBeVisible({ timeout: 5_000 });

    // Verify the change persisted in the API
    const updatedJobs = await apiGet<Job[]>(page, "/api/ats/jobs");
    const updated = updatedJobs.find((j) => j.id === targetJob.id);
    expect(updated?.openings).toBe(99);

    // Restore the original value
    await page.request.patch(`/api/ats/jobs/${targetJob.id}`, {
      data: { ...targetJob, openings: originalOpenings },
    });
  });

  test("Generate JD button opens JD generator pre-filled", async ({ page, consoleErrors }) => {
    const jobs = await apiGet<Job[]>(page, "/api/ats/jobs");
    const firstJob = jobs[0];

    await goToSection(page, "jobs");

    // Click "Generate JD with AI for <title>"
    await page
      .getByRole("button", { name: new RegExp(`Generate JD with AI for ${firstJob.title}`) })
      .first()
      .click();

    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByText("AI Job Description Generator")).toBeVisible();

    // Title field should be pre-filled with the job title
    await expect(page.getByLabel("Title")).toHaveValue(firstJob.title);
  });
});
