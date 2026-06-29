#!/usr/bin/env bun
/**
 * UI-vs-API Reconciliation Script
 *
 * Runs after every build to catch "hardcoded value pretending to be real data" bugs.
 * For each value displayed in the UI, fetches the corresponding API field and
 * asserts they match.
 *
 * Usage:
 *   bun scripts/reconcile.ts
 *
 * Exit code 0 = all checks passed
 * Exit code 1 = one or more checks failed (prints details)
 */
import { chromium } from "@playwright/test";

const BASE = "http://localhost:3000";

type Check = {
  name: string;
  category: string;
  run: () => Promise<{ ok: boolean; detail?: string }>;
};

const checks: Check[] = [];

function check(name: string, category: string, fn: () => Promise<{ ok: boolean; detail?: string }>) {
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

/* ------------------------------------------------------------------ */
/* Dashboard KPIs vs Analytics API                                     */
/* ------------------------------------------------------------------ */
check(
  "Dashboard Active Jobs KPI matches API totalJobs",
  "Dashboard",
  async () => {
    const analytics = await fetchJson<{ totalJobs: number }>("/api/ats/analytics");
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto(BASE);
    await page.waitForLoadState("networkidle");
    // Click Dashboard
    await page.getByRole("button", { name: "Dashboard", exact: true }).click();
    const card = page.locator("text=Active Jobs").locator("..");
    const text = await card.innerText();
    await browser.close();
    const ok = text.includes(String(analytics.totalJobs));
    return { ok, detail: ok ? undefined : `UI="${text}" API=${analytics.totalJobs}` };
  },
);

check(
  "Dashboard Open Applications KPI matches API totalApps",
  "Dashboard",
  async () => {
    const analytics = await fetchJson<{ totalApps: number }>("/api/ats/analytics");
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto(BASE);
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: "Dashboard", exact: true }).click();
    const card = page.locator("text=Open Applications").locator("..");
    const text = await card.innerText();
    await browser.close();
    const ok = text.includes(String(analytics.totalApps));
    return { ok, detail: ok ? undefined : `UI="${text}" API=${analytics.totalApps}` };
  },
);

check(
  "Dashboard Hires This Month KPI matches API hiresThisMonth",
  "Dashboard",
  async () => {
    const analytics = await fetchJson<{ hiresThisMonth: number }>("/api/ats/analytics");
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto(BASE);
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: "Dashboard", exact: true }).click();
    const card = page.locator("text=Hires This Month").locator("..");
    const text = await card.innerText();
    await browser.close();
    const ok = text.includes(String(analytics.hiresThisMonth));
    return { ok, detail: ok ? undefined : `UI="${text}" API=${analytics.hiresThisMonth}` };
  },
);

/* ------------------------------------------------------------------ */
/* Analytics KPIs vs API (catches hardcoded $3,250 / 92% / 4.3/5)     */
/* ------------------------------------------------------------------ */
check(
  "Analytics Cost per Hire matches API (not hardcoded)",
  "Analytics",
  async () => {
    const analytics = await fetchJson<{ costPerHire: number }>("/api/ats/analytics");
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto(BASE);
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: "Analytics", exact: true }).click();
    await page.waitForTimeout(1000);
    const card = page.locator("text=Cost per Hire").locator("..");
    const text = await card.innerText();
    await browser.close();
    const expected = `$${analytics.costPerHire.toLocaleString()}`;
    const ok = text.includes(expected);
    return { ok, detail: ok ? undefined : `UI="${text}" expected="${expected}"` };
  },
);

check(
  "Analytics Offer Acceptance matches API (not hardcoded 92%)",
  "Analytics",
  async () => {
    const analytics = await fetchJson<{ offerAcceptanceRate: number }>("/api/ats/analytics");
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto(BASE);
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: "Analytics", exact: true }).click();
    await page.waitForTimeout(1000);
    const card = page.locator("text=Offer Acceptance").locator("..");
    const text = await card.innerText();
    await browser.close();
    const expected = `${analytics.offerAcceptanceRate}%`;
    const ok = text.includes(expected);
    return { ok, detail: ok ? undefined : `UI="${text}" expected="${expected}"` };
  },
);

check(
  "Analytics Quality of Hire matches API (not hardcoded 4.3/5)",
  "Analytics",
  async () => {
    const analytics = await fetchJson<{ qualityOfHire: number }>("/api/ats/analytics");
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto(BASE);
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: "Analytics", exact: true }).click();
    await page.waitForTimeout(1000);
    const card = page.locator("text=Quality of Hire").locator("..");
    const text = await card.innerText();
    await browser.close();
    const expected = `${analytics.qualityOfHire.toFixed(1)}/5`;
    const ok = text.includes(expected);
    return { ok, detail: ok ? undefined : `UI="${text}" expected="${expected}"` };
  },
);

/* ------------------------------------------------------------------ */
/* Pipeline column counts vs API byStageRecord                         */
/* ------------------------------------------------------------------ */
check(
  "Pipeline column counts match API byStageRecord",
  "Pipeline",
  async () => {
    const analytics = await fetchJson<{ byStageRecord: Record<string, number> }>(
      "/api/ats/analytics",
    );
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto(BASE);
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: "Pipeline", exact: true }).click();
    await page.waitForTimeout(1500);

    const expected: Record<string, number> = analytics.byStageRecord;
    const stageLabels: Record<string, string> = {
      applied: "Applied",
      screen: "Screening",
      interview: "Interview",
      assessment: "Assessment",
      offer: "Offer",
      hired: "Hired",
      rejected: "Rejected",
    };

    const mismatches: string[] = [];
    for (const [stage, count] of Object.entries(expected)) {
      const label = stageLabels[stage] ?? stage;
      const expectedAriaLabel = `${label} column with ${count} applications`;
      // Check the aria-label attribute on the droppable container
      const el = page.locator(`[aria-label="${expectedAriaLabel}"]`);
      const found = (await el.count()) > 0;
      if (!found) {
        mismatches.push(`expected aria-label "${expectedAriaLabel}"`);
      }
    }
    await browser.close();
    return {
      ok: mismatches.length === 0,
      detail: mismatches.length ? mismatches.join("; ") : undefined,
    };
  },
);

