import { Prisma } from "@prisma/client";

type JobWithRelations = Prisma.JobGetPayload<{
  include: { applications: { select: { id: true; stage: true; matchScore: true } } }
}>;
type JobFull = Prisma.JobGetPayload<Record<string, never>>;
type CandidateFull = Prisma.CandidateGetPayload<Record<string, never>>;
type ApplicationWithRelations = Prisma.ApplicationGetPayload<{
  include: {
    job: true;
    candidate: true;
    interviews: true;
    communications: true;
    offers: true;
    notes: true;
  }
}>;
type InterviewFull = Prisma.InterviewGetPayload<Record<string, never>>;
type CommunicationFull = Prisma.CommunicationGetPayload<Record<string, never>>;
type OfferFull = Prisma.OfferGetPayload<Record<string, never>>;
type NoteFull = Prisma.NoteGetPayload<Record<string, never>>;
type AutomationFull = Prisma.AutomationGetPayload<Record<string, never>>;

function parseArr<T = string>(raw: unknown): T[] {
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

function parseObj(raw: unknown): Record<string, unknown> {
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

export function serializeJob(j: JobFull | JobWithRelations) {
  return {
    id: j.id,
    title: j.title,
    department: j.department,
    location: j.location,
    employmentType: j.employmentType,
    salaryMin: j.salaryMin,
    salaryMax: j.salaryMax,
    currency: j.currency,
    description: j.description,
    requirements: parseArr(j.requirements),
    skills: parseArr(j.skills),
    experienceYears: j.experienceYears,
    status: j.status,
    priority: j.priority,
    remoteOk: j.remoteOk,
    openings: j.openings,
    hiringManager: j.hiringManager,
    createdAt: j.createdAt,
    updatedAt: j.updatedAt,
    applications:
      "applications" in j && j.applications
        ? j.applications.map((a) => ({
            id: a.id,
            stage: a.stage,
            matchScore: a.matchScore,
          }))
        : undefined,
  };
}

export function serializeCandidate(c: CandidateFull) {
  return {
    id: c.id,
    fullName: c.fullName,
    email: c.email,
    phone: c.phone,
    location: c.location,
    currentTitle: c.currentTitle,
    currentCompany: c.currentCompany,
    yearsExperience: c.yearsExperience,
    skills: parseArr(c.skills),
    source: c.source,
    resumeText: c.resumeText,
    linkedinUrl: c.linkedinUrl,
    portfolioUrl: c.portfolioUrl,
    tags: parseArr(c.tags),
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  };
}

export function serializeApplication(a: ApplicationWithRelations) {
  return {
    id: a.id,
    jobId: a.jobId,
    candidateId: a.candidateId,
    stage: a.stage,
    matchScore: a.matchScore,
    matchReasons: parseArr(a.matchReasons),
    aiSummary: a.aiSummary,
    source: a.source,
    starred: a.starred,
    rejectedReason: a.rejectedReason,
    appliedAt: a.appliedAt,
    stageUpdatedAt: a.stageUpdatedAt,
    hiredAt: a.hiredAt,
    stageHistory: parseArr(a.stageHistory),
    job: a.job ? serializeJob(a.job) : undefined,
    candidate: a.candidate ? serializeCandidate(a.candidate) : undefined,
    interviews: a.interviews ? a.interviews.map(serializeInterview) : undefined,
    communications: a.communications ? a.communications.map(serializeCommunication) : undefined,
    offers: a.offers ? a.offers.map(serializeOffer) : undefined,
    notes: a.notes ? a.notes.map(serializeNote) : undefined,
  };
}

export function serializeInterview(i: InterviewFull) {
  return {
    id: i.id,
    applicationId: i.applicationId,
    type: i.type,
    scheduledAt: i.scheduledAt,
    durationMin: i.durationMin,
    interviewer: i.interviewer,
    location: i.location,
    status: i.status,
    feedback: i.feedback,
    rating: i.rating,
    aiQuestions: parseArr(i.aiQuestions),
    aiSummary: i.aiSummary,
    createdAt: i.createdAt,
  };
}

export function serializeCommunication(c: CommunicationFull) {
  return {
    id: c.id,
    applicationId: c.applicationId,
    channel: c.channel,
    direction: c.direction,
    subject: c.subject,
    body: c.body,
    aiGenerated: c.aiGenerated,
    status: c.status,
    createdAt: c.createdAt,
  };
}

export function serializeOffer(o: OfferFull) {
  return {
    id: o.id,
    applicationId: o.applicationId,
    salary: o.salary,
    currency: o.currency,
    startDate: o.startDate,
    terms: o.terms,
    aiGenerated: o.aiGenerated,
    status: o.status,
    createdAt: o.createdAt,
  };
}

export function serializeNote(n: NoteFull) {
  return {
    id: n.id,
    applicationId: n.applicationId,
    author: n.author,
    content: n.content,
    isPrivate: n.isPrivate,
    createdAt: n.createdAt,
  };
}

export function serializeAutomation(a: AutomationFull) {
  return {
    id: a.id,
    name: a.name,
    description: a.description,
    trigger: a.trigger,
    triggerConfig: parseObj(a.triggerConfig),
    action: a.action,
    actionConfig: parseObj(a.actionConfig),
    enabled: a.enabled,
    runCount: a.runCount,
    createdAt: a.createdAt,
    updatedAt: a.updatedAt,
  };
}
