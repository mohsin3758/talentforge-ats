#!/usr/bin/env bun
/**
 * "Count Things" Test
 *
 * For every list/grid labeled "Top N" or similar, asserts the actual count === N.
 * This catches the class of bugs where a label says one number but the data has
 * another (e.g., "Top 100 ATS" actually containing 105 items).
 *
 * Usage:
 *   bun scripts/count-things.ts
 *
 * Exit code 0 = all counts match their labels
 * Exit code 1 = one or more mismatches
 */
import { chromium, type Page, type Browser } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

const BASE = "http://localhost:3000";

type Check = {
  name: string;
  category: string;
  run: (ctx: { browser: Browser; page: Page }) => Promise<{ ok: boolean; detail?: string }>;
};

const checks: Check[] = [];

function check(
  name: string,
  category: string,
  fn: (ctx: { browser: Browser; page: Page }) => Promise<{ ok: boolean; detail?: string }>,
) {
  checks.push({ name, category, run: fn });
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */
async function fetchJson<T = unknown>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`GET ${path} → ${res.status}`);
  return (await res.json()) as T;
}

async function goToSection(page: Page, section: string) {
  await page.getByRole("button", { name: section, exact: true }).click();
  await page.waitForTimeout(1500);
}

function readConstantsFile(): string {
  return fs.readFileSync(
    path.join(process.cwd(), "src/lib/ats/constants.ts"),
    "utf-8",
  );
}

function countArrayItems(content: string, arrayName: string): number {
  const match = content.match(new RegExp(`export const ${arrayName}.*?=\\s*\\[(.*?)\\];`, "s"));
  if (!match) return -1;
  const body = match[1];
  // For object arrays: count top-level objects (each starts with { on its own line
  // or after a comma). We match { followed by whitespace and a property name.
  const objectItems = body.match(/^\s*\{|,\s*\{/gm);
  if (objectItems) return objectItems.length;
  // For string arrays: count "..." entries (each string is one item)
  const stringItems = body.match(/"[^"]+"/g);
  return stringItems?.length ?? 0;
}

/* ------------------------------------------------------------------ */
/* Source-code-level count checks (fast, no browser needed)            */
/* ------------------------------------------------------------------ */
check(
  'TOP_100_ATS array = 100 (label: "top 100 ATS platforms")',
  "Source Constants",
  async () => {
    const content = readConstantsFile();
    const count = countArrayItems(content, "TOP_100_ATS");
    // Also check for duplicates
    const match = content.match(/export const TOP_100_ATS.*?=\s*\[(.*?)\];/s);
    const names = (match?.[1].match(/"([^"]+)"/g) ?? []).map((s) => s.replace(/"/g, ""));
    const dupes = names.filter((n, i) => names.indexOf(n) !== i);
    const ok = count === 100 && dupes.length === 0;
    return {
      ok,
      detail: ok ? undefined : `count=${count} duplicates=${dupes.length ? dupes.join(", ") : "none"}`,
    };
  },
);

check(
  'FEATURE_MATRIX = 15 (label: "15 capability categories")',
  "Source Constants",
  async () => {
    const content = readConstantsFile();
    const count = countArrayItems(content, "FEATURE_MATRIX");
    const ok = count === 15;
    return { ok, detail: ok ? undefined : `Expected 15 features, got ${count}` };
  },
);

check(
  'PARITY_DIMENSIONS = 8 (label: "8 strategic dimensions")',
  "Source Constants",
  async () => {
    const content = readConstantsFile();
    const count = countArrayItems(content, "PARITY_DIMENSIONS");
    const ok = count === 8;
    return { ok, detail: ok ? undefined : `Expected 8 dimensions, got ${count}` };
  },
);

check(
  'COMPETITORS = 8 (label: "8 ATS columns" in feature matrix)',
  "Source Constants",
  async () => {
    const content = readConstantsFile();
    const count = countArrayItems(content, "COMPETITORS");
    const ok = count === 8;
    return { ok, detail: ok ? undefined : `Expected 8 competitors, got ${count}` };
  },
);

check(
  'STAGES = 7 (pipeline has 7 columns)',
  "Source Constants",
  async () => {
    const content = readConstantsFile();
    const count = countArrayItems(content, "STAGES");
    const ok = count === 7;
    return { ok, detail: ok ? undefined : `Expected 7 stages, got ${count}` };
  },
);

check(
  'SOURCES = 6 (LinkedIn, Indeed, Referral, Direct, Job Board, Agency)',
  "Source Constants",
  async () => {
    const content = readConstantsFile();
    const count = countArrayItems(content, "SOURCES");
    const ok = count === 6;
    return { ok, detail: ok ? undefined : `Expected 6 sources, got ${count}` };
  },
);

