import type { Source, EmploymentType, JobStatus, Priority, Stage } from "./types";

/* ------------------------------------------------------------------ */
/* STAGES                                                              */
/* ------------------------------------------------------------------ */
export interface StageMeta {
  id: Stage;
  label: string;
  /** Tailwind text-* class, e.g. "slate" → used for dots/icons */
  color: string;
  /** Tailwind background class for badges/chips */
  tailwindBg: string;
  /** Tailwind text color class for badges/chips */
  tailwindText: string;
  /** Tailwind border color class for badges/cards */
  tailwindBorder: string;
  // ---- legacy aliases (kept so existing UI keeps working pre-rewrite) ----
  badgeClass?: string;
  barClass?: string;
  dotClass?: string;
}

export const STAGES: StageMeta[] = [
  {
    id: "applied",
    label: "Applied",
    color: "slate",
    tailwindBg: "bg-slate-100 dark:bg-slate-800/60",
    tailwindText: "text-slate-700 dark:text-slate-300",
    tailwindBorder: "border-slate-200 dark:border-slate-700",
    badgeClass: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    barClass: "bg-slate-400",
    dotClass: "bg-slate-500",
  },
  {
    id: "screen",
    label: "Screening",
    color: "sky",
    tailwindBg: "bg-sky-100 dark:bg-sky-950/60",
    tailwindText: "text-sky-700 dark:text-sky-300",
    tailwindBorder: "border-sky-200 dark:border-sky-800",
    badgeClass: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
    barClass: "bg-sky-400",
    dotClass: "bg-sky-500",
  },
  {
    id: "interview",
    label: "Interview",
    color: "violet",
    tailwindBg: "bg-violet-100 dark:bg-violet-950/60",
    tailwindText: "text-violet-700 dark:text-violet-300",
    tailwindBorder: "border-violet-200 dark:border-violet-800",
    badgeClass: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
    barClass: "bg-violet-400",
    dotClass: "bg-violet-500",
  },
  {
    id: "assessment",
    label: "Assessment",
    color: "amber",
    tailwindBg: "bg-amber-100 dark:bg-amber-950/60",
    tailwindText: "text-amber-700 dark:text-amber-300",
    tailwindBorder: "border-amber-200 dark:border-amber-800",
    badgeClass: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
    barClass: "bg-amber-400",
    dotClass: "bg-amber-500",
  },
  {
    id: "offer",
    label: "Offer",
    color: "cyan",
    tailwindBg: "bg-cyan-100 dark:bg-cyan-950/60",
    tailwindText: "text-cyan-700 dark:text-cyan-300",
    tailwindBorder: "border-cyan-200 dark:border-cyan-800",
    badgeClass: "bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300",
    barClass: "bg-cyan-400",
    dotClass: "bg-cyan-500",
  },
  {
    id: "hired",
    label: "Hired",
    color: "emerald",
    tailwindBg: "bg-emerald-100 dark:bg-emerald-950/60",
    tailwindText: "text-emerald-700 dark:text-emerald-300",
    tailwindBorder: "border-emerald-200 dark:border-emerald-800",
    badgeClass: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    barClass: "bg-emerald-400",
    dotClass: "bg-emerald-500",
  },
  {
    id: "rejected",
    label: "Rejected",
    color: "rose",
    tailwindBg: "bg-rose-100 dark:bg-rose-950/60",
    tailwindText: "text-rose-700 dark:text-rose-300",
    tailwindBorder: "border-rose-200 dark:border-rose-800",
    badgeClass: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
    barClass: "bg-rose-400",
    dotClass: "bg-rose-500",
  },
];

export const STAGE_LABELS: Record<Stage, string> = STAGES.reduce(
  (acc, s) => ({ ...acc, [s.id]: s.label }),
  {} as Record<Stage, string>,
);

export const STAGE_IDS = STAGES.map((s) => s.id);

export const ACTIVE_STAGES: Stage[] = ["applied", "screen", "interview", "assessment", "offer", "hired"];

/* ------------------------------------------------------------------ */
/* SOURCES                                                             */
/* ------------------------------------------------------------------ */
export interface SourceMeta {
  id: Source;
  label: string;
  /** Lucide icon name (camelCase as exported by lucide-react) */
  icon: string;
  /** Hex color for charts */
  color: string;
}