/* ------------------------------------------------------------------ */
/* TOP_100_ATS count = 100                                             */
/* ------------------------------------------------------------------ */
check(
  "TOP_100_ATS array contains exactly 100 items",
  "ATS Compare",
  async () => {
    // Read the constants file directly
    const fs = await import("fs");
    const path = await import("path");
    const content = fs.readFileSync(
      path.join(process.cwd(), "src/lib/ats/constants.ts"),
      "utf-8",
    );
    const match = content.match(/TOP_100_ATS:\s*string\[\]\s*=\s*\[(.*?)\]/s);
    if (!match) {
      return { ok: false, detail: "TOP_100_ATS array not found in constants.ts" };
    }
    const items = match[1].match(/"([^"]+)"/g) ?? [];
    const count = items.length;

    // Check duplicates
    const names = items.map((s) => s.replace(/"/g, ""));
    const dupes = names.filter((n, i) => names.indexOf(n) !== i);

    return {
      ok: count === 100 && dupes.length === 0,
      detail:
        count === 100 && dupes.length === 0
          ? undefined
          : `count=${count} duplicates=${dupes.length ? dupes.join(", ") : "none"}`,
    };
  },
);

/* ------------------------------------------------------------------ */
/* No Math.random in component source (catches non-deterministic renders)  */
/* Excludes: library files (src/components/ui/*), useMemo-wrapped (stable) */
/* ------------------------------------------------------------------ */
check(
  "No Math.random in app source (excludes library files, allows useMemo-wrapped)",
  "Source Code",
  async () => {
    const fs = await import("fs");
    const path = await import("path");

    function walk(dir: string, results: string[] = []): string[] {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const e of entries) {
        const full = path.join(dir, e.name);
        if (e.isDirectory()) {
          if (e.name === "node_modules" || e.name === ".next" || e.name === "tests") continue;
          walk(full, results);
        } else if (e.name.endsWith(".tsx") || e.name.endsWith(".ts")) {
          results.push(full);
        }
      }
      return results;
    }

    const files = walk("src").filter((f) => !f.includes("src/components/ui/"));
    const offenders: string[] = [];
    for (const file of files) {
      const content = fs.readFileSync(file, "utf-8");
      const lines = content.split("\n");
      lines.forEach((line, i) => {
        const trimmed = line.trim();
        if (trimmed.startsWith("//") || trimmed.startsWith("*")) return;
        if (line.includes("Math.random(")) {
          // Check if it's inside a useMemo/useCallback/useState initializer (stable across renders)
          // Look at the 5 lines above for useMemo( or useState(
          const context = lines.slice(Math.max(0, i - 5), i).join("\n");
          const isStable =
            /useMemo\(|useCallback\(|useState\(/.test(context);
          if (!isStable) {
            offenders.push(`${file}:${i + 1}: ${trimmed}`);
          }
        }
      });
    }
    return {
      ok: offenders.length === 0,
      detail: offenders.length ? offenders.join("\n  ") : undefined,
    };
  },
);

/* ------------------------------------------------------------------ */
/* Jobs API count matches DB count (sanity check)                      */
/* ------------------------------------------------------------------ */
check(
  "Jobs API returns all 6 seeded jobs",
  "Data Integrity",
  async () => {
    const jobs = await fetchJson<Array<{ title: string; status: string }>>("/api/ats/jobs");
    const ok = jobs.length === 6;
    return {
      ok,
      detail: ok ? undefined : `Expected 6 jobs, got ${jobs.length}: ${jobs.map((j) => j.title).join(", ")}`,
    };
  },
);

check(
  "Candidates API returns all 30 seeded candidates",
  "Data Integrity",
  async () => {
    const candidates = await fetchJson<unknown[]>("/api/ats/candidates");
    const ok = candidates.length === 30;
    return { ok, detail: ok ? undefined : `Expected 30, got ${candidates.length}` };
  },
);

check(
  "Applications API returns all 40 seeded applications",
  "Data Integrity",
  async () => {
    const apps = await fetchJson<unknown[]>("/api/ats/applications");
    const ok = apps.length === 40;
    return { ok, detail: ok ? undefined : `Expected 40, got ${apps.length}` };
  },
);

/* ------------------------------------------------------------------ */
/* Run all checks                                                      */
/* ------------------------------------------------------------------ */
async function main() {
  console.log("\n🔍 TalentForge ATS — UI/API Reconciliation\n");
  console.log("=".repeat(60));

  let passed = 0;
  let failed = 0;
  const failures: Array<{ name: string; category: string; detail?: string }> = [];

  // Group by category
  const categories = [...new Set(checks.map((c) => c.category))];

  for (const category of categories) {
    console.log(`\n${category}`);
    console.log("-".repeat(60));

    for (const c of checks.filter((c) => c.category === category)) {
      process.stdout.write(`  ${c.name}... `);
      try {
        const result = await c.run();
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
    console.log("✅ All reconciliation checks passed.\n");
    process.exit(0);
  }
}

main();