check(
  'AUTOMATION_TEMPLATES = 5 (Quick Templates section)',
  "Source Constants",
  async () => {
    const content = readConstantsFile();
    const count = countArrayItems(content, "AUTOMATION_TEMPLATES");
    const ok = count === 5;
    return { ok, detail: ok ? undefined : `Expected 5 templates, got ${count}` };
  },
);

/* ------------------------------------------------------------------ */
/* API-level count checks                                              */
/* ------------------------------------------------------------------ */
check(
  'Analytics topCandidates = 5 (label: "top 5 by matchScore")',
  "API Counts",
  async () => {
    const analytics = await fetchJson<{ topCandidates: unknown[] }>("/api/ats/analytics");
    const count = analytics.topCandidates.length;
    const ok = count === 5;
    return { ok, detail: ok ? undefined : `Expected 5 top candidates, got ${count}` };
  },
);

check(
  "Analytics byStage has 7 stages (matches STAGES constant)",
  "API Counts",
  async () => {
    const analytics = await fetchJson<{ byStage: unknown[] }>("/api/ats/analytics");
    const count = analytics.byStage.length;
    const ok = count === 7;
    return { ok, detail: ok ? undefined : `Expected 7 stages in byStage, got ${count}` };
  },
);

check(
  "Analytics hiringFunnel has 6 stages (excludes Rejected)",
  "API Counts",
  async () => {
    const analytics = await fetchJson<{ hiringFunnel: unknown[] }>("/api/ats/analytics");
    const count = analytics.hiringFunnel.length;
    const ok = count === 6;
    return { ok, detail: ok ? undefined : `Expected 6 stages in hiringFunnel (excl. Rejected), got ${count}` };
  },
);

check(
  "Jobs API returns 6 jobs (matches seed)",
  "API Counts",
  async () => {
    const jobs = await fetchJson<unknown[]>("/api/ats/jobs");
    const ok = jobs.length === 6;
    return { ok, detail: ok ? undefined : `Expected 6 jobs, got ${jobs.length}` };
  },
);

check(
  "Candidates API returns 30 candidates (matches seed)",
  "API Counts",
  async () => {
    const candidates = await fetchJson<unknown[]>("/api/ats/candidates");
    const ok = candidates.length === 30;
    return { ok, detail: ok ? undefined : `Expected 30 candidates, got ${candidates.length}` };
  },
);

check(
  "Applications API returns 40 applications (matches seed)",
  "API Counts",
  async () => {
    const apps = await fetchJson<unknown[]>("/api/ats/applications");
    const ok = apps.length === 40;
    return { ok, detail: ok ? undefined : `Expected 40 applications, got ${apps.length}` };
  },
);

check(
  "Automations API returns 5 automations (matches seed)",
  "API Counts",
  async () => {
    const automations = await fetchJson<unknown[]>("/api/ats/automations");
    const ok = automations.length === 5;
    return { ok, detail: ok ? undefined : `Expected 5 automations, got ${automations.length}` };
  },
);

/* ------------------------------------------------------------------ */
/* UI-level count checks (require browser)                             */
/* ------------------------------------------------------------------ */
check(
  'AI Tools section shows 5 tool cards (label: "5 AI tools")',
  "UI Counts",
  async ({ page }) => {
    await page.goto(BASE);
    await page.waitForLoadState("networkidle");
    await goToSection(page, "AI Tools");

    // The 5 AI tool cards: Resume Parser, JD Generator, Interview Questions, Email Drafter, Offer Letter
    const toolNames = [
      "Resume Parser & Scorer",
      "Job Description Generator",
      "Interview Question Generator",
      "Email Drafter",
      "Offer Letter Generator",
    ];
    const missing: string[] = [];
    for (const name of toolNames) {
      const visible = await page.getByText(name).first().isVisible().catch(() => false);
      if (!visible) missing.push(name);
    }
    return {
      ok: missing.length === 0,
      detail: missing.length ? `Missing: ${missing.join(", ")}` : undefined,
    };
  },
);

check(
  'Dashboard shows 4 KPI cards (Active Jobs, Open Apps, Interviews, Hires)',
  "UI Counts",
  async ({ page }) => {
    // Navigate to Dashboard (in case we're on another section)
    await page.getByRole("button", { name: "Dashboard", exact: true }).click();
    await page.waitForTimeout(2000);

    const kpiLabels = ["Active Jobs", "Open Applications", "Interviews This Week", "Hires This Month"];
    const missing: string[] = [];
    for (const label of kpiLabels) {
      const visible = await page.getByText(label).first().isVisible().catch(() => false);
      if (!visible) missing.push(label);
    }
    return {
      ok: missing.length === 0,
      detail: missing.length ? `Missing KPIs: ${missing.join(", ")}` : undefined,
    };
  },
);

