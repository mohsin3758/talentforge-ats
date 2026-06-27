import { NextRequest } from "next/server";
import { parseResume } from "@/lib/ats/ai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const resumeText = body.resumeText as string | undefined;
    if (!resumeText || resumeText.trim().length < 20) {
      return Response.json(
        { error: "resumeText is required (min 20 chars)" },
        { status: 400 },
      );
    }
    const result = await parseResume(resumeText);
    return Response.json(result);
  } catch (e) {
    console.error("[ai/parse-resume] error:", e);
    return Response.json(
      { error: e instanceof Error ? e.message : "Failed to parse resume" },
      { status: 500 },
    );
  }
}
