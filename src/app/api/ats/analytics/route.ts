import { db } from "@/lib/db";

const STAGE_ORDER = ["applied", "screen", "interview", "assessment", "offer", "hired", "rejected"] as const;
const STAGE_LABELS: Record<string, string> = {
  applied: "Applied",
  screen: "Screening",
  interview: "Interview",
  assessment: "Assessment",
  offer: "Offer",
  hired: "Hired",
  rejected: "Rejected",
};

export async function GET() {
  try {
    const [totalCandidates, totalJobs, apps, hiredApps, interviews, notes, comms] = await Promise.all([
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
    ]);

    /* byStage: array of {stage, count} plus a Record view for convenience */
    const stageCounts: Record<string, number> = {};
    for (const s of STAGE_ORDER) stageCounts[s] = 0;
    for (const a of apps) stageCounts[a.stage] = (stageCounts[a.stage] ?? 0) + 1;
    const byStage = STAGE_ORDER.map((stage) => ({ stage, count: stageCounts[stage] ?? 0 }));

    /* bySource: array of {source, applications, hires} */
    const sources = Array.from(new Set(apps.map((a) => a.source)));
    const bySource = sources.map((source) => {
      const filtered = apps.filter((a) => a.source === source);
      return {
        source,
        applications: filtered.length,
        hires: filtered.filter((a) => a.stage === "hired").length,
      };
    });

    const avgMatchScore = apps.length === 0 ? 0 : Math.round(apps.reduce((s, a) => s + a.matchScore, 0) / apps.length);

    /* hiresThisMonth */
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const hiresThisMonth = hiredApps.filter(
      (a) => a.hiredAt && new Date(a.hiredAt) >= startOfMonth,
    ).length;

    /* timeToHireAvgDays */
    const timeToHireAvgDays = hiredApps.length === 0
      ? 0
      : Math.round(
          hiredApps.reduce((s, a) => {
            const applied = new Date(a.appliedAt).getTime();
            const hired = a.hiredAt ? new Date(a.hiredAt).getTime() : Date.now();
            return s + Math.max(0, (hired - applied) / (1000 * 60 * 60 * 24));
          }, 0) / hiredApps.length,
        );

    /* hiringFunnel — same as byStage but excluding rejected (for visualization) */
    const hiringFunnel = STAGE_ORDER.filter((s) => s !== "rejected").map((stage) => ({
      stage: STAGE_LABELS[stage],
      count: stageCounts[stage] ?? 0,
    }));

    const sourceEffectiveness = bySource; // alias

    /* topCandidates — top 5 by matchScore excluding rejected */
    const topCandidates = apps
      .filter((a) => a.stage !== "rejected")
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 5)
      .map((a) => ({
        id: a.id,
        fullName: a.candidate.fullName,
        currentTitle: a.candidate.currentTitle ?? "",
        matchScore: a.matchScore,
      }));

    /* recentActivity */
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
      byStageRecord: stageCounts,
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
    });
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 500 });
  }
}
