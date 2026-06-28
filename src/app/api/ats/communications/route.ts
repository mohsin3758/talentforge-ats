import { db } from "@/lib/db";
import { serializeCommunication } from "@/lib/ats/serializers";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const applicationId = url.searchParams.get("applicationId");
    const comms = await db.communication.findMany({
      where: applicationId ? { applicationId } : undefined,
      orderBy: { createdAt: "desc" },
    });
    return Response.json(comms.map(serializeCommunication));
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const comm = await db.communication.create({
      data: {
        applicationId: body.applicationId,
        channel: body.channel ?? "email",
        direction: body.direction ?? "outbound",
        subject: body.subject ?? null,
        body: body.body ?? "",
        aiGenerated: body.aiGenerated ?? false,
        status: body.status ?? "sent",
      },
    });
    return Response.json(serializeCommunication(comm));
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 500 });
  }
}
