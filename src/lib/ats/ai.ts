import ZAI from "z-ai-web-dev-sdk";

let zaiInstance: Awaited<ReturnType<typeof ZAI.create>> | null = null;

export async function getZAI() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create();
  }
  return zaiInstance;
}

interface ScoreInput {
  resumeText: string;
  jobDescription: string;
  requiredSkills: string[];
  candidateSkills?: string[];
}

export interface ScoreResult {
  score: number;
  reasons: string[];
  summary: string;
}

export async function scoreApplication(input: ScoreInput): Promise<ScoreResult> {
  const zai = await getZAI();
  const sys = `You are an expert technical recruiter and AI resume-scoring engine. Score candidates 0-100 based on resume vs job description. Return STRICT JSON only with this shape: {"score": number, "reasons": string[], "summary": string}. Reasons should be 2-4 short bullet observations. Summary should be 1-2 sentences. Be objective and consistent. NEVER include any text outside the JSON.`;
  const user = `JOB DESCRIPTION:\n${input.jobDescription}\n\nREQUIRED SKILLS: ${input.requiredSkills.join(", ")}\n\nCANDIDATE SKILLS: ${(input.candidateSkills ?? []).join(", ")}\n\nRESUME:\n${input.resumeText}\n\nReturn JSON only.`;

  const result = await zai.chat.completions.create({
    messages: [
      { role: "system", content: sys },
      { role: "user", content: user },
    ],
    temperature: 0.2,
  });
  const text = result.choices[0]?.message?.content ?? "{}";
  const parsed = safeParseJSON(text);
  return {
    score: Math.max(0, Math.min(100, Number(parsed.score) || 0)),
    reasons: Array.isArray(parsed.reasons) ? parsed.reasons.slice(0, 6).map(String) : [],
    summary: typeof parsed.summary === "string" ? parsed.summary : "",
  };
}

export async function generateJD(input: {
  title: string;
  department: string;
  seniority: string;
  skills: string[];
  requirements: string[];
}): Promise<string> {
  const zai = await getZAI();
  const sys = `You are an expert technical copywriter specializing in job descriptions. Produce a polished, well-formatted markdown job description with sections: Overview, Responsibilities, Requirements, Nice-to-Haves, Benefits. Be specific, professional, and engaging. Use markdown headings (##) and bullet lists. Do not include a top-level # title (we'll add it).`;
  const user = `Title: ${input.title}\nDepartment: ${input.department}\nSeniority: ${input.seniority}\nKey Skills: ${input.skills.join(", ")}\nCore Requirements: ${input.requirements.join(", ")}\n\nGenerate the JD markdown now.`;
  const result = await zai.chat.completions.create({
    messages: [
      { role: "system", content: sys },
      { role: "user", content: user },
    ],
    temperature: 0.4,
  });
  return result.choices[0]?.message?.content ?? "";
}

export async function generateInterviewQuestions(input: {
  candidateName: string;
  candidateResume: string;
  jobTitle: string;
  jobDescription: string;
  interviewType: string;
}): Promise<{ questions: string[]; focusAreas: string[] }> {
  const zai = await getZAI();
  const sys = `You are an expert interviewer coach. Generate 6-8 tailored interview questions for a specific candidate. Return STRICT JSON: {"questions": string[], "focusAreas": string[]}. Focus areas should be 2-4 short topics to probe based on resume gaps or strengths. Questions should mix behavioral and technical. NEVER include text outside JSON.`;
  const user = `CANDIDATE: ${input.candidateName}\nRESUME:\n${input.candidateResume}\n\nJOB: ${input.jobTitle}\nDESCRIPTION:\n${input.jobDescription}\n\nINTERVIEW TYPE: ${input.interviewType}\n\nReturn JSON only.`;
  const result = await zai.chat.completions.create({
    messages: [
      { role: "system", content: sys },
      { role: "user", content: user },
    ],
    temperature: 0.4,
  });
  const text = result.choices[0]?.message?.content ?? "{}";
  const parsed = safeParseJSON(text);
  return {
    questions: Array.isArray(parsed.questions) ? parsed.questions.slice(0, 8).map(String) : [],
    focusAreas: Array.isArray(parsed.focusAreas) ? parsed.focusAreas.slice(0, 4).map(String) : [],
  };
}

