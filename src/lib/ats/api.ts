import type {
  Job,
  Candidate,
  Application,
  Interview,
  Communication,
  Offer,
  Note,
  Automation,
  Analytics,
  AIBrief,
  AIScoreResult,
  AIParseResumeResult,
} from "./types";

function parseArray<T = string>(raw: unknown): T[] {
  if (Array.isArray(raw)) return raw as T[];
  if (typeof raw === "string") {
    try {
      const v = JSON.parse(raw);
      return Array.isArray(v) ? (v as T[]) : [];
    } catch {
      return [];
    }
  }
  return [];
}

function parseObject(raw: unknown): Record<string, unknown> {
  if (raw && typeof raw === "object") return raw as Record<string, unknown>;
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }
  return {};
}

export function mapJob(j: Record<string, unknown>): Job {
  return {
    id: j.id as string,
    title: j.title as string,
    department: j.department as string,
    location: j.location as string,
    employmentType: j.employmentType as Job["employmentType"],
    salaryMin: (j.salaryMin as number | null) ?? null,
    salaryMax: (j.salaryMax as number | null) ?? null,
    currency: (j.currency as string) ?? "USD",
    description: j.description as string,
    requirements: parseArray(j.requirements),
    skills: parseArray(j.skills),
    experienceYears: (j.experienceYears as number) ?? 0,
    status: (j.status as Job["status"]) ?? "draft",
    priority: (j.priority as Job["priority"]) ?? "medium",
    remoteOk: (j.remoteOk as boolean) ?? true,
    openings: (j.openings as number) ?? 1,
    hiringManager: j.hiringManager as string,
    createdAt: j.createdAt as string,
    updatedAt: j.updatedAt as string,
    applications: j.applications ? (j.applications as Application[]) : undefined,
  };
}

export function mapCandidate(c: Record<string, unknown>): Candidate {
  return {
    id: c.id as string,
    fullName: c.fullName as string,
    email: c.email as string,
    phone: (c.phone as string | null) ?? null,
    location: (c.location as string | null) ?? null,
    currentTitle: (c.currentTitle as string | null) ?? null,
    currentCompany: (c.currentCompany as string | null) ?? null,
    yearsExperience: (c.yearsExperience as number) ?? 0,
    skills: parseArray(c.skills),
    source: (c.source as Candidate["source"]) ?? "direct",
    resumeText: (c.resumeText as string) ?? "",
    linkedinUrl: (c.linkedinUrl as string | null) ?? null,
    portfolioUrl: (c.portfolioUrl as string | null) ?? null,
    tags: parseArray(c.tags),
    createdAt: c.createdAt as string,
    updatedAt: c.updatedAt as string,
    applications: c.applications ? (c.applications as Application[]) : undefined,
  };
}

export function mapApplication(a: Record<string, unknown>): Application {
  return {
    id: a.id as string,
    jobId: a.jobId as string,
    candidateId: a.candidateId as string,
    stage: (a.stage as Application["stage"]) ?? "applied",
    matchScore: (a.matchScore as number) ?? 0,
    matchReasons: parseArray(a.matchReasons),
    aiSummary: (a.aiSummary as string) ?? "",
    source: (a.source as Application["source"]) ?? "direct",
    starred: (a.starred as boolean) ?? false,
    rejectedReason: (a.rejectedReason as string | null) ?? null,
    appliedAt: a.appliedAt as string,
    stageUpdatedAt: a.stageUpdatedAt as string,
    hiredAt: (a.hiredAt as string | null) ?? null,
    stageHistory: parseArray(a.stageHistory),
    job: a.job ? mapJob(a.job as Record<string, unknown>) : undefined,
    candidate: a.candidate ? mapCandidate(a.candidate as Record<string, unknown>) : undefined,
    interviews: a.interviews ? (a.interviews as Interview[]) : undefined,
    communications: a.communications ? (a.communications as Communication[]) : undefined,
    offers: a.offers ? (a.offers as Offer[]) : undefined,
    notes: a.notes ? (a.notes as Note[]) : undefined,
  };
}

export function mapAutomation(a: Record<string, unknown>): Automation {
  return {
    id: a.id as string,
    name: a.name as string,
    description: a.description as string,
    trigger: a.trigger as Automation["trigger"],
    triggerConfig: parseObject(a.triggerConfig),
    action: a.action as Automation["action"],
    actionConfig: parseObject(a.actionConfig),
    enabled: (a.enabled as boolean) ?? true,
    runCount: (a.runCount as number) ?? 0,
    createdAt: a.createdAt as string,
    updatedAt: a.updatedAt as string,
  };
}

export const queryKeys = {
  jobs: ["ats", "jobs"] as const,
  job: (id: string) => ["ats", "jobs", id] as const,
  candidates: (q?: string) => ["ats", "candidates", q ?? ""] as const,
  candidate: (id: string) => ["ats", "candidates", id] as const,
  applications: (filters?: Record<string, unknown>) =>
    ["ats", "applications", filters ?? {}] as const,
  application: (id: string) => ["ats", "applications", id] as const,
  interviews: (id?: string) => ["ats", "interviews", id ?? ""] as const,
  communications: (id?: string) => ["ats", "communications", id ?? ""] as const,
  offers: (id?: string) => ["ats", "offers", id ?? ""] as const,
  notes: (id?: string) => ["ats", "notes", id ?? ""] as const,
  automations: ["ats", "automations"] as const,
  analytics: ["ats", "analytics"] as const,
  brief: ["ats", "brief"] as const,
};

