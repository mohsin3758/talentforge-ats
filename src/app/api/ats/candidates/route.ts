import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { serializeCandidate } from "@/lib/ats/serializers";

export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams.get("q")?.trim();
    const candidates = await db.candidate.findMany({
      where: q
        ? {
            OR: [
              { fullName: { contains: q } },
              { email: { contains: q } },
              { currentTitle: { contains: q } },
              { skills: { contains: q } },
            ],
          }
        : undefined,
      orderBy: { createdAt: "desc" },
      include: { applications: { select: { id: true, matchScore: true, stage: true } } },
    });
    return Response.json(
      candidates.map((c) => ({
        ...serializeCandidate(c),
        applications: c.applications,
      })),
    );
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const candidate = await db.candidate.create({
      data: {
        fullName: body.fullName,
        email: body.email,
        phone: body.phone ?? null,
        location: body.location ?? null,
        currentTitle: body.currentTitle ?? null,
        currentCompany: body.currentCompany ?? null,
        yearsExperience: body.yearsExperience ?? 0,
        skills: JSON.stringify(body.skills ?? []),
        source: body.source ?? "direct",
        resumeText: body.resumeText ?? "",
        linkedinUrl: body.linkedinUrl ?? null,
        portfolioUrl: body.portfolioUrl ?? null,
        tags: JSON.stringify(body.tags ?? []),
      },
    });
    return Response.json(serializeCandidate(candidate));
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 500 });
  }
}
