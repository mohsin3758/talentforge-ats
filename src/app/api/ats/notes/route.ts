import { db } from "@/lib/db";
import { serializeNote } from "@/lib/ats/serializers";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const applicationId = url.searchParams.get("applicationId");
    const notes = await db.note.findMany({
      where: applicationId ? { applicationId } : undefined,
      orderBy: { createdAt: "desc" },
    });
    return Response.json(notes.map(serializeNote));
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const note = await db.note.create({
      data: {
        applicationId: body.applicationId,
        author: body.author ?? "Recruiter",
        content: body.content ?? "",
        isPrivate: body.isPrivate ?? false,
      },
    });
    return Response.json(serializeNote(note));
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 500 });
  }
}
