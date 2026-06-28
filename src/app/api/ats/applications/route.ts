import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { serializeApplication } from "@/lib/ats/serializers";

export async function GET(req: NextRequest) {
  try {
    const jobId = req.nextUrl.searchParams.get("jobId");
    const stage = req.nextUrl.searchParams.get("stage");
    const minScoreStr = req.nextUrl.searchParams.get("minScore");
    const minScore = minScoreStr ? Number(minScoreStr) : undefined;
    const starredStr = req.nextUrl.searchParams.get("starred");

    const where: Record<string, unknown> = {};
    if (jobId && jobId !== "all") where.jobId = jobId;
    if (stage) where.stage = stage;
    if (minScore !== undefined && !Number.isNaN(minScore)) where.matchScore = { gte: minScore };
    if (starredStr === "true" || starredStr === "1") where.starred = true;

    const apps = await db.application.findMany({
      where,
      orderBy: { appliedAt: "desc" },
      include: {
        job: true,
        candidate: true,
        interviews: { orderBy: { scheduledAt: "desc" } },
        communications: { orderBy: { createdAt: "desc" } },
        offers: { orderBy: { createdAt: "desc" } },
        notes: { orderBy: { createdAt: "desc" } },
      },
    });
    return Response.json(apps.map(serializeApplication));
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { jobId, candidateId, source } = body;
    if (!jobId || !candidateId) {
      return Response.json({ error: "jobId and candidateId are required" }, { status: 400 });
    }
    const job = await db.job.findUnique({ where: { id: jobId } });
    const candidate = await db.candidate.findUnique({ where: { id: candidateId } });
    if (!job || !candidate) {
      return Response.json({ error: "Job or candidate not found" }, { status: 404 });
    }

    const stageHistory = [{ stage: "applied", at: new Date().toISOString() }];
    const application = await db.application.create({
      data: {
        jobId,
        candidateId,
        stage: "applied",
        source: source ?? candidate.source,
        stageHistory: JSON.stringify(stageHistory),
        matchScore: 0,
      },
      include: { job: true, candidate: true },
    });

    // Inline AI scoring if resume + job description available
    if (candidate.resumeText && job.description) {
      try {
        const { scoreApplication } = await import("@/lib/ats/ai");
        const scored = await scoreApplication({
          resumeText: candidate.resumeText,
          jobDescription: job.description,
          requiredSkills: JSON.parse(job.skills) as string[],
          candidateSkills: JSON.parse(candidate.skills) as string[],
        });
        const updated = await db.application.update({
          where: { id: application.id },
          data: {
            matchScore: scored.score,
            matchReasons: JSON.stringify(scored.reasons),
            aiSummary: scored.summary,
          },
          include: {
            job: true,
            candidate: true,
            interviews: true,
            communications: true,
            offers: true,
            notes: true,
          },
        });
        return Response.json(serializeApplication(updated));
      } catch {
        // Scoring failed but application was created — return as-is
        return Response.json(serializeApplication(application));
      }
    }
    return Response.json(serializeApplication(application));
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 500 });
  }
}
