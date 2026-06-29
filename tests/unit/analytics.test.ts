import { describe, test, expect } from "vitest";
import {
  computeAvgMatchScore,
  computeBySource,
  computeByStage,
  computeCostPerHire,
  computeFunnelConversion,
  computeHiresThisMonth,
  computeHiringFunnel,
  computeOfferAcceptanceRate,
  computeQualityOfHire,
  computeTimeToHireAvgDays,
  computeTopCandidates,
  SOURCE_COST_PER_HIRE,
  STAGE_ORDER,
  type RawApplication,
  type RawInterview,
  type RawOffer,
} from "@/lib/ats/analytics";

/* ------------------------------------------------------------------ */
/* Test fixtures                                                       */
/* ------------------------------------------------------------------ */
function makeApp(overrides: Partial<RawApplication> = {}): RawApplication {
  return {
    id: `app-${Math.random().toString(36).slice(2)}`,
    stage: "applied",
    matchScore: 50,
    source: "linkedin",
    appliedAt: new Date("2026-01-01"),
    stageUpdatedAt: new Date("2026-01-05"),
    hiredAt: null,
    candidate: { fullName: "Test Candidate", currentTitle: "Engineer" },
    job: { department: "Engineering", hiringManager: "Test HM" },
    ...overrides,
  };
}

/* ------------------------------------------------------------------ */
/* computeByStage                                                      */
/* ------------------------------------------------------------------ */
describe("computeByStage", () => {
  test("returns all 7 stages in order, even if empty", () => {
    const result = computeByStage([]);
    expect(result.byStage).toHaveLength(7);
    expect(result.byStage.map((s) => s.stage)).toEqual([...STAGE_ORDER]);
    expect(result.byStage.every((s) => s.count === 0)).toBe(true);
  });

  test("counts applications per stage correctly", () => {
    const apps = [
      makeApp({ stage: "applied" }),
      makeApp({ stage: "applied" }),
      makeApp({ stage: "screen" }),
      makeApp({ stage: "hired" }),
      makeApp({ stage: "rejected" }),
    ];
    const { byStage, byStageRecord } = computeByStage(apps);
    expect(byStageRecord.applied).toBe(2);
    expect(byStageRecord.screen).toBe(1);
    expect(byStageRecord.hired).toBe(1);
    expect(byStageRecord.rejected).toBe(1);
    expect(byStage.find((s) => s.stage === "applied")?.count).toBe(2);
  });

  test("handles unknown stage gracefully (not counted in known stages)", () => {
    const apps = [makeApp({ stage: "unknown_stage" as never })];
    const { byStageRecord } = computeByStage(apps);
    // Unknown stage goes into the record but not the ordered array
    expect(byStageRecord.unknown_stage).toBe(1);
    expect(byStageRecord.applied).toBe(0);
  });
});

/* ------------------------------------------------------------------ */
/* computeBySource                                                     */
/* ------------------------------------------------------------------ */
describe("computeBySource", () => {
  test("returns empty array for no apps", () => {
    expect(computeBySource([])).toEqual([]);
  });

  test("counts applications and hires per source", () => {
    const apps = [
      makeApp({ source: "linkedin", stage: "applied" }),
      makeApp({ source: "linkedin", stage: "hired" }),
      makeApp({ source: "referral", stage: "hired" }),
      makeApp({ source: "referral", stage: "rejected" }),
    ];
    const result = computeBySource(apps);
    expect(result).toHaveLength(2);

    const linkedin = result.find((s) => s.source === "linkedin");
    expect(linkedin?.applications).toBe(2);
    expect(linkedin?.hires).toBe(1);

    const referral = result.find((s) => s.source === "referral");
    expect(referral?.applications).toBe(2);
    expect(referral?.hires).toBe(1);
  });
});

/* ------------------------------------------------------------------ */
/* computeAvgMatchScore                                                */
/* ------------------------------------------------------------------ */
describe("computeAvgMatchScore", () => {
  test("returns 0 for empty array", () => {
    expect(computeAvgMatchScore([])).toBe(0);
  });

  test("returns rounded average", () => {
    const apps = [
      makeApp({ matchScore: 50 }),
      makeApp({ matchScore: 75 }),
      makeApp({ matchScore: 80 }),
    ];
    // (50 + 75 + 80) / 3 = 68.33 → 68
    expect(computeAvgMatchScore(apps)).toBe(68);
  });

  test("handles single app", () => {
    expect(computeAvgMatchScore([makeApp({ matchScore: 92 })])).toBe(92);
  });
});

