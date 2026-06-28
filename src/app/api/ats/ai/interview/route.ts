import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { generateInterviewQuestions } from "@/lib/ats/ai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let applicationId = body.applicationId as string | undefined;
    let interviewId = body.interviewId as string | undefined;
    let interviewType = body.interviewType as string | "video";

    let candidateName = body.candidateName as string | undefined;
    let candidateResume = body.candidateResume as string | undefined;
    let jobTitle = body.jobTitle as string | undefined;
    let jobDescription = body.jobDescription as string | undefined;

    if (applicationId) {
      const app = await db.application.findUnique({
        where: { id: applicationId },
        include: { candidate: true, job: true },
      });
      if (!app) return Response.json({ error: "Application not found" }, { status: 404 });
      candidateName = app.candidate.fullName;
      candidateResume = app.candidate.resumeText;
      jobTitle = app.job.title;
      jobDescription = app.job.description;
    }

    if (interviewId) {
      const interview = await db.interview.findUnique({ where: { id: interviewId } });
      if (interview) {
        applicationId = interview.applicationId;
        interviewType = interview.type;
      }
    }

    if (!candidateName || !candidateResume || !jobTitle || !jobDescription) {
      return Response.json(
        { error: "applicationId (or candidateName+candidateResume+jobTitle+jobDescription) required" },
        { status: 400 },
      );
    }

    const result = await generateInterviewQuestions({
      candidateName,
      candidateResume,
      jobTitle,
      jobDescription,
      interviewType,
    });

    if (interviewId) {
      await db.interview.update({
        where: { id: interviewId },
        data: { aiQuestions: JSON.stringify(result.questions) },
      });
    }

    return Response.json(result);
  } catch (e) {
    console.error("[ai/interview] error:", e);
    return Response.json(
      { error: e instanceof Error ? e.message : "Failed to generate questions" },
      { status: 500 },
    );
  }
}
