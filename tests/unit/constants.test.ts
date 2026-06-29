import { describe, test, expect } from "vitest";
import {
  STAGES,
  SOURCES,
  EMPLOYMENT_TYPES,
  JOB_STATUSES,
  PRIORITIES,
  TRIGGER_TYPES,
  ACTION_TYPES,
  AUTOMATION_TEMPLATES,
  COMPETITORS,
  FEATURE_MATRIX,
  PARITY_DIMENSIONS,
  TOP_100_ATS,
  TALENTFORGE_PARITY,
  INDUSTRY_AVERAGE_PARITY,
  STAGE_LABELS,
  SOURCE_LABELS,
  ACTIVE_STAGES,
  scoreColor,
  scoreTextColor,
  scoreBarColor,
  featureCellSymbol,
} from "@/lib/ats/constants";

/* ------------------------------------------------------------------ */
/* STAGES                                                              */
/* ------------------------------------------------------------------ */
describe("STAGES", () => {
  test("has exactly 7 stages", () => {
    expect(STAGES).toHaveLength(7);
  });

  test("has correct stage IDs in order", () => {
    expect(STAGES.map((s) => s.id)).toEqual([
      "applied", "screen", "interview", "assessment", "offer", "hired", "rejected",
    ]);
  });

  test("every stage has required fields", () => {
    for (const stage of STAGES) {
      expect(stage.id).toBeTruthy();
      expect(stage.label).toBeTruthy();
      expect(stage.color).toBeTruthy();
      expect(stage.tailwindBg).toBeTruthy();
      expect(stage.tailwindText).toBeTruthy();
      expect(stage.tailwindBorder).toBeTruthy();
    }
  });

  test("STAGE_LABELS matches STAGES", () => {
    for (const stage of STAGES) {
      expect(STAGE_LABELS[stage.id]).toBe(stage.label);
    }
  });

  test("ACTIVE_STAGES excludes rejected", () => {
    expect(ACTIVE_STAGES).toHaveLength(6);
    expect(ACTIVE_STAGES).not.toContain("rejected");
  });
});

