export type Stage =
  | "applied"
  | "screen"
  | "interview"
  | "assessment"
  | "offer"
  | "hired"
  | "rejected";

export type Source =
  | "linkedin"
  | "indeed"
  | "referral"
  | "direct"
  | "job_board"
  | "agency";

export type EmploymentType =
  | "Full-time"
  | "Part-time"
  | "Contract"
  | "Temp"
  | "Internship";

export type JobStatus = "draft" | "open" | "paused" | "closed";
export type Priority = "low" | "medium" | "high" | "critical";

export interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  employmentType: EmploymentType;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string;
  description: string;
  requirements: string[];
  skills: string[];
  experienceYears: number;
  status: JobStatus;
  priority: Priority;
  remoteOk: boolean;
  openings: number;
  hiringManager: string;
  createdAt: string;
  updatedAt: string;
  applications?: Application[];
}

export interface Candidate {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  location: string | null;
  currentTitle: string | null;
  currentCompany: string | null;
  yearsExperience: number;
  skills: string[];
  source: Source;
  resumeText: string;
  linkedinUrl: string | null;
  portfolioUrl: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  applications?: Application[];
}

export interface Application {
  id: string;
  jobId: string;
  candidateId: string;
  stage: Stage;
  matchScore: number;
  matchReasons: string[];
  aiSummary: string;
  source: Source;
  starred: boolean;
  rejectedReason: string | null;
  appliedAt: string;
  stageUpdatedAt: string;
  hiredAt: string | null;
  stageHistory: { stage: string; at: string }[];
  job?: Job;
  candidate?: Candidate;
  interviews?: Interview[];
  communications?: Communication[];
  offers?: Offer[];
  notes?: Note[];
}

export interface Interview {
  id: string;
  applicationId: string;
  type: "phone" | "video" | "onsite" | "panel";
  scheduledAt: string;
  durationMin: number;
  interviewer: string;
  location: string | null;
  status: "scheduled" | "completed" | "cancelled" | "no_show";
  feedback: string | null;
  rating: number | null;
  aiQuestions: string[];
  aiSummary: string | null;
  createdAt: string;
}

export interface Communication {
  id: string;
  applicationId: string;
  channel: "email" | "sms" | "in_app";
  direction: "outbound" | "inbound";
  subject: string | null;
  body: string;
  aiGenerated: boolean;
  status: "draft" | "sent" | "delivered" | "read" | "failed";
  createdAt: string;
}

export interface Offer {
  id: string;
  applicationId: string;
  salary: number;
  currency: string;
  startDate: string;
  terms: string;
  aiGenerated: boolean;
  status: "draft" | "sent" | "accepted" | "declined" | "countered";
  createdAt: string;
}

export interface Note {
  id: string;
  applicationId: string;
  author: string;
  content: string;
  isPrivate: boolean;
  createdAt: string;
}

export interface Automation {
  id: string;
  name: string;
  description: string;
  trigger:
    | "stage_changed"
    | "application_received"
    | "score_threshold"
    | "no_activity_days";
  triggerConfig: Record<string, unknown>;
  action: "send_email" | "move_stage" | "create_task" | "alert" | "ai_screen";
  actionConfig: Record<string, unknown>;
  enabled: boolean;
  runCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Analytics {
  totalCandidates: number;
  totalJobs: number;
  totalApps: number;
  byStage: { stage: string; count: number }[];
  byStageRecord?: Record<string, number>;
  bySource: { source: string; applications: number; hires: number }[];
  avgMatchScore: number;
  hiresThisMonth: number;
  timeToHireAvgDays: number;
  /** Alias */
  timeToHireAvg?: number;
  hiringFunnel: { stage: string; count: number }[];
  sourceEffectiveness: { source: string; applications: number; hires: number }[];
  recentActivity: { type: string; desc: string; at: string }[];
  topCandidates: { id: string; fullName: string; currentTitle: string; matchScore: number }[];
  // Real computed KPIs (added in deep QA pass)
  offerAcceptanceRate: number;
  offersAccepted: number;
  offersDeclined: number;
  qualityOfHire: number;
  costPerHire: number;
}

export interface AIBrief {
  /** Spec shape */
  priorities: string[];
  candidatesNeedingAttention: { id: string; name: string; reason: string }[];
  automationsRan: number;
  /** Richer detail (kept for richer UI rendering) */
  priorityDetails: { title: string; detail: string; severity: "high" | "medium" | "low" }[];
  needsAttention: { id: string; name: string; reason: string; score: number; stage: string; jobTitle: string }[];
  automationSummary: string;
  generatedAt: string;
}

export interface AIScoreResult {
  score: number;
  reasons: string[];
  summary: string;
}

export interface AIParseResumeResult {
  name: string;
  email: string;
  phone: string;
  skills: string[];
  yearsExperience: number;
  currentTitle: string;
  summary: string;
}
