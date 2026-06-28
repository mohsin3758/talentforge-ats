import { db } from "@/lib/db";
import { serializeInterview } from "@/lib/ats/serializers";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const applicationId = url.searchParams.get("applicationId");
    const interviews = await db.interview.findMany({
      where: applicationId ? { applicationId } : undefined,
      orderBy: { scheduledAt: "desc" },
    });
    return Response.json(interviews.map(serializeInterview));
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const interview = await db.interview.create({
      data: {
        applicationId: body.applicationId,
        type: body.type ?? "video",
        scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : new Date(),
        durationMin: body.durationMin ?? 60,
        interviewer: body.interviewer ?? "",
        location: body.location ?? null,
        status: body.status ?? "scheduled",
        aiQuestions: JSON.stringify(body.aiQuestions ?? []),
      },
    });
    return Response.json(serializeInterview(interview));
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 500 });
  }
}