export async function draftEmail(input: {
  candidateName: string;
  jobTitle: string;
  hiringManager?: string;
  emailType: "screening" | "rejection" | "offer" | "interview_invite" | "follow_up";
  tone: "professional" | "friendly" | "formal";
  extra?: string;
}): Promise<{ subject: string; body: string }> {
  const zai = await getZAI();
  const sys = `You are an expert recruiting communications writer. Produce a single email with subject and body. Return STRICT JSON: {"subject": string, "body": string}. Body should be 3-5 short paragraphs, plain text (use \\n for newlines), professional signature "TalentForge Recruiting Team". NEVER include text outside JSON.`;
  const user = `CANDIDATE: ${input.candidateName}\nJOB: ${input.jobTitle}\nHIRING MANAGER: ${input.hiringManager ?? "TalentForge"}\nEMAIL TYPE: ${input.emailType}\nTONE: ${input.tone}\nEXTRA CONTEXT: ${input.extra ?? "none"}\n\nReturn JSON only.`;
  const result = await zai.chat.completions.create({
    messages: [
      { role: "system", content: sys },
      { role: "user", content: user },
    ],
    temperature: 0.5,
  });
  const text = result.choices[0]?.message?.content ?? "{}";
  const parsed = safeParseJSON(text);
  return {
    subject: typeof parsed.subject === "string" ? parsed.subject : "",
    body: typeof parsed.body === "string" ? parsed.body : "",
  };
}

export async function generateOfferLetter(input: {
  candidateName: string;
  jobTitle: string;
  company?: string;
  salary: number;
  currency: string;
  startDate: string;
  extras?: string;
}): Promise<string> {
  const zai = await getZAI();
  const sys = `You are an expert HR copywriter producing formal offer letters in markdown. Include sections: Header, Offer Statement, Compensation, Start Date & Terms, Benefits, Acceptance. Use markdown headings (##) and bullet lists. Professional and warm tone.`;
  const user = `CANDIDATE: ${input.candidateName}\nJOB TITLE: ${input.jobTitle}\nCOMPANY: ${input.company ?? "TalentForge"}\nSALARY: ${input.salary} ${input.currency}/yr\nSTART DATE: ${input.startDate}\nEXTRAS: ${input.extras ?? "Standard benefits package"}\n\nGenerate the offer letter markdown now.`;
  const result = await zai.chat.completions.create({
    messages: [
      { role: "system", content: sys },
      { role: "user", content: user },
    ],
    temperature: 0.4,
  });
  return result.choices[0]?.message?.content ?? "";
}

export async function parseResume(resumeText: string): Promise<{
  name: string;
  email: string;
  phone: string;
  skills: string[];
  yearsExperience: number;
  currentTitle: string;
  summary: string;
}> {
  const zai = await getZAI();
  const sys = `You are a resume parsing engine. Extract structured data from resume text. Return STRICT JSON: {"name": string, "email": string, "phone": string, "skills": string[], "yearsExperience": number, "currentTitle": string, "summary": string}. If a field can't be determined, use "" or 0. NEVER include text outside JSON.`;
  const user = `RESUME TEXT:\n${resumeText}\n\nReturn JSON only.`;
  const result = await zai.chat.completions.create({
    messages: [
      { role: "system", content: sys },
      { role: "user", content: user },
    ],
    temperature: 0.1,
  });
  const text = result.choices[0]?.message?.content ?? "{}";
  const parsed = safeParseJSON(text);
  return {
    name: typeof parsed.name === "string" ? parsed.name : "",
    email: typeof parsed.email === "string" ? parsed.email : "",
    phone: typeof parsed.phone === "string" ? parsed.phone : "",
    skills: Array.isArray(parsed.skills) ? parsed.skills.map(String).slice(0, 20) : [],
    yearsExperience: Number(parsed.yearsExperience) || 0,
    currentTitle: typeof parsed.currentTitle === "string" ? parsed.currentTitle : "",
    summary: typeof parsed.summary === "string" ? parsed.summary : "",
  };
}