check(
  "Dashboard shows 5 Top Performers",
  "UI Counts",
  async ({ page }) => {
    // Make sure we're on Dashboard
    await page.getByRole("button", { name: "Dashboard", exact: true }).click();
    await page.waitForTimeout(2000);

    // Wait for the Top Performers card to load
    await page.getByText("Top Performers").first().waitFor({ timeout: 15_000 });
    await page.waitForTimeout(2000);

    // Count <li> elements that contain a <button> with a score badge.
    // Top Performer buttons have a span with a score (2-digit number) as the
    // last text child. We count li > button elements that contain a number 0-99.
    const performerCount = await page.evaluate(() => {
      const lis = document.querySelectorAll("main li");
      let count = 0;
      for (const li of lis) {
        const btn = li.querySelector("button");
        if (!btn) continue;
        // Check if the button has a score badge (a span with just a 2-digit number)
        const spans = btn.querySelectorAll("span");
        for (const span of spans) {
          const text = span.textContent?.trim();
          if (text && /^\d{1,3}$/.test(text)) {
            count++;
            break;
          }
        }
      }
      return count;
    });

    const ok = performerCount === 5;
    return {
      ok,
      detail: ok ? undefined : `Expected 5 Top Performers, got ${performerCount}`,
    };
  },
);

check(
  "Pipeline shows 7 columns (Applied, Screening, Interview, Assessment, Offer, Hired, Rejected)",
  "UI Counts",
  async ({ page }) => {
    await goToSection(page, "Pipeline");
    await page.waitForTimeout(1500);

    const stageLabels = [
      "Applied",
      "Screening",
      "Interview",
      "Assessment",
      "Offer",
      "Hired",
      "Rejected",
    ];
    const missing: string[] = [];
    for (const label of stageLabels) {
      // Each column has an aria-label like "Applied column with N applications"
      const found = await page.locator(`[aria-label^="${label} column"]`).count();
      if (found === 0) missing.push(label);
    }
    return {
      ok: missing.length === 0,
      detail: missing.length ? `Missing columns: ${missing.join(", ")}` : undefined,
    };
  },
);

check(
  "Candidate Profile Dialog has 5 tabs (AI Summary, Stage History, Interviews, Communications, Notes)",
  "UI Counts",
  async ({ page }) => {
    await goToSection(page, "Pipeline");
    await page.waitForTimeout(1500);
    // Click first candidate card
    await page.getByRole("button", { name: /Application from/ }).first().click();
    await page.waitForTimeout(1000);

    const tabNames = ["AI Summary", "Stage History", "Interviews", "Communications", "Notes"];
    const missing: string[] = [];
    for (const tab of tabNames) {
      const found = await page.getByRole("tab", { name: tab }).count();
      if (found === 0) missing.push(tab);
    }
    return {
      ok: missing.length === 0,
      detail: missing.length ? `Missing tabs: ${missing.join(", ")}` : undefined,
    };
  },
);

check(
  "Settings has 5 tabs (Company, Hiring Stages, Integrations, AI, Notifications)",
  "UI Counts",
  async ({ page }) => {
    await page.goto(BASE);
    await page.waitForLoadState("networkidle");
    await goToSection(page, "Settings");

    const tabNames = ["Company", "Hiring Stages", "Integrations", "AI", "Notifications"];
    const missing: string[] = [];
    for (const tab of tabNames) {
      const found = await page.getByRole("tab", { name: tab }).count();
      if (found === 0) missing.push(tab);
    }
    return {
      ok: missing.length === 0,
      detail: missing.length ? `Missing tabs: ${missing.join(", ")}` : undefined,
    };
  },
);

check(
  "Jobs section has 5 status tabs (All, Open, Paused, Draft, Closed)",
  "UI Counts",
  async ({ page }) => {
    await goToSection(page, "Jobs");

    const tabNames = ["All", "Open", "Paused", "Draft", "Closed"];
    const missing: string[] = [];
    for (const tab of tabNames) {
      const found = await page.getByRole("tab", { name: tab, exact: true }).count();
      if (found === 0) missing.push(tab);
    }
    return {
      ok: missing.length === 0,
      detail: missing.length ? `Missing tabs: ${missing.join(", ")}` : undefined,
    };
  },
);

