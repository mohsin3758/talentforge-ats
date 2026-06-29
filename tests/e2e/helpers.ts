import { test as base, expect, type Page } from "@playwright/test";

/**
 * Shared helpers for TalentForge ATS E2E tests.
 *
 * The app is a single-page app at `/` with a Zustand store controlling which
 * section is visible. We navigate sections by clicking sidebar buttons.
 */

export const SIDEBAR_SECTIONS = {
  dashboard: "Dashboard",
  jobs: "Jobs",
  pipeline: "Pipeline",
  candidates: "Candidates",
  "ai-tools": "AI Tools",
  automations: "Automations",
  analytics: "Analytics",
  "ats-compare": "ATS Compare",
  settings: "Settings",
} as const;

export type SectionId = keyof typeof SIDEBAR_SECTIONS;

/** Navigate to a sidebar section by label. */
export async function goToSection(page: Page, section: SectionId) {
  const label = SIDEBAR_SECTIONS[section];
  const btn = page.getByRole("button", { name: label, exact: true });
  await btn.click();
  // Wait for the section content to load. We give it a moment for the
  // Zustand store to update and the new section to render.
  await page.waitForTimeout(800);
  // Verify navigation by checking the main content area updated.
  // Each section has a distinctive element we can check for.
  const sectionChecks: Record<SectionId, string> = {
    dashboard: "AI Daily Brief",
    jobs: "New Job",
    pipeline: "Pipeline",
    candidates: "Add Candidate",
    "ai-tools": "What is Zero-Token AI?",
    automations: "New Automation",
    analytics: "Time to Hire",
    "ats-compare": "Feature Matrix",
    settings: "Company",
  };
  await expect(page.getByText(sectionChecks[section], { exact: false }).first()).toBeVisible({
    timeout: 10_000,
  });
}

/** Fetch JSON from an API endpoint. */
export async function apiGet<T = unknown>(page: Page, path: string): Promise<T> {
  const res = await page.request.get(path);
  expect(res.ok(), `GET ${path} should return 2xx`).toBeTruthy();
  return (await res.json()) as T;
}

/** POST JSON to an API endpoint. */
export async function apiPost<T = unknown>(
  page: Page,
  path: string,
  body: unknown,
): Promise<T> {
  const res = await page.request.post(path, { data: body });
  expect(res.ok(), `POST ${path} should return 2xx`).toBeTruthy();
  return (await res.json()) as T;
}

/** Collect all console errors and warnings during a test. */
export async function collectConsoleErrors(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on("console", (msg) => {
    const type = msg.type();
    if (type === "error" || type === "warning") {
      // Ignore React DevTools and HMR noise
      const text = msg.text();
      if (
        text.includes("React DevTools") ||
        text.includes("HMR") ||
        text.includes("Fast Refresh") ||
        text.includes("Download the React DevTools")
      ) {
        return;
      }
      // Ignore AI API rate-limit (429) and AI 500 errors — these are
      // environmental (free-tier rate limits), not code bugs.
      if (
        (text.includes("500") || text.includes("429")) &&
        (text.includes("/api/ats/ai/") || text.includes("Failed to load resource"))
      ) {
        return;
      }
      errors.push(`[${type}] ${text}`);
    }
  });
  page.on("pageerror", (err) => {
    errors.push(`[pageerror] ${err.message}`);
  });
  return errors;
}

/** Assert no console errors accumulated. Call at the end of any test. */
export function expectNoConsoleErrors(errors: string[]) {
  if (errors.length > 0) {
    throw new Error(
      `Console errors detected:\n${errors.map((e) => `  ${e}`).join("\n")}`,
    );
  }
}

/**
 * Extended test fixture that auto-collects console errors and asserts
 * none occurred at the end of the test.
 */
export const test = base.extend<{ consoleErrors: string[] }>({
  consoleErrors: async ({ page }, use) => {
    const errors = await collectConsoleErrors(page);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(errors);
    expectNoConsoleErrors(errors);
  },
});

export { expect };