export async function generateBrief(input: {
  openApps: { id: string; stage: string; matchScore: number; candidateName: string; jobTitle: string; stageUpdatedAt: Date }[];
  automations: { name: string; enabled: boolean; runCount: number }[];
  upcomingInterviews: { id: string; candidateName: string; type: string; scheduledAt: Date }[];
}): Promise<{
  /** Spec shape */
  priorities: string[];
  candidatesNeedingAttention: { id: string; name: string; reason: string }[];
  automationsRan: number;
  /** Richer detail (kept for richer UI rendering) */
  priorityDetails: { title: string; detail: string; severity: "high" | "medium" | "low" }[];
  needsAttention: { id: string; name: string; reason: string; score: number; stage: string; jobTitle: string }[];
  automationSummary: string;
  generatedAt: string;
}> {
  const zai = await getZAI();
  const sys = `You are an AI recruiting assistant producing a daily brief for a recruiter. Return STRICT JSON with this exact shape: {"priorities": string[3], "candidatesNeedingAttention": [{"id": string, "name": string, "reason": string}], "priorityDetails": [{"title": string, "detail": string, "severity": "high"|"medium"|"low"}], "needsAttention": [{"id": string, "name": string, "reason": string, "score": number, "stage": string, "jobTitle": string}], "automationSummary": string}. "priorities" is an array of exactly 3 short actionable strings (e.g. "Schedule onsite for Olivia Chen — Senior React Engineer"). "candidatesNeedingAttention" lists 3-5 candidates needing follow-up. NEVER include text outside JSON.`;
  const user = `OPEN APPLICATIONS (active):\n${input.openApps
    .slice(0, 30)
    .map((a) => `- id=${a.id} | ${a.candidateName} | Job: ${a.jobTitle} | Stage: ${a.stage} | Score: ${a.matchScore} | Last Updated: ${a.stageUpdatedAt.toISOString().slice(0, 10)}`)
    .join("\n")}\n\nUPCOMING INTERVIEWS:\n${input.upcomingInterviews
    .map((i) => `- ${i.candidateName} ${i.type} on ${i.scheduledAt.toISOString().slice(0, 10)}`)
    .join("\n")}\n\nAUTOMATIONS:\n${input.automations
    .map((a) => `- ${a.name} (${a.enabled ? "enabled" : "disabled"}, ${a.runCount} runs)`)
    .join("\n")}\n\nReturn JSON only.`;
  const result = await zai.chat.completions.create({
    messages: [
      { role: "system", content: sys },
      { role: "user", content: user },
    ],
    temperature: 0.5,
  });
  const text = result.choices[0]?.message?.content ?? "{}";
  const parsed = safeParseJSON(text);

  const priorities: string[] = Array.isArray(parsed.priorities)
    ? parsed.priorities.slice(0, 3).map(String)
    : [];

  const candidatesNeedingAttention: { id: string; name: string; reason: string }[] = Array.isArray(parsed.candidatesNeedingAttention)
    ? parsed.candidatesNeedingAttention.slice(0, 5).map((n: Record<string, unknown>) => ({
        id: String(n.id ?? ""),
        name: String(n.name ?? ""),
        reason: String(n.reason ?? ""),
      }))
    : [];

  const priorityDetails = Array.isArray(parsed.priorityDetails)
    ? parsed.priorityDetails.slice(0, 3).map((p: Record<string, unknown>) => ({
        title: String(p.title ?? ""),
        detail: String(p.detail ?? ""),
        severity: (p.severity === "high" || p.severity === "low" ? p.severity : "medium") as
          | "high"
          | "medium"
          | "low",
      }))
    : [];

  const needsAttention = Array.isArray(parsed.needsAttention)
    ? parsed.needsAttention.slice(0, 5).map((n: Record<string, unknown>) => ({
        id: String(n.id ?? ""),
        name: String(n.name ?? ""),
        reason: String(n.reason ?? ""),
        score: Number(n.score) || 0,
        stage: String(n.stage ?? ""),
        jobTitle: String(n.jobTitle ?? ""),
      }))
    : [];

  const automationsRan = input.automations.reduce((sum, a) => sum + (a.runCount || 0), 0);

  return {
    priorities,
    candidatesNeedingAttention,
    automationsRan,
    priorityDetails,
    needsAttention,
    automationSummary: typeof parsed.automationSummary === "string" ? parsed.automationSummary : "",
    generatedAt: new Date().toISOString(),
  };
}

export function safeParseJSON(text: string): Record<string, unknown> {
  if (!text) return {};
  // Strip code fences
  let t = text.trim();
  if (t.startsWith("```")) {
    t = t.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "");
  }
  // Try direct parse
  try {
    return JSON.parse(t);
  } catch {
    // Extract first JSON object
    const match = t.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        return {};
      }
    }
    return {};
  }
}