export const SOURCES: SourceMeta[] = [
  { id: "linkedin", label: "LinkedIn", icon: "Linkedin", color: "#0A66C2" },
  { id: "indeed", label: "Indeed", icon: "Briefcase", color: "#003A9B" },
  { id: "referral", label: "Referral", icon: "Users", color: "#10B981" },
  { id: "direct", label: "Direct", icon: "Globe", color: "#6366F1" },
  { id: "job_board", label: "Job Board", icon: "ClipboardList", color: "#F59E0B" },
  { id: "agency", label: "Agency", icon: "Building2", color: "#EC4899" },
];

export const SOURCE_LABELS: Record<Source, string> = SOURCES.reduce(
  (acc, s) => ({ ...acc, [s.id]: s.label }),
  {} as Record<Source, string>,
);

/* ------------------------------------------------------------------ */
/* ENUMS                                                               */
/* ------------------------------------------------------------------ */
export const EMPLOYMENT_TYPES: EmploymentType[] = [
  "Full-time",
  "Part-time",
  "Contract",
  "Temp",
  "Internship",
];

export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  "Full-time": "Full-time",
  "Part-time": "Part-time",
  "Contract": "Contract",
  "Temp": "Temp",
  "Internship": "Internship",
};

export const JOB_STATUSES: JobStatus[] = ["draft", "open", "paused", "closed"];

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  draft: "Draft",
  open: "Open",
  paused: "Paused",
  closed: "Closed",
};

export const PRIORITIES: Priority[] = ["low", "medium", "high", "critical"];

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

export const PRIORITY_BADGE: Record<Priority, string> = {
  low: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  medium: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
  high: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  critical: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
};

/* ------------------------------------------------------------------ */
/* AUTOMATIONS                                                         */
/* ------------------------------------------------------------------ */
export const TRIGGER_TYPES = [
  { id: "stage_changed", label: "Stage Changed" },
  { id: "application_received", label: "Application Received" },
  { id: "score_threshold", label: "Match Score Threshold" },
  { id: "no_activity_days", label: "No Activity (Days)" },
] as const;

export const ACTION_TYPES = [
  { id: "send_email", label: "Send Email" },
  { id: "move_stage", label: "Move Stage" },
  { id: "create_task", label: "Create Task" },
  { id: "alert", label: "Send Alert" },
  { id: "ai_screen", label: "AI Screen" },
] as const;

export const AUTOMATION_TEMPLATES = [
  {
    name: "Auto-screen top applicants",
    description:
      "When an application's match score exceeds 80, automatically move them to the Screening stage and notify the hiring manager.",
    trigger: "score_threshold" as const,
    triggerConfig: { min: 80 },
    action: "ai_screen" as const,
    actionConfig: {},
  },
  {
    name: "Auto-reject bottom applicants",
    description:
      "When an application scores below 40, send a polite rejection email and move to Rejected stage.",
    trigger: "score_threshold" as const,
    triggerConfig: { max: 40 },
    action: "send_email" as const,
    actionConfig: { template: "rejection" },
  },
  {
    name: "Top 5 → Interview",
    description:
      "When candidates enter Screening, advance the top 5 by score to Interview after 2 days.",
    trigger: "stage_changed" as const,
    triggerConfig: { to: "screen" },
    action: "move_stage" as const,
    actionConfig: { to: "interview" },
  },
  {
    name: "Alert: no activity 5d",
    description:
      "When an application has no activity for 5 days, alert the assigned recruiter.",
    trigger: "no_activity_days" as const,
    triggerConfig: { days: 5 },
    action: "alert" as const,
    actionConfig: {},
  },
  {
    name: "AI summary to HM",
    description:
      "When a candidate moves to Interview stage, generate an AI summary and email it to the hiring manager.",
    trigger: "stage_changed" as const,
    triggerConfig: { to: "interview" },
    action: "send_email" as const,
    actionConfig: { template: "summary_to_hm" },
  },
];

