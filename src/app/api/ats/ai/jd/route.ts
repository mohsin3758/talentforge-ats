import { NextRequest } from "next/server";
import { generateJD } from "@/lib/ats/ai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const content = await generateJD({
      title: body.title || "Untitled Role",
      department: body.department || "Engineering",
      seniority: body.seniority || "Mid-level",
      skills: Array.isArray(body.skills) ? body.skills : [],
      requirements: Array.isArray(body.requirements) ? body.requirements : [],
    });
    // Spec: returns {description: markdown}. Keep `content` alias for backward compat.
    return Response.json({ description: content, content });
  } catch (e) {
    console.error("[ai/jd] error:", e);
    return Response.json(
      { error: e instanceof Error ? e.message : "Failed to generate JD" },
      { status: 500 },
    );
  }
}
