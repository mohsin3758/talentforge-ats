import { db } from "@/lib/db";
import { serializeApplication } from "@/lib/ats/serializers";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const app = await db.application.findUnique({
      where: { id },
      include: {
        job: true,
        candidate: true,
        interviews: { orderBy: { scheduledAt: "desc" } },
        communications: { orderBy: { createdAt: "desc" } },
        offers: { orderBy: { createdAt: "desc" } },
        notes: { orderBy: { createdAt: "desc" } },
      },
    });
    if (!app) return Response.json({ error: "Not found" }, { status: 404 });
    return Response.json(serializeApplication(app));
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
    const fields = ["stage", "matchScore", "aiSummary", "source", "starred", "rejectedReason"];
    for (const f of fields) {
      if (body[f] !== undefined) data[f] = body[f];
    }
    if (body.matchReasons !== undefined) data.matchReasons = JSON.stringify(body.matchReasons);
    if (body.stageHistory !== undefined) data.stageHistory = JSON.stringify(body.stageHistory);

    const app = await db.application.update({
      where: { id },
      data,
      include: {
        job: true,
        candidate: true,
        interviews: true,
        communications: true,
        offers: true,
        notes: true,
      },
    });
    return Response.json(serializeApplication(app));
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 500 });
  }
}