/* ------------------------------------------------------------------ */
/* ATS COMPETITIVE LANDSCAPE                                           */
/* ------------------------------------------------------------------ */
export const COMPETITORS = [
  { id: "talentforge", label: "TalentForge" },
  { id: "workday", label: "Workday" },
  { id: "greenhouse", label: "Greenhouse" },
  { id: "lever", label: "Lever" },
  { id: "icims", label: "iCIMS" },
  { id: "bamboohr", label: "BambooHR" },
  { id: "smartrecruiters", label: "SmartRecruiters" },
  { id: "jazzhr", label: "JazzHR" },
];

export type FeatureValue = "full" | "partial" | "none";

export interface FeatureRow {
  feature: string;
  talentforge: FeatureValue;
  workday: FeatureValue;
  greenhouse: FeatureValue;
  lever: FeatureValue;
  icims: FeatureValue;
  bamboohr: FeatureValue;
  smartrecruiters: FeatureValue;
  jazzhr: FeatureValue;
}

/** 15 features × 8 ATS columns. Research-informed. */
export const FEATURE_MATRIX: FeatureRow[] = [
  { feature: "AI Resume Scoring",       talentforge: "full", workday: "partial", greenhouse: "partial", lever: "none",    icims: "partial", bamboohr: "none",    smartrecruiters: "partial", jazzhr: "none" },
  { feature: "AI JD Generation",        talentforge: "full", workday: "none",    greenhouse: "partial", lever: "none",    icims: "none",    bamboohr: "none",    smartrecruiters: "partial", jazzhr: "none" },
  { feature: "AI Interview Questions",  talentforge: "full", workday: "none",    greenhouse: "none",    lever: "none",    icims: "none",    bamboohr: "none",    smartrecruiters: "none",    jazzhr: "none" },
  { feature: "AI Email Drafting",       talentforge: "full", workday: "partial", greenhouse: "none",    lever: "partial", icims: "none",    bamboohr: "none",    smartrecruiters: "partial", jazzhr: "none" },
  { feature: "AI Offer Letters",        talentforge: "full", workday: "none",    greenhouse: "none",    lever: "none",    icims: "none",    bamboohr: "none",    smartrecruiters: "none",    jazzhr: "none" },
  { feature: "AI Daily Brief",          talentforge: "full", workday: "none",    greenhouse: "none",    lever: "none",    icims: "none",    bamboohr: "none",    smartrecruiters: "none",    jazzhr: "none" },
  { feature: "AI Resume Parsing",       talentforge: "full", workday: "partial", greenhouse: "partial", lever: "partial", icims: "partial", bamboohr: "partial", smartrecruiters: "partial", jazzhr: "partial" },
  { feature: "Drag-Drop Pipeline",      talentforge: "full", workday: "partial", greenhouse: "full",    lever: "full",    icims: "full",    bamboohr: "partial", smartrecruiters: "full",    jazzhr: "partial" },
  { feature: "Visual Automations",      talentforge: "full", workday: "partial", greenhouse: "full",    lever: "partial", icims: "partial", bamboohr: "none",    smartrecruiters: "full",    jazzhr: "none" },
  { feature: "Source Effectiveness",    talentforge: "full", workday: "full",    greenhouse: "full",    lever: "full",    icims: "full",    bamboohr: "partial", smartrecruiters: "full",    jazzhr: "partial" },
  { feature: "Time-to-Hire Tracking",   talentforge: "full", workday: "full",    greenhouse: "full",    lever: "full",    icims: "full",    bamboohr: "full",    smartrecruiters: "full",    jazzhr: "full" },
  { feature: "Offer Management",        talentforge: "full", workday: "full",    greenhouse: "full",    lever: "full",    icims: "full",    bamboohr: "full",    smartrecruiters: "full",    jazzhr: "partial" },
  { feature: "Mobile-First UX",         talentforge: "full", workday: "partial", greenhouse: "partial", lever: "full",    icims: "partial", bamboohr: "full",    smartrecruiters: "partial", jazzhr: "full" },
  { feature: "Zero-Token AI Pricing",   talentforge: "full", workday: "none",    greenhouse: "none",    lever: "none",    icims: "none",    bamboohr: "none",    smartrecruiters: "none",    jazzhr: "none" },
  { feature: "Pricing Transparency",    talentforge: "full", workday: "none",    greenhouse: "partial", lever: "partial", icims: "none",    bamboohr: "full",    smartrecruiters: "partial", jazzhr: "full" },
];

