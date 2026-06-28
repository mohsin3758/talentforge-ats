import { db } from "@/lib/db";
import { serializeJob } from "@/lib/ats/serializers";

export async function serializeWithRelations(id: string) {
  const job = await db.job.findUnique({
    where: { id },
    include: {
      applications: {
        include: {
          candidate: true,
          interviews: true,
          notes: true,
          communications: true,
          offers: true,
        },
        orderBy: { appliedAt: "desc" },
      },
    },
  });
  if (!job) return null;
  return serializeJob(job);
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const job = await db.job.findUnique({
      where: { id },
      include: { applications: { select: { id: true, stage: true, matchScore: true } } },
    });
    if (!job) return Response.json({ error: "Not found" }, { status: 404 });
    return Response.json(serializeJob(job));
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
      "title", "department", "location", "employmentType", "salaryMin", "salaryMax",
      "currency", "description", "experienceYears", "status", "priority",
      "remoteOk", "openings", "hiringManager",
    ];
    for (const f of fields) {
      if (body[f] !== undefined) data[f] = body[f];
    }
    if (body.requirements !== undefined) data.requirements = JSON.stringify(body.requirements);
    if (body.skills !== undefined) data.skills = JSON.stringify(body.skills);
    const job = await db.job.update({ where: { id }, data });
    return Response.json(serializeJob(job));
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await db.job.delete({ where: { id } });
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 500 });
  }
}
