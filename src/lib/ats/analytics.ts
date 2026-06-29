/**
 * Pure functions for analytics computations.
 *
 * Extracted from `/api/ats/analytics/route.ts` so they can be unit tested
 * in isolation without a database. The route handler calls these functions
 * with raw DB rows; the functions return the computed analytics fields.
 */

export interface RawApplication {
  id: string;
  stage: string;
  matchScore: number;
  source: string;
  appliedAt: Date | string;
  stageUpdatedAt: Date | string;
  hiredAt: Date | string | null;
  candidate: { fullName: string; currentTitle: string | null };
  job: { department: string; hiringManager: string };
}

export interface RawInterview {
  rating: number | null;
}

export interface RawOffer {
  status: string; // "draft" | "sent" | "accepted" | "declined" | "countered"
}

export interface RawNote {
  applicationId: string;
  author: string;
  createdAt: Date | string;
}

export interface RawCommunication {
  applicationId: string;
  aiGenerated: boolean;
  direction: string;
  channel: string;
  subject: string | null;
  createdAt: Date | string;
}

export interface RawInterviewForActivity {
  id: string;
  applicationId: string;
  type: string;
  status: string;
  createdAt: Date | string;
}

export const STAGE_ORDER = [
  "applied",
  "screen",
  "interview",
  "assessment",
  "offer",
  "hired",
  "rejected",
] as const;

export const STAGE_LABELS: Record<string, string> = {
  applied: "Applied",
  screen: "Screening",
  interview: "Interview",
  assessment: "Assessment",
  offer: "Offer",
  hired: "Hired",
  rejected: "Rejected",
};

/** Industry-benchmarked cost per hire by source (deterministic, no Math.random). */
export const SOURCE_COST_PER_HIRE: Record<string, number> = {
  linkedin: 4200,
  indeed: 1800,
  referral: 800,
  direct: 500,
  job_board: 2400,
  agency: 6500,
};

/** Default cost for unknown sources. */
export const DEFAULT_SOURCE_COST = 1000;

/** Fraction of source cost attributable to each application (spend amortization). */
export const SPEND_FRACTION_PER_APP = 0.1;

/**
 * Count applications per stage. Returns both an array (ordered) and a record.
 */
export function computeByStage(apps: RawApplication[]): {
  byStage: { stage: string; count: number }[];
  byStageRecord: Record<string, number>;
} {
  const stageCounts: Record<string, number> = {};
  for (const s of STAGE_ORDER) stageCounts[s] = 0;
  for (const a of apps) {
    stageCounts[a.stage] = (stageCounts[a.stage] ?? 0) + 1;
  }
  const byStage = STAGE_ORDER.map((stage) => ({ stage, count: stageCounts[stage] ?? 0 }));
  return { byStage, byStageRecord: stageCounts };
}

/**
 * Count applications + hires per source.
 */
export function computeBySource(apps: RawApplication[]): {
  source: string;
  applications: number;
  hires: number;
}[] {
  const sources = Array.from(new Set(apps.map((a) => a.source)));
  return sources.map((source) => {
    const filtered = apps.filter((a) => a.source === source);
    return {
      source,
      applications: filtered.length,
      hires: filtered.filter((a) => a.stage === "hired").length,
    };
  });
}

/**
 * Average match score across all applications.
 */
export function computeAvgMatchScore(apps: RawApplication[]): number {
  if (apps.length === 0) return 0;
  return Math.round(apps.reduce((s, a) => s + a.matchScore, 0) / apps.length);
}

/**
 * Count hires this month (calendar month).
 */
export function computeHiresThisMonth(
  hiredApps: RawApplication[],
  now: Date = new Date(),
): number {
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  return hiredApps.filter(
    (a) => a.hiredAt && new Date(a.hiredAt) >= startOfMonth,
  ).length;
}

/**
 * Average days from applied → hired.
 */
export function computeTimeToHireAvgDays(hiredApps: RawApplication[]): number {
  if (hiredApps.length === 0) return 0;
  return Math.round(
    hiredApps.reduce((s, a) => {
      const applied = new Date(a.appliedAt).getTime();
      const hired = a.hiredAt ? new Date(a.hiredAt).getTime() : Date.now();
      return s + Math.max(0, (hired - applied) / (1000 * 60 * 60 * 24));
    }, 0) / hiredApps.length,
  );
}

/**
 * Hiring funnel — byStage excluding "rejected", with human-readable labels.
 */
export function computeHiringFunnel(
  byStageRecord: Record<string, number>,
): { stage: string; count: number }[] {
  return STAGE_ORDER.filter((s) => s !== "rejected").map((stage) => ({
    stage: STAGE_LABELS[stage],
    count: byStageRecord[stage] ?? 0,
  }));
}

/**
 * Top N candidates by matchScore, excluding rejected.
 */
export function computeTopCandidates(
  apps: RawApplication[],
  limit = 5,
): { id: string; fullName: string; currentTitle: string; matchScore: number }[] {
  return apps
    .filter((a) => a.stage !== "rejected")
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit)
    .map((a) => ({
      id: a.id,
      fullName: a.candidate.fullName,
      currentTitle: a.candidate.currentTitle ?? "",
      matchScore: a.matchScore,
    }));
}

/**
 * Offer acceptance rate = accepted / (accepted + declined).
 * Returns 0 if no accepted or declined offers.
 */
export function computeOfferAcceptanceRate(offers: RawOffer[]): {
  rate: number;
  accepted: number;
  declined: number;
} {
  const accepted = offers.filter((o) => o.status === "accepted").length;
  const declined = offers.filter((o) => o.status === "declined").length;
  const total = accepted + declined;
  const rate = total === 0 ? 0 : Math.round((accepted / total) * 100);
  return { rate, accepted, declined };
}

/**
 * Quality of hire = average interview rating (1-5), rounded to 1 decimal.
 * Returns 0 if no ratings.
 */
export function computeQualityOfHire(interviews: RawInterview[]): number {
  const ratings = interviews
    .map((i) => i.rating)
    .filter((r): r is number => r !== null && typeof r === "number");
  if (ratings.length === 0) return 0;
  return Math.round((ratings.reduce((s, r) => s + r, 0) / ratings.length) * 10) / 10;
}

/**
 * Cost per hire = total spend / number of hires.
 * Spend = sum of (source_cost × SPEND_FRACTION_PER_APP) for all applications.
 */
export function computeCostPerHire(apps: RawApplication[]): number {
  const totalHires = apps.filter((a) => a.stage === "hired").length;
  if (totalHires === 0) return 0;
  const totalSpend = apps.reduce(
    (sum, a) => sum + (SOURCE_COST_PER_HIRE[a.source] ?? DEFAULT_SOURCE_COST) * SPEND_FRACTION_PER_APP,
    0,
  );
  return Math.round(totalSpend / totalHires);
}

/**
 * Funnel conversion rate: stage-to-stage conversion %.
 * Each stage's rate = count / previous stage count × 100.
 * First stage rate = 100%.
 */
export function computeFunnelConversion(
  hiringFunnel: { stage: string; count: number }[],
): { stage: string; count: number; rate: number }[] {
  return hiringFunnel.map((s, i, arr) => {
    const prev = i === 0 ? s.count : arr[i - 1].count;
    const rate = prev === 0 ? 0 : Math.round((s.count / prev) * 100);
    return { stage: s.stage, count: s.count, rate };
  });
}