check(
  "Automations Quick Templates shows 5 templates",
  "UI Counts",
  async ({ page }) => {
    await goToSection(page, "Automations");

    // Count "Enable" buttons in the Quick Templates section
    // (each template has an Enable button)
    const enableButtons = page.getByRole("button", { name: "Enable" });
    const count = await enableButtons.count();
    const ok = count === 5;
    return { ok, detail: ok ? undefined : `Expected 5 Enable buttons, got ${count}` };
  },
);

check(
  "Settings Integrations shows 6 integration cards",
  "UI Counts",
  async ({ page }) => {
    await goToSection(page, "Settings");
    await page.getByRole("tab", { name: "Integrations" }).click();
    await page.waitForTimeout(500);

    const integrations = [
      "LinkedIn Recruiter",
      "Indeed Employer",
      "ZipRecruiter",
      "Slack",
      "Gmail / Google Workspace",
      "Google Calendar",
    ];
    const missing: string[] = [];
    for (const name of integrations) {
      const found = await page.getByText(name).count();
      if (found === 0) missing.push(name);
    }
    return {
      ok: missing.length === 0,
      detail: missing.length ? `Missing integrations: ${missing.join(", ")}` : undefined,
    };
  },
);

check(
  "Settings Notifications shows 8 event rows",
  "UI Counts",
  async ({ page }) => {
    await page.getByRole("tab", { name: "Notifications" }).click();
    await page.waitForTimeout(500);

    const events = [
      "New application received",
      "Application moved to Interview stage",
      "Application moved to Offer stage",
      "Interview scheduled",
      "Interview feedback submitted",
      "Offer accepted",
      "Offer declined",
      "Candidate no-response 5 days",
    ];
    const missing: string[] = [];
    for (const event of events) {
      const found = await page.getByText(event).count();
      if (found === 0) missing.push(event);
    }
    return {
      ok: missing.length === 0,
      detail: missing.length ? `Missing events: ${missing.join(", ")}` : undefined,
    };
  },
);

check(
  "ATS Compare feature matrix has 8 competitor columns",
  "UI Counts",
  async ({ page }) => {
    await goToSection(page, "ATS Compare");

    // The feature matrix should have columns for: TalentForge, Workday, Greenhouse, Lever, iCIMS, BambooHR, SmartRecruiters, JazzHR
    const competitors = [
      "TalentForge",
      "Workday",
      "Greenhouse",
      "Lever",
      "iCIMS",
      "BambooHR",
      "SmartRecruiters",
      "JazzHR",
    ];
    const missing: string[] = [];
    for (const name of competitors) {
      const found = await page.getByText(name, { exact: false }).count();
      if (found === 0) missing.push(name);
    }
    return {
      ok: missing.length === 0,
      detail: missing.length ? `Missing competitors: ${missing.join(", ")}` : undefined,
    };
  },
);

/* ------------------------------------------------------------------ */
/* Run all checks                                                      */
/* ------------------------------------------------------------------ */
async function main() {
  console.log("\n🔢 TalentForge ATS — Count Things Test\n");
  console.log("=".repeat(60));
  console.log('Verifies every list/grid labeled "Top N" actually contains N items.\n');

  let passed = 0;
  let failed = 0;
  const failures: Array<{ name: string; category: string; detail?: string }> = [];

  // Launch ONE browser instance for all UI checks
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(BASE, { waitUntil: "domcontentloaded", timeout: 30_000 });
  await page.waitForTimeout(3000); // Give React time to hydrate

  // Group by category
  const categories = [...new Set(checks.map((c) => c.category))];

  for (const category of categories) {
    console.log(`\n${category}`);
    console.log("-".repeat(60));

    for (const c of checks.filter((c) => c.category === category)) {
      process.stdout.write(`  ${c.name}... `);
      try {
        const result = await c.run({ browser, page });
        if (result.ok) {
          console.log("✅");
          passed++;
        } else {
          console.log("❌");
          console.log(`     ${result.detail ?? "(no detail)"}`);
          failed++;
          failures.push({ name: c.name, category: c.category, detail: result.detail });
        }
      } catch (e) {
        console.log("💥");
        console.log(`     ${(e as Error).message}`);
        failed++;
        failures.push({ name: c.name, category: c.category, detail: (e as Error).message });
      }
    }
  }

  await browser.close();

  console.log("\n" + "=".repeat(60));
  console.log(`\nResults: ${passed} passed, ${failed} failed, ${checks.length} total\n`);

  if (failed > 0) {
    console.log("Failures:");
    for (const f of failures) {
      console.log(`  ❌ [${f.category}] ${f.name}`);
      if (f.detail) console.log(`     ${f.detail}`);
    }
    console.log("");
    process.exit(1);
  } else {
    console.log("✅ All counts match their labels.\n");
    process.exit(0);
  }
}

main();
