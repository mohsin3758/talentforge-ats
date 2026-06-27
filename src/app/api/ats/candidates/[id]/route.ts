import { db } from "@/lib/db";
import { serializeCandidate } from "@/lib/ats/serializers";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const candidate = await db.candidate.findUnique({
      where: { id },
      include: {
        applications: {
          include: { job: true },
          orderBy: { appliedAt: "desc" },
        },
      },
    });
    if (!candidate) return Response.json({ error: "Not found" }, { status: 404 });
    return Response.json({
      ...serializeCandidate(candidate),
      applications: candidate.applications.map((a) => ({
        id: a.id,
        stage: a.stage,
        matchScore: a.matchScore,
        jobTitle: a.job.title,
        jobId: a.jobId,
      })),
    });
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const data: Record<string, unknown> = {};
    const fields = [
      "fullName", "email", "phone", "location", "currentTitle", "currentCompany",
      "yearsExperience", "source", "resumeText", "linkedinUrl", "portfolioUrl",
    ];
    for (const f of fields) {
      if (body[f] !== undefined) data[f] = body[f];
    }
    if (body.skills !== undefined) data.skills = JSON.stringify(body.skills);
    if (body.tags !== undefined) data.tags = JSON.stringify(body.tags);
    const candidate = await db.candidate.update({ where: { id }, data });
    return Response.json(serializeCandidate(candidate));
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 500 });
  }
}
