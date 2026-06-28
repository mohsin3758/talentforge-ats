import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { serializeApplication } from "@/lib/ats/serializers";
import { triggerAutomations } from "@/lib/ats/automations";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { stage } = await req.json();
    if (!stage) return Response.json({ error: "stage is required" }, { status: 400 });

    const app = await db.application.findUnique({
      where: { id },
      include: { job: true, candidate: true },
    });
    if (!app) return Response.json({ error: "Application not found" }, { status: 404 });

    const history = (() => {
      try {
        const v = JSON.parse(app.stageHistory);
        return Array.isArray(v) ? v : [];
      } catch {
        return [];
      }
    })();

    const newHistory = [...history, { stage, at: new Date().toISOString() }];

    const updated = await db.application.update({
      where: { id },
      data: {
        stage,
        stageUpdatedAt: new Date(),
        hiredAt: stage === "hired" ? new Date() : null,
        stageHistory: JSON.stringify(newHistory),
      },
      include: {
        job: true,
        candidate: true,
        interviews: { orderBy: { scheduledAt: "desc" } },
        communications: { orderBy: { createdAt: "desc" } },
        offers: { orderBy: { createdAt: "desc" } },
        notes: { orderBy: { createdAt: "desc" } },
      },
    });

    // Fire-and-forget automation triggers
    triggerAutomations(updated).catch((err) => {
      console.error("Automation trigger failed:", err);
    });

    return Response.json(serializeApplication(updated));
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 500 });
  }
}