/* ------------------------------------------------------------------ */
/* computeHiresThisMonth                                               */
/* ------------------------------------------------------------------ */
describe("computeHiresThisMonth", () => {
  test("returns 0 for empty array", () => {
    expect(computeHiresThisMonth([], new Date("2026-06-15"))).toBe(0);
  });

  test("counts only hires in current month", () => {
    const now = new Date("2026-06-15");
    const apps = [
      makeApp({ hiredAt: new Date("2026-06-01") }), // this month ✓
      makeApp({ hiredAt: new Date("2026-06-30") }), // this month ✓
      makeApp({ hiredAt: new Date("2026-05-31") }), // last month ✗
      makeApp({ hiredAt: null }), // no hire date ✗
    ];
    expect(computeHiresThisMonth(apps, now)).toBe(2);
  });

  test("handles year boundary", () => {
    const now = new Date("2026-01-15");
    const apps = [
      makeApp({ hiredAt: new Date("2026-01-01") }), // this month ✓
      makeApp({ hiredAt: new Date("2025-12-31") }), // last year ✗
    ];
    expect(computeHiresThisMonth(apps, now)).toBe(1);
  });
});

/* ------------------------------------------------------------------ */
/* computeTimeToHireAvgDays                                            */
/* ------------------------------------------------------------------ */
describe("computeTimeToHireAvgDays", () => {
  test("returns 0 for empty array", () => {
    expect(computeTimeToHireAvgDays([])).toBe(0);
  });

  test("computes average days from applied to hired", () => {
    const apps = [
      makeApp({
        appliedAt: new Date("2026-01-01"),
        hiredAt: new Date("2026-01-08"), // 7 days
      }),
      makeApp({
        appliedAt: new Date("2026-01-01"),
        hiredAt: new Date("2026-01-15"), // 14 days
      }),
    ];
    // (7 + 14) / 2 = 10.5 → 11
    expect(computeTimeToHireAvgDays(apps)).toBe(11);
  });

  test("uses now() if hiredAt is null (still in progress)", () => {
    const apps = [
      makeApp({
        appliedAt: new Date(Date.now() - 5 * 86400000), // 5 days ago
        hiredAt: null,
      }),
    ];
    const result = computeTimeToHireAvgDays(apps);
    expect(result).toBeGreaterThanOrEqual(4);
    expect(result).toBeLessThanOrEqual(6);
  });

  test("handles negative (hired before applied) as 0", () => {
    const apps = [
      makeApp({
        appliedAt: new Date("2026-01-10"),
        hiredAt: new Date("2026-01-05"), // 5 days BEFORE applied
      }),
    ];
    expect(computeTimeToHireAvgDays(apps)).toBe(0);
  });
});

/* ------------------------------------------------------------------ */
/* computeHiringFunnel                                                 */
/* ------------------------------------------------------------------ */
describe("computeHiringFunnel", () => {
  test("returns 6 stages (excludes rejected)", () => {
    const funnel = computeHiringFunnel({
      applied: 10, screen: 8, interview: 6, assessment: 4, offer: 2, hired: 3, rejected: 7,
    });
    expect(funnel).toHaveLength(6);
    expect(funnel.find((f) => f.stage === "Rejected")).toBeUndefined();
  });

  test("uses human-readable labels", () => {
    const funnel = computeHiringFunnel({
      applied: 10, screen: 0, interview: 0, assessment: 0, offer: 0, hired: 0, rejected: 0,
    });
    expect(funnel.map((f) => f.stage)).toEqual([
      "Applied", "Screening", "Interview", "Assessment", "Offer", "Hired",
    ]);
  });

  test("maps counts correctly", () => {
    const funnel = computeHiringFunnel({
      applied: 10, screen: 8, interview: 6, assessment: 4, offer: 2, hired: 3, rejected: 7,
    });
    expect(funnel.find((f) => f.stage === "Applied")?.count).toBe(10);
    expect(funnel.find((f) => f.stage === "Hired")?.count).toBe(3);
  });
});

