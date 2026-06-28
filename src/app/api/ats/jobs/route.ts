import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { serializeJob } from "@/lib/ats/serializers";

export async function GET(req: NextRequest) {
  try {
    const status = req.nextUrl.searchParams.get("status");
    const jobs = await db.job.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: "desc" },
      include: { applications: { select: { id: true, stage: true, matchScore: true } } },
    });
    return Response.json(jobs.map(serializeJob));
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = {
      title: body.title,
      department: body.department,
      location: body.location ?? "",
      employmentType: body.employmentType ?? "Full-time",
      salaryMin: body.salaryMin ?? null,
      salaryMax: body.salaryMax ?? null,
      currency: body.currency ?? "USD",
      description: body.description ?? "",
      requirements: JSON.stringify(body.requirements ?? []),
      skills: JSON.stringify(body.skills ?? []),
      experienceYears: body.experienceYears ?? 0,
      status: body.status ?? "draft",
      priority: body.priority ?? "medium",
      remoteOk: body.remoteOk ?? true,
      openings: body.openings ?? 1,
      hiringManager: body.hiringManager ?? "",
    };
    const job = await db.job.create({ data });
    return Response.json(serializeJob(job));
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 500 });
  }
}
