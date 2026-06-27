import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { serializeAutomation } from "@/lib/ats/serializers";

export async function GET() {
  try {
    const automations = await db.automation.findMany({
      orderBy: { createdAt: "desc" },
    });
    return Response.json(automations.map(serializeAutomation));
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const automation = await db.automation.create({
      data: {
        name: body.name,
        description: body.description ?? "",
        trigger: body.trigger,
        triggerConfig: JSON.stringify(body.triggerConfig ?? {}),
        action: body.action,
        actionConfig: JSON.stringify(body.actionConfig ?? {}),
        enabled: body.enabled ?? true,
      },
    });
    return Response.json(serializeAutomation(automation));
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const id = body.id;
    if (!id) return Response.json({ error: "id is required" }, { status: 400 });
    const data: Record<string, unknown> = {};
    const fields = ["name", "description", "trigger", "action", "enabled"];
    for (const f of fields) {
      if (body[f] !== undefined) data[f] = body[f];
    }
    if (body.triggerConfig !== undefined) data.triggerConfig = JSON.stringify(body.triggerConfig);
    if (body.actionConfig !== undefined) data.actionConfig = JSON.stringify(body.actionConfig);
    const automation = await db.automation.update({ where: { id }, data });
    return Response.json(serializeAutomation(automation));
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 500 });
  }
}