/* ------------------------------------------------------------------ */
/* computeTopCandidates                                                */
/* ------------------------------------------------------------------ */
describe("computeTopCandidates", () => {
  test("returns empty array for no apps", () => {
    expect(computeTopCandidates([])).toEqual([]);
  });

  test("returns top 5 by matchScore, excluding rejected", () => {
    const apps = [
      makeApp({ id: "1", matchScore: 95, stage: "applied", candidate: { fullName: "A", currentTitle: "T1" } }),
      makeApp({ id: "2", matchScore: 90, stage: "screen", candidate: { fullName: "B", currentTitle: "T2" } }),
      makeApp({ id: "3", matchScore: 99, stage: "rejected", candidate: { fullName: "C", currentTitle: "T3" } }), // excluded
      makeApp({ id: "4", matchScore: 85, stage: "interview", candidate: { fullName: "D", currentTitle: "T4" } }),
      makeApp({ id: "5", matchScore: 92, stage: "offer", candidate: { fullName: "E", currentTitle: "T5" } }),
      makeApp({ id: "6", matchScore: 88, stage: "hired", candidate: { fullName: "F", currentTitle: "T6" } }),
      makeApp({ id: "7", matchScore: 80, stage: "assessment", candidate: { fullName: "G", currentTitle: "T7" } }),
    ];
    const result = computeTopCandidates(apps, 5);
    expect(result).toHaveLength(5);
    // Highest score first
    expect(result[0].id).toBe("1"); // 95
    expect(result[1].id).toBe("5"); // 92
    expect(result[2].id).toBe("2"); // 90
    // Rejected (99) should NOT appear
    expect(result.find((c) => c.id === "3")).toBeUndefined();
  });

  test("respects custom limit", () => {
    const apps = Array.from({ length: 10 }, (_, i) =>
      makeApp({ id: String(i), matchScore: 90 - i, stage: "applied" }),
    );
    expect(computeTopCandidates(apps, 3)).toHaveLength(3);
  });

  test("handles null currentTitle", () => {
    const apps = [
      makeApp({ id: "1", matchScore: 95, stage: "applied", candidate: { fullName: "A", currentTitle: null } }),
    ];
    const result = computeTopCandidates(apps);
    expect(result[0].currentTitle).toBe("");
  });
});

/* ------------------------------------------------------------------ */
/* computeOfferAcceptanceRate                                          */
/* ------------------------------------------------------------------ */
describe("computeOfferAcceptanceRate", () => {
  test("returns 0 rate for no offers", () => {
    const result = computeOfferAcceptanceRate([]);
    expect(result.rate).toBe(0);
    expect(result.accepted).toBe(0);
    expect(result.declined).toBe(0);
  });

  test("excludes draft/sent/countered offers from calculation", () => {
    const offers: RawOffer[] = [
      { status: "accepted" },
      { status: "accepted" },
      { status: "declined" },
      { status: "sent" },      // excluded
      { status: "draft" },     // excluded
      { status: "countered" }, // excluded
    ];
    const result = computeOfferAcceptanceRate(offers);
    // 2 accepted / (2 + 1) = 66.67 → 67
    expect(result.rate).toBe(67);
    expect(result.accepted).toBe(2);
    expect(result.declined).toBe(1);
  });

  test("100% when all accepted, no declined", () => {
    const offers: RawOffer[] = [
      { status: "accepted" },
      { status: "accepted" },
    ];
    expect(computeOfferAcceptanceRate(offers).rate).toBe(100);
  });

  test("0% when all declined", () => {
    const offers: RawOffer[] = [{ status: "declined" }];
    expect(computeOfferAcceptanceRate(offers).rate).toBe(0);
  });

  test("50% when equal accepted and declined", () => {
    const offers: RawOffer[] = [
      { status: "accepted" },
      { status: "declined" },
    ];
    expect(computeOfferAcceptanceRate(offers).rate).toBe(50);
  });
});

