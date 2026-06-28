import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { generateOfferLetter } from "@/lib/ats/ai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const applicationId = body.applicationId as string | undefined;

    let candidateName = body.candidateName as string | undefined;
    let jobTitle = body.jobTitle as string | undefined;

    if (applicationId) {
      const app = await db.application.findUnique({
        where: { id: applicationId },
        include: { candidate: true, job: true },
      });
      if (!app) return Response.json({ error: "Application not found" }, { status: 404 });
      candidateName = app.candidate.fullName;
      jobTitle = app.job.title;
    }

    if (!candidateName || !jobTitle) {
      return Response.json(
        { error: "applicationId (or candidateName+jobTitle) required" },
        { status: 400 },
      );
    }

    const salary = Number(body.salary) || 0;
    const currency = body.currency || "USD";
    const startDate = body.startDate || new Date().toISOString().slice(0, 10);

    const content = await generateOfferLetter({
      candidateName,
      jobTitle,
      company: body.company,
      salary,
      currency,
      startDate,
      extras: body.extras,
    });

    if (applicationId) {
      await db.offer.create({
        data: {
          applicationId,
          salary,
          currency,
          startDate: new Date(startDate),
          terms: content,
          aiGenerated: true,
          status: "draft",
        },
      });
    }

    return Response.json({ content });
  } catch (e) {
    console.error("[ai/offer] error:", e);
    return Response.json(
      { error: e instanceof Error ? e.message : "Failed to generate offer" },
      { status: 500 },
    );
  }
}
