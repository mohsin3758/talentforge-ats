import { db } from "@/lib/db";
import { generateBrief } from "@/lib/ats/ai";

export async function GET() {
  try {
    const [apps, automations, interviews] = await Promise.all([
      db.application.findMany({
        where: { stage: { notIn: ["hired", "rejected"] } },
        include: { candidate: true, job: true },
        orderBy: { stageUpdatedAt: "asc" },
        take: 50,
      }),
      db.automation.findMany(),
      db.interview.findMany({
        where: { scheduledAt: { gte: new Date() }, status: "scheduled" },
        include: { application: { include: { candidate: true } } },
        orderBy: { scheduledAt: "asc" },
        take: 10,
      }),
    ]);

    const brief = await generateBrief({
      openApps: apps.map((a) => ({
        id: a.id,
        stage: a.stage,
        matchScore: a.matchScore,
        candidateName: a.candidate.fullName,
        jobTitle: a.job.title,
        stageUpdatedAt: a.stageUpdatedAt,
      })),
      automations: automations.map((a) => ({
        name: a.name,
        enabled: a.enabled,
        runCount: a.runCount,
      })),
      upcomingInterviews: interviews.map((i) => ({
        id: i.id,
        candidateName: i.application.candidate.fullName,
        type: i.type,
        scheduledAt: i.scheduledAt,
      })),
    });

    return Response.json(brief);
  } catch (e) {
    console.error("[ai/brief] error:", e);
    return Response.json(
      { error: e instanceof Error ? e.message : "Failed to generate brief" },
      { status: 500 },
    );
  }
}