/* ------------------------------------------------------------------ */
/* SOURCES                                                             */
/* ------------------------------------------------------------------ */
describe("SOURCES", () => {
  test("has exactly 6 sources", () => {
    expect(SOURCES).toHaveLength(6);
  });

  test("has expected source IDs", () => {
    expect(SOURCES.map((s) => s.id).sort()).toEqual(
      ["agency", "direct", "indeed", "job_board", "linkedin", "referral"].sort(),
    );
  });

  test("every source has label, icon, and color", () => {
    for (const source of SOURCES) {
      expect(source.label).toBeTruthy();
      expect(source.icon).toBeTruthy();
      expect(source.color).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  test("SOURCE_LABELS matches SOURCES", () => {
    for (const source of SOURCES) {
      expect(SOURCE_LABELS[source.id]).toBe(source.label);
    }
  });
});

/* ------------------------------------------------------------------ */
/* FEATURE_MATRIX                                                      */
/* ------------------------------------------------------------------ */
describe("FEATURE_MATRIX", () => {
  test("has exactly 15 features (label says '15 capability categories')", () => {
    expect(FEATURE_MATRIX).toHaveLength(15);
  });

  test("every row has all 8 competitor columns", () => {
    const requiredColumns = [
      "talentforge", "workday", "greenhouse", "lever",
      "icims", "bamboohr", "smartrecruiters", "jazzhr",
    ];
    for (const row of FEATURE_MATRIX) {
      for (const col of requiredColumns) {
        expect(row[col as keyof typeof row]).toBeDefined();
      }
    }
  });

  test("every value is 'full', 'partial', or 'none'", () => {
    for (const row of FEATURE_MATRIX) {
      const columns = ["talentforge", "workday", "greenhouse", "lever", "icims", "bamboohr", "smartrecruiters", "jazzhr"];
      for (const col of columns) {
        const value = row[col as keyof typeof row];
        expect(["full", "partial", "none"]).toContain(value);
      }
    }
  });

  test("TalentForge has 'full' for all AI features", () => {
    const aiFeatures = FEATURE_MATRIX.filter((row) =>
      row.feature.toLowerCase().includes("ai"),
    );
    for (const row of aiFeatures) {
      expect(row.talentforge).toBe("full");
    }
  });

  test("TalentForge is the only one with 'full' for Zero-Token AI Pricing", () => {
    const zeroTokenRow = FEATURE_MATRIX.find(
      (row) => row.feature === "Zero-Token AI Pricing",
    );
    expect(zeroTokenRow).toBeDefined();
    expect(zeroTokenRow?.talentforge).toBe("full");
    expect(zeroTokenRow?.workday).toBe("none");
    expect(zeroTokenRow?.greenhouse).toBe("none");
    expect(zeroTokenRow?.lever).toBe("none");
    expect(zeroTokenRow?.icims).toBe("none");
    expect(zeroTokenRow?.bamboohr).toBe("none");
    expect(zeroTokenRow?.smartrecruiters).toBe("none");
    expect(zeroTokenRow?.jazzhr).toBe("none");
  });
});

/* ------------------------------------------------------------------ */
/* COMPETITORS                                                         */
/* ------------------------------------------------------------------ */
describe("COMPETITORS", () => {
  test("has exactly 8 competitors", () => {
    expect(COMPETITORS).toHaveLength(8);
  });

  test("includes TalentForge + 7 competitors", () => {
    const ids = COMPETITORS.map((c) => c.id);
    expect(ids).toContain("talentforge");
    expect(ids).toContain("workday");
    expect(ids).toContain("greenhouse");
    expect(ids).toContain("lever");
    expect(ids).toContain("icims");
    expect(ids).toContain("bamboohr");
    expect(ids).toContain("smartrecruiters");
    expect(ids).toContain("jazzhr");
  });
});

/* ------------------------------------------------------------------ */
/* PARITY_DIMENSIONS + parity scores                                   */
/* ------------------------------------------------------------------ */
describe("PARITY_DIMENSIONS", () => {
  test("has exactly 8 dimensions (label says '8 strategic dimensions')", () => {
    expect(PARITY_DIMENSIONS).toHaveLength(8);
  });

  test("TALENTFORGE_PARITY has 8 values", () => {
    expect(TALENTFORGE_PARITY).toHaveLength(8);
  });

  test("INDUSTRY_AVERAGE_PARITY has 8 values", () => {
    expect(INDUSTRY_AVERAGE_PARITY).toHaveLength(8);
  });

  test("TalentForge scores higher than industry average on AI-related dimensions", () => {
    // TalentForge should beat industry average on AI Depth (0), Automation (1), and Pricing Transparency (7)
    expect(TALENTFORGE_PARITY[0]).toBeGreaterThan(INDUSTRY_AVERAGE_PARITY[0]); // AI Depth
    expect(TALENTFORGE_PARITY[1]).toBeGreaterThan(INDUSTRY_AVERAGE_PARITY[1]); // Automation
    expect(TALENTFORGE_PARITY[7]).toBeGreaterThan(INDUSTRY_AVERAGE_PARITY[7]); // Pricing Transparency
    // Integrations (4) is the one area where industry average may be higher (TalentForge is new)
  });

  test("all parity scores are between 0 and 100", () => {
    for (const score of TALENTFORGE_PARITY) {
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    }
    for (const score of INDUSTRY_AVERAGE_PARITY) {
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    }
  });
});

/* ------------------------------------------------------------------ */
/* TOP_100_ATS                                                         */
/* ------------------------------------------------------------------ */
describe("TOP_100_ATS", () => {
  test("has exactly 100 items (label says 'top 100 ATS platforms')", () => {
    expect(TOP_100_ATS).toHaveLength(100);
  });

  test("has no duplicates", () => {
    const unique = new Set(TOP_100_ATS);
    expect(unique.size).toBe(100);
  });

  test("includes well-known ATS platforms", () => {
    expect(TOP_100_ATS).toContain("Workday Recruiting");
    expect(TOP_100_ATS).toContain("Greenhouse");
    expect(TOP_100_ATS).toContain("Lever");
    expect(TOP_100_ATS).toContain("BambooHR");
  });
});

/* ------------------------------------------------------------------ */
/* AUTOMATION_TEMPLATES                                                */
/* ------------------------------------------------------------------ */
describe("AUTOMATION_TEMPLATES", () => {
  test("has exactly 5 templates", () => {
    expect(AUTOMATION_TEMPLATES).toHaveLength(5);
  });

  test("every template has required fields", () => {
    for (const t of AUTOMATION_TEMPLATES) {
      expect(t.name).toBeTruthy();
      expect(t.description).toBeTruthy();
      expect(t.trigger).toBeTruthy();
      expect(t.triggerConfig).toBeDefined();
      expect(t.action).toBeTruthy();
      expect(t.actionConfig).toBeDefined();
    }
  });

  test("triggers and actions use valid types", () => {
    const validTriggers = TRIGGER_TYPES.map((t) => t.id);
    const validActions = ACTION_TYPES.map((a) => a.id);
    for (const t of AUTOMATION_TEMPLATES) {
      expect(validTriggers).toContain(t.trigger);
      expect(validActions).toContain(t.action);
    }
  });
});

/* ------------------------------------------------------------------ */
/* Enum constants                                                      */
/* ------------------------------------------------------------------ */
describe("Enum constants", () => {
  test("EMPLOYMENT_TYPES has 5 types", () => {
    expect(EMPLOYMENT_TYPES).toHaveLength(5);
    expect(EMPLOYMENT_TYPES).toContain("Full-time");
    expect(EMPLOYMENT_TYPES).toContain("Part-time");
    expect(EMPLOYMENT_TYPES).toContain("Contract");
    expect(EMPLOYMENT_TYPES).toContain("Temp");
    expect(EMPLOYMENT_TYPES).toContain("Internship");
  });

  test("JOB_STATUSES has 4 statuses", () => {
    expect(JOB_STATUSES).toHaveLength(4);
    expect(JOB_STATUSES).toEqual(["draft", "open", "paused", "closed"]);
  });

  test("PRIORITIES has 4 levels", () => {
    expect(PRIORITIES).toHaveLength(4);
    expect(PRIORITIES).toEqual(["low", "medium", "high", "critical"]);
  });

  test("TRIGGER_TYPES has 4 types", () => {
    expect(TRIGGER_TYPES).toHaveLength(4);
  });

  test("ACTION_TYPES has 5 types", () => {
    expect(ACTION_TYPES).toHaveLength(5);
  });
});

/* ------------------------------------------------------------------ */
/* Helper functions                                                    */
/* ------------------------------------------------------------------ */
describe("scoreColor", () => {
  test("returns emerald for scores >= 75", () => {
    expect(scoreColor(75)).toContain("emerald");
    expect(scoreColor(100)).toContain("emerald");
  });

  test("returns amber for scores 50-74", () => {
    expect(scoreColor(50)).toContain("amber");
    expect(scoreColor(74)).toContain("amber");
  });

  test("returns rose for scores < 50", () => {
    expect(scoreColor(49)).toContain("rose");
    expect(scoreColor(0)).toContain("rose");
  });
});

describe("scoreTextColor", () => {
  test("returns emerald for scores >= 75", () => {
    expect(scoreTextColor(75)).toContain("emerald");
  });
});

describe("scoreBarColor", () => {
  test("returns emerald-500 for scores >= 75", () => {
    expect(scoreBarColor(75)).toBe("bg-emerald-500");
  });
});

describe("featureCellSymbol", () => {
  test("returns checkmark for 'full'", () => {
    const result = featureCellSymbol("full");
    expect(result.symbol).toBe("✓");
    expect(result.className).toContain("emerald");
  });

  test("returns tilde for 'partial'", () => {
    const result = featureCellSymbol("partial");
    expect(result.symbol).toBe("~");
    expect(result.className).toContain("amber");
  });

  test("returns X for 'none'", () => {
    const result = featureCellSymbol("none");
    expect(result.symbol).toBe("✗");
    expect(result.className).toContain("rose");
  });
});
