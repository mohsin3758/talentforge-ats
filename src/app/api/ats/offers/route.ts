import { db } from "@/lib/db";
import { serializeOffer } from "@/lib/ats/serializers";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const applicationId = url.searchParams.get("applicationId");
    const offers = await db.offer.findMany({
      where: applicationId ? { applicationId } : undefined,
      orderBy: { createdAt: "desc" },
    });
    return Response.json(offers.map(serializeOffer));
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const offer = await db.offer.create({
      data: {
        applicationId: body.applicationId,
        salary: Number(body.salary) || 0,
        currency: body.currency ?? "USD",
        startDate: body.startDate ? new Date(body.startDate) : new Date(),
        terms: body.terms ?? "",
        aiGenerated: body.aiGenerated ?? false,
        status: body.status ?? "draft",
      },
    });
    return Response.json(serializeOffer(offer));
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 500 });
  }
}
