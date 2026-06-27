import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { scoreApplication } from "@/lib/ats/ai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let resumeText = body.resumeText as string | undefined;
    let jobDescription = body.jobDescription as string | undefined;
    let requiredSkills: string[] = Array.isArray(body.requiredSkills) ? body.requiredSkills : [];
    let candidateSkills: string[] = Array.isArray(body.candidateSkills) ? body.candidateSkills : [];

    if (body.applicationId) {
      const app = await db.application.findUnique({
        where: { id: body.applicationId },
        include: { candidate: true, job: true },
      });
      if (!app) return Response.json({ error: "Application not found" }, { status: 404 });
      resumeText = app.candidate.resumeText;
      jobDescription = app.job.description;
      try {
        requiredSkills = JSON.parse(app.job.skills) as string[];
        candidateSkills = JSON.parse(app.candidate.skills) as string[];
      } catch {
        // ignore
      }
    }

    if (!resumeText || !jobDescription) {
      return Response.json(
        { error: "resumeText and jobDescription (or applicationId) are required" },
        { status: 400 },
      );
    }

    const result = await scoreApplication({ resumeText, jobDescription, requiredSkills, candidateSkills });

    // Persist if applicationId was provided
    if (body.applicationId) {
      await db.application.update({
        where: { id: body.applicationId },
        data: {
          matchScore: result.score,
          matchReasons: JSON.stringify(result.reasons),
          aiSummary: result.summary,
        },
      });
    }

    return Response.json(result);
  } catch (e) {
    console.error("[ai/score] error:", e);
    return Response.json(
      { error: e instanceof Error ? e.message : "Failed to score" },
      { status: 500 },
    );
  }
}
