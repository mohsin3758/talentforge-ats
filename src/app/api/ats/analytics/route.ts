import { db } from "@/lib/db";
import {
  computeAvgMatchScore,
  computeBySource,
  computeByStage,
  computeCostPerHire,
  computeHiresThisMonth,
  computeHiringFunnel,
  computeOfferAcceptanceRate,
  computeQualityOfHire,
  computeTimeToHireAvgDays,
  computeTopCandidates,
  type RawApplication,
  type RawInterview,
  type RawOffer,
} from "@/lib/ats/analytics";

export async function GET() {
  try {
    const [totalCandidates, totalJobs, apps, hiredApps, interviews, notes, comms, allInterviews, allOffers] = await Promise.all([
      db.candidate.count(),
      db.job.count(),
      db.application.findMany({ include: { candidate: true, job: true } }),
      db.application.findMany({
        where: { stage: "hired", hiredAt: { not: null } },
        include: { candidate: true, job: true },
      }),
      db.interview.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
      db.note.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
      db.communication.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
      db.interview.findMany({ where: { rating: { not: null } } }),
      db.offer.findMany(),
    ]);

    // Cast DB rows to the shape our pure functions expect
    const rawApps = apps as unknown as RawApplication[];
    const rawHiredApps = hiredApps as unknown as RawApplication[];
    const rawAllInterviews = allInterviews as unknown as RawInterview[];
    const rawAllOffers = allOffers as unknown as RawOffer[];

    // Compute all analytics fields via pure functions
    const { byStage, byStageRecord } = computeByStage(rawApps);
    const bySource = computeBySource(rawApps);
    const avgMatchScore = computeAvgMatchScore(rawApps);
    const hiresThisMonth = computeHiresThisMonth(rawHiredApps);
    const timeToHireAvgDays = computeTimeToHireAvgDays(rawHiredApps);
    const hiringFunnel = computeHiringFunnel(byStageRecord);
    const topCandidates = computeTopCandidates(rawApps, 5);
    const { rate: offerAcceptanceRate, accepted: offersAccepted, declined: offersDeclined } =
      computeOfferAcceptanceRate(rawAllOffers);
    const qualityOfHire = computeQualityOfHire(rawAllInterviews);
    const costPerHire = computeCostPerHire(rawApps);

    const sourceEffectiveness = bySource; // alias

    /* recentActivity (kept inline — depends on DB-specific joins) */
    const recentActivity: { type: string; desc: string; at: string }[] = [];
    for (const i of interviews.slice(0, 4)) {
      const app = apps.find((a) => a.id === i.applicationId);
      recentActivity.push({
        type: "interview",
        desc: `${i.status === "completed" ? "Completed" : "Scheduled"} ${i.type} interview with ${app?.candidate?.fullName ?? "candidate"}`,
        at: i.createdAt.toISOString(),
      });
    }
    for (const n of notes) {
      const app = apps.find((a) => a.id === n.applicationId);
      recentActivity.push({
        type: "note",
        desc: `${n.author} left a note on ${app?.candidate?.fullName ?? "candidate"}'s application`,
        at: n.createdAt.toISOString(),
      });
    }
    for (const c of comms) {
      const app = apps.find((a) => a.id === c.applicationId);
      recentActivity.push({
        type: "communication",
        desc: `${c.aiGenerated ? "AI " : ""}${c.direction} ${c.channel}: ${c.subject ?? "message"} → ${app?.candidate?.fullName ?? "candidate"}`,
        at: c.createdAt.toISOString(),
      });
    }
    recentActivity.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

    return Response.json({
      totalCandidates,
      totalJobs,
      totalApps: apps.length,
      byStage,
      byStageRecord,
      bySource,
      avgMatchScore,
      hiresThisMonth,
      timeToHireAvgDays,
      // Backward-compat aliases (older UI may have used these names)
      timeToHireAvg: timeToHireAvgDays,
      sourceEffectiveness,
      hiringFunnel,
      recentActivity: recentActivity.slice(0, 12),
      topCandidates,
      // Real computed KPIs
      offerAcceptanceRate,
      offersAccepted,
      offersDeclined,
      qualityOfHire,
      costPerHire,
    });
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 500 });
  }
}
