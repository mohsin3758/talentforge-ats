import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { draftEmail } from "@/lib/ats/ai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const applicationId = body.applicationId as string | undefined;

    let candidateName = body.candidateName as string | undefined;
    let jobTitle = body.jobTitle as string | undefined;
    let hiringManager = body.hiringManager as string | undefined;

    if (applicationId) {
      const app = await db.application.findUnique({
        where: { id: applicationId },
        include: { candidate: true, job: true },
      });
      if (!app) return Response.json({ error: "Application not found" }, { status: 404 });
      candidateName = app.candidate.fullName;
      jobTitle = app.job.title;
      hiringManager = app.job.hiringManager;
    }

    if (!candidateName || !jobTitle) {
      return Response.json(
        { error: "applicationId (or candidateName+jobTitle) required" },
        { status: 400 },
      );
    }

    const result = await draftEmail({
      candidateName,
      jobTitle,
      hiringManager,
      emailType: body.emailType ?? "screening",
      tone: body.tone ?? "professional",
      extra: body.extra,
    });

    if (applicationId) {
      await db.communication.create({
        data: {
          applicationId,
          channel: "email",
          direction: "outbound",
          subject: result.subject,
          body: result.body,
          aiGenerated: true,
          status: "draft",
        },
      });
    }

    return Response.json(result);
  } catch (e) {
    console.error("[ai/email] error:", e);
    return Response.json(
      { error: e instanceof Error ? e.message : "Failed to draft email" },
      { status: 500 },
    );
  }
}