/* ------------------------------------------------------------------ */
/* computeQualityOfHire                                                */
/* ------------------------------------------------------------------ */
describe("computeQualityOfHire", () => {
  test("returns 0 for no interviews", () => {
    expect(computeQualityOfHire([])).toBe(0);
  });

  test("returns 0 when all ratings are null", () => {
    const interviews: RawInterview[] = [{ rating: null }, { rating: null }];
    expect(computeQualityOfHire(interviews)).toBe(0);
  });

  test("computes average rating rounded to 1 decimal", () => {
    const interviews: RawInterview[] = [
      { rating: 4 },
      { rating: 5 },
      { rating: 4 },
    ];
    // (4 + 5 + 4) / 3 = 4.33 → 4.3
    expect(computeQualityOfHire(interviews)).toBe(4.3);
  });

  test("filters out null ratings", () => {
    const interviews: RawInterview[] = [
      { rating: 4 },
      { rating: null },
      { rating: 5 },
    ];
    // (4 + 5) / 2 = 4.5
    expect(computeQualityOfHire(interviews)).toBe(4.5);
  });

  test("handles single rating", () => {
    expect(computeQualityOfHire([{ rating: 5 }])).toBe(5);
  });
});

/* ------------------------------------------------------------------ */
/* computeCostPerHire                                                  */
/* ------------------------------------------------------------------ */
describe("computeCostPerHire", () => {
  test("returns 0 when no hires", () => {
    const apps = [makeApp({ source: "linkedin", stage: "applied" })];
    expect(computeCostPerHire(apps)).toBe(0);
  });

  test("computes total spend / hires", () => {
    // 3 linkedin apps + 1 hired
    // spend = 3 × 4200 × 0.1 = 1260
    // costPerHire = 1260 / 1 = 1260
    const apps = [
      makeApp({ source: "linkedin", stage: "applied" }),
      makeApp({ source: "linkedin", stage: "screen" }),
      makeApp({ source: "linkedin", stage: "hired" }),
    ];
    expect(computeCostPerHire(apps)).toBe(1260);
  });

  test("uses default cost for unknown sources", () => {
    // 1 unknown-source app + 1 hired
    // spend = 1 × 1000 × 0.1 = 100
    // costPerHire = 100 / 1 = 100
    const apps = [
      makeApp({ source: "unknown_source" as never, stage: "hired" }),
    ];
    expect(computeCostPerHire(apps)).toBe(100);
  });

  test("sums spend across multiple sources", () => {
    // 2 linkedin + 1 referral + 1 hired (linkedin)
    // spend = (2 × 4200 + 1 × 800) × 0.1 = (8400 + 800) × 0.1 = 920
    // costPerHire = 920 / 1 = 920
    const apps = [
      makeApp({ source: "linkedin", stage: "applied" }),
      makeApp({ source: "linkedin", stage: "hired" }),
      makeApp({ source: "referral", stage: "applied" }),
    ];
    expect(computeCostPerHire(apps)).toBe(920);
  });

  test("SOURCE_COST_PER_HIRE has all 6 expected sources", () => {
    expect(Object.keys(SOURCE_COST_PER_HIRE).sort()).toEqual(
      ["agency", "direct", "indeed", "job_board", "linkedin", "referral"].sort(),
    );
  });
});

/* ------------------------------------------------------------------ */
/* computeFunnelConversion                                             */
/* ------------------------------------------------------------------ */
describe("computeFunnelConversion", () => {
  test("first stage is always 100%", () => {
    const funnel = [
      { stage: "Applied", count: 10 },
      { stage: "Screening", count: 8 },
    ];
    const result = computeFunnelConversion(funnel);
    expect(result[0].rate).toBe(100);
  });

  test("computes stage-to-stage conversion", () => {
    const funnel = [
      { stage: "Applied", count: 10 },
      { stage: "Screening", count: 8 },  // 8/10 = 80%
      { stage: "Interview", count: 4 },  // 4/8 = 50%
      { stage: "Offer", count: 2 },      // 2/4 = 50%
    ];
    const result = computeFunnelConversion(funnel);
    expect(result[0].rate).toBe(100);
    expect(result[1].rate).toBe(80);
    expect(result[2].rate).toBe(50);
    expect(result[3].rate).toBe(50);
  });

  test("handles zero previous stage (0% conversion)", () => {
    const funnel = [
      { stage: "Applied", count: 0 },
      { stage: "Screening", count: 5 }, // 5/0 = undefined → 0
    ];
    const result = computeFunnelConversion(funnel);
    expect(result[0].rate).toBe(0); // 0/0 → 0
    expect(result[1].rate).toBe(0); // 5/0 → 0
  });
});