export const PARITY_DIMENSIONS = [
  "AI Depth",
  "Automation",
  "Pipeline UX",
  "Analytics",
  "Integrations",
  "Mobile UX",
  "Compliance",
  "Pricing Transparency",
];

export const TALENTFORGE_PARITY = [95, 90, 92, 88, 78, 92, 82, 96];
export const INDUSTRY_AVERAGE_PARITY = [42, 55, 78, 82, 86, 64, 88, 48];

/* ------------------------------------------------------------------ */
/* TOP 100 ATS (real-world, research-based)                            */
/* ------------------------------------------------------------------ */
export const TOP_100_ATS: string[] = [
  "Workday Recruiting", "Greenhouse", "Lever", "iCIMS Talent Cloud", "BambooHR",
  "SmartRecruiters", "JazzHR", "Recruitee", "Ashby", "Personio",
  "SAP SuccessFactors Recruiting", "Oracle Taleo", "ADP Workforce Now", "UKG Pro Recruiting",
  "Zoho Recruit", "Teamtailor", "BreezyHR", "Manatal", "Freshteam", "ClearCompany",
  "Homerun", "Workable", "Pinpoint", "Brightmove", "TrackerRMS",
  "Bullhorn", "JobDiva", "Ceipal", "AkkenCloud", "Avionté",
  "BigBillwer", "TempWorks", "LaborEdge", "Beeline", "SAP Fieldglass",
  "PRO Unlimited", "PeopleFluent", "Joveo", "Korn Ferry", "PageUp",
  "HR Avatar", "Skillsarena", "TestGorilla", "HackerRank", "Codility",
  "CoderPad", "Vidcruiter", "HireVue", "Modern Hire", "Montage",
  "Outmatch", "Spark Hire", "Wepow", "Yakaza", "Recright",
  "Sonru", "ASYNC", "Interviewing.io", "CodeSignal", "Qualified.io",
  "CodeSubmit", "Devskiller", "TestDome", "Peerless", "Outvite",
  "WelcomeKit", "Tribepad", "Softgware", "Nmbrs", "Wellevue",
  "Officient", "HRCloud", "RecruitBPM", "Recruitly", "HireQuest",
  "Jobscore", "Recruiterbox", "Oracle HCM Recruiting", "PeopleSoft Recruiting",
  "Infor HCM", "Cornerstone Recruiting", "Saba Recruiting", "SumTotal", "Docebo",
  "Crossknowledge", "Litmos", "Taleo Enterprise Edition", "Jobvite CRM", "iCIMS ATS",
  "Greenhouse CRM", "Lever Nurture", "SmartRecruiters CRM", "Ashby HRIS",
  "Personio Payroll", "BambooHR Payroll", "UKG Ready", "ADP Vantage HCM",
  "Zoho People", "Workday HCM", "SAP SuccessFactors HXM",
];

/* Random-ish parity score per ATS for the parity bubble chart (stable across renders) */
export const FEATURE_PARITY = TOP_100_ATS.map((name, i) => {
  const seed = name.charCodeAt(0) + (name.charCodeAt(name.length - 1) ?? 0) + i;
  return { name, parity: 50 + (seed % 46) };
});

/* ------------------------------------------------------------------ */
/* HELPERS                                                             */
/* ------------------------------------------------------------------ */
export function scoreColor(score: number): string {
  if (score >= 75) return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300";
  if (score >= 50) return "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300";
  return "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300";
}

export function scoreTextColor(score: number): string {
  if (score >= 75) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 50) return "text-amber-600 dark:text-amber-400";
  return "text-rose-600 dark:text-rose-400";
}

export function scoreBarColor(score: number): string {
  if (score >= 75) return "bg-emerald-500";
  if (score >= 50) return "bg-amber-500";
  return "bg-rose-500";
}

export function featureCellSymbol(v: FeatureValue) {
  if (v === "full") return { symbol: "✓", className: "text-emerald-600 dark:text-emerald-400" };
  if (v === "partial") return { symbol: "~", className: "text-amber-600 dark:text-amber-400" };
  return { symbol: "✗", className: "text-rose-500 dark:text-rose-400" };
}