async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  listJobs: (status?: string) =>
    fetchJSON<unknown[]>(`/api/ats/jobs${status ? `?status=${status}` : ""}`).then(
      (r) => (r as Record<string, unknown>[]).map(mapJob),
    ),
  getJob: (id: string) =>
    fetchJSON<Record<string, unknown>>(`/api/ats/jobs/${id}`).then(mapJob),
  createJob: (data: Partial<Job>) =>
    fetchJSON<Record<string, unknown>>("/api/ats/jobs", {
      method: "POST",
      body: JSON.stringify(data),
    }).then(mapJob),
  updateJob: (id: string, data: Partial<Job>) =>
    fetchJSON<Record<string, unknown>>(`/api/ats/jobs/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }).then(mapJob),
  deleteJob: (id: string) =>
    fetchJSON<{ ok: boolean }>(`/api/ats/jobs/${id}`, { method: "DELETE" }),

  listCandidates: (q?: string) =>
    fetchJSON<unknown[]>(
      `/api/ats/candidates${q ? `?q=${encodeURIComponent(q)}` : ""}`,
    ).then((r) => (r as Record<string, unknown>[]).map(mapCandidate)),
  getCandidate: (id: string) =>
    fetchJSON<Record<string, unknown>>(`/api/ats/candidates/${id}`).then(mapCandidate),
  createCandidate: (data: Partial<Candidate>) =>
    fetchJSON<Record<string, unknown>>("/api/ats/candidates", {
      method: "POST",
      body: JSON.stringify(data),
    }).then(mapCandidate),
  updateCandidate: (id: string, data: Partial<Candidate>) =>
    fetchJSON<Record<string, unknown>>(`/api/ats/candidates/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }).then(mapCandidate),

  listApplications: (filters: Record<string, string> = {}) => {
    const qs = new URLSearchParams(filters).toString();
    return fetchJSON<unknown[]>(`/api/ats/applications${qs ? `?${qs}` : ""}`).then((r) =>
      (r as Record<string, unknown>[]).map(mapApplication),
    );
  },
  getApplication: (id: string) =>
    fetchJSON<Record<string, unknown>>(`/api/ats/applications/${id}`).then(mapApplication),
  updateApplication: (id: string, data: Partial<Application>) =>
    fetchJSON<Record<string, unknown>>(`/api/ats/applications/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }).then(mapApplication),
  moveStage: (id: string, stage: string) =>
    fetchJSON<Record<string, unknown>>(`/api/ats/applications/${id}/stage`, {
      method: "POST",
      body: JSON.stringify({ stage }),
    }).then(mapApplication),

  listInterviews: (applicationId?: string) =>
    fetchJSON<unknown[]>(
      `/api/ats/interviews${applicationId ? `?applicationId=${applicationId}` : ""}`,
    ),
  createInterview: (data: Partial<Interview>) =>
    fetchJSON<unknown>("/api/ats/interviews", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  listCommunications: (applicationId?: string) =>
    fetchJSON<unknown[]>(
      `/api/ats/communications${applicationId ? `?applicationId=${applicationId}` : ""}`,
    ),
  createCommunication: (data: Partial<Communication>) =>
    fetchJSON<unknown>("/api/ats/communications", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  listOffers: (applicationId?: string) =>
    fetchJSON<unknown[]>(
      `/api/ats/offers${applicationId ? `?applicationId=${applicationId}` : ""}`,
    ),
  createOffer: (data: Partial<Offer>) =>
    fetchJSON<unknown>("/api/ats/offers", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  listNotes: (applicationId?: string) =>
    fetchJSON<unknown[]>(`/api/ats/notes${applicationId ? `?applicationId=${applicationId}` : ""}`),
  createNote: (data: Partial<Note>) =>
    fetchJSON<unknown>("/api/ats/notes", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  listAutomations: () =>
    fetchJSON<unknown[]>(`/api/ats/automations`).then((r) =>
      (r as Record<string, unknown>[]).map(mapAutomation),
    ),
  createAutomation: (data: Partial<Automation>) =>
    fetchJSON<Record<string, unknown>>("/api/ats/automations", {
      method: "POST",
      body: JSON.stringify(data),
    }).then(mapAutomation),
  updateAutomation: (id: string, data: Partial<Automation>) =>
    fetchJSON<Record<string, unknown>>(`/api/ats/automations`, {
      method: "PATCH",
      body: JSON.stringify({ id, ...data }),
    }).then(mapAutomation),

  getAnalytics: () => fetchJSON<Analytics>(`/api/ats/analytics`),
  getBrief: () => fetchJSON<AIBrief>(`/api/ats/ai/brief`),

  aiJD: (payload: Record<string, unknown>) =>
    fetchJSON<{ content: string }>(`/api/ats/ai/jd`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  aiScore: (payload: Record<string, unknown>) =>
    fetchJSON<AIScoreResult>(`/api/ats/ai/score`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  aiInterview: (payload: Record<string, unknown>) =>
    fetchJSON<{ questions: string[]; focusAreas: string[] }>(`/api/ats/ai/interview`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  aiEmail: (payload: Record<string, unknown>) =>
    fetchJSON<{ subject: string; body: string }>(`/api/ats/ai/email`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  aiOffer: (payload: Record<string, unknown>) =>
    fetchJSON<{ content: string }>(`/api/ats/ai/offer`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  aiParseResume: (payload: { resumeText: string }) =>
    fetchJSON<AIParseResumeResult>(`/api/ats/ai/parse-resume`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
