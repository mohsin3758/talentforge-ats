import { describe, test, expect } from "vitest";
import {
  serializeJob,
  serializeCandidate,
  serializeApplication,
  serializeInterview,
  serializeCommunication,
  serializeOffer,
  serializeNote,
  serializeAutomation,
} from "@/lib/ats/serializers";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */
function makeJobRow(overrides: Record<string, unknown> = {}) {
  return {
    id: "job-1",
    title: "Senior Engineer",
    department: "Engineering",
    location: "Remote",
    employmentType: "Full-time",
    salaryMin: 120000,
    salaryMax: 180000,
    currency: "USD",
    description: "Job description",
    requirements: JSON.stringify(["React", "TypeScript"]),
    skills: JSON.stringify(["React", "TypeScript", "Node.js"]),
    experienceYears: 5,
    status: "open",
    priority: "high",
    remoteOk: true,
    openings: 2,
    hiringManager: "Priya Venkatesan",
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-02"),
    ...overrides,
  };
}

function makeCandidateRow(overrides: Record<string, unknown> = {}) {
  return {
    id: "cand-1",
    fullName: "Jane Doe",
    email: "jane@example.com",
    phone: "+1234567890",
    location: "San Francisco",
    currentTitle: "Engineer",
    currentCompany: "Acme",
    yearsExperience: 7,
    skills: JSON.stringify(["React", "TypeScript"]),
    source: "linkedin",
    resumeText: "Resume text",
    linkedinUrl: "https://linkedin.com/in/jane",
    portfolioUrl: null,
    tags: JSON.stringify(["star"]),
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-02"),
    ...overrides,
  };
}

function makeApplicationRow(overrides: Record<string, unknown> = {}) {
  return {
    id: "app-1",
    jobId: "job-1",
    candidateId: "cand-1",
    stage: "applied",
    matchScore: 85,
    matchReasons: JSON.stringify(["Strong React"]),
    aiSummary: "Good fit",
    source: "linkedin",
    starred: false,
    rejectedReason: null,
    appliedAt: new Date("2026-01-01"),
    stageUpdatedAt: new Date("2026-01-05"),
    hiredAt: null,
    stageHistory: JSON.stringify([{ stage: "applied", at: "2026-01-01" }]),
    job: makeJobRow(),
    candidate: makeCandidateRow(),
    interviews: [],
    communications: [],
    offers: [],
    notes: [],
    ...overrides,
  };
}

/* ------------------------------------------------------------------ */
/* serializeJob                                                        */
/* ------------------------------------------------------------------ */
describe("serializeJob", () => {
  test("parses JSON string arrays for requirements and skills", () => {
    const job = serializeJob(makeJobRow());
    expect(job.requirements).toEqual(["React", "TypeScript"]);
    expect(job.skills).toEqual(["React", "TypeScript", "Node.js"]);
  });

  test("handles already-parsed arrays", () => {
    const job = serializeJob({
      ...makeJobRow(),
      requirements: ["Python"],
      skills: ["Python", "Django"],
    });
    expect(job.requirements).toEqual(["Python"]);
    expect(job.skills).toEqual(["Python", "Django"]);
  });

  test("handles invalid JSON gracefully (returns empty array)", () => {
    const job = serializeJob({
      ...makeJobRow(),
      requirements: "not valid json{",
      skills: "also invalid",
    });
    expect(job.requirements).toEqual([]);
    expect(job.skills).toEqual([]);
  });

  test("includes applications when present", () => {
    const job = serializeJob({
      ...makeJobRow(),
      applications: [{ id: "app-1", stage: "applied", matchScore: 85 }],
    });
    expect(job.applications).toEqual([{ id: "app-1", stage: "applied", matchScore: 85 }]);
  });

  test("applications is undefined when not present", () => {
    const job = serializeJob(makeJobRow());
    expect(job.applications).toBeUndefined();
  });

  test("preserves all primitive fields", () => {
    const job = serializeJob(makeJobRow());
    expect(job.id).toBe("job-1");
    expect(job.title).toBe("Senior Engineer");
    expect(job.salaryMin).toBe(120000);
    expect(job.remoteOk).toBe(true);
  });
});

/* ------------------------------------------------------------------ */
/* serializeCandidate                                                  */
/* ------------------------------------------------------------------ */
describe("serializeCandidate", () => {
  test("parses JSON string arrays for skills and tags", () => {
    const cand = serializeCandidate(makeCandidateRow());
    expect(cand.skills).toEqual(["React", "TypeScript"]);
    expect(cand.tags).toEqual(["star"]);
  });

  test("handles invalid JSON gracefully", () => {
    const cand = serializeCandidate({
      ...makeCandidateRow(),
      skills: "invalid",
      tags: "also invalid",
    });
    expect(cand.skills).toEqual([]);
    expect(cand.tags).toEqual([]);
  });

  test("preserves all primitive fields", () => {
    const cand = serializeCandidate(makeCandidateRow());
    expect(cand.id).toBe("cand-1");
    expect(cand.fullName).toBe("Jane Doe");
    expect(cand.email).toBe("jane@example.com");
    expect(cand.yearsExperience).toBe(7);
    expect(cand.source).toBe("linkedin");
  });
});

/* ------------------------------------------------------------------ */
/* serializeApplication                                                */
/* ------------------------------------------------------------------ */
describe("serializeApplication", () => {
  test("parses JSON string arrays for matchReasons and stageHistory", () => {
    const app = serializeApplication(makeApplicationRow());
    expect(app.matchReasons).toEqual(["Strong React"]);
    expect(app.stageHistory).toEqual([{ stage: "applied", at: "2026-01-01" }]);
  });

  test("handles invalid JSON gracefully", () => {
    const app = serializeApplication({
      ...makeApplicationRow(),
      matchReasons: "invalid",
      stageHistory: "also invalid",
    });
    expect(app.matchReasons).toEqual([]);
    expect(app.stageHistory).toEqual([]);
  });

  test("serializes nested job and candidate", () => {
    const app = serializeApplication(makeApplicationRow());
    expect(app.job?.title).toBe("Senior Engineer");
    expect(app.candidate?.fullName).toBe("Jane Doe");
  });

  test("serializes nested interviews/communications/offers/notes when present", () => {
    const app = serializeApplication({
      ...makeApplicationRow(),
      interviews: [{
        id: "int-1", applicationId: "app-1", type: "phone",
        scheduledAt: new Date(), durationMin: 60, interviewer: "HM",
        location: null, status: "completed", feedback: "Good", rating: 4,
        aiQuestions: JSON.stringify(["Q1"]), aiSummary: null, createdAt: new Date(),
      }],
      notes: [{
        id: "note-1", applicationId: "app-1", author: "Recruiter",
        content: "Note", isPrivate: false, createdAt: new Date(),
      }],
    });
    expect(app.interviews).toHaveLength(1);
    expect(app.interviews?.[0].aiQuestions).toEqual(["Q1"]);
    expect(app.notes).toHaveLength(1);
  });
});

/* ------------------------------------------------------------------ */
/* serializeInterview                                                  */
/* ------------------------------------------------------------------ */
describe("serializeInterview", () => {
  test("parses aiQuestions JSON string", () => {
    const interview = serializeInterview({
      id: "int-1", applicationId: "app-1", type: "phone",
      scheduledAt: new Date(), durationMin: 60, interviewer: "HM",
      location: null, status: "completed", feedback: null, rating: null,
      aiQuestions: JSON.stringify(["Q1", "Q2"]), aiSummary: null, createdAt: new Date(),
    });
    expect(interview.aiQuestions).toEqual(["Q1", "Q2"]);
  });
});

/* ------------------------------------------------------------------ */
/* serializeCommunication                                              */
/* ------------------------------------------------------------------ */
describe("serializeCommunication", () => {
  test("preserves all fields", () => {
    const comm = serializeCommunication({
      id: "comm-1", applicationId: "app-1", channel: "email", direction: "outbound",
      subject: "Hello", body: "Body text", aiGenerated: true, status: "sent",
      createdAt: new Date(),
    });
    expect(comm.channel).toBe("email");
    expect(comm.aiGenerated).toBe(true);
    expect(comm.body).toBe("Body text");
  });
});

/* ------------------------------------------------------------------ */
/* serializeOffer                                                      */
/* ------------------------------------------------------------------ */
describe("serializeOffer", () => {
  test("preserves all fields", () => {
    const offer = serializeOffer({
      id: "offer-1", applicationId: "app-1", salary: 120000, currency: "USD",
      startDate: new Date("2026-02-01"), terms: "Standard", aiGenerated: false,
      status: "sent", createdAt: new Date(),
    });
    expect(offer.salary).toBe(120000);
    expect(offer.status).toBe("sent");
  });
});

/* ------------------------------------------------------------------ */
/* serializeNote                                                       */
/* ------------------------------------------------------------------ */
describe("serializeNote", () => {
  test("preserves all fields", () => {
    const note = serializeNote({
      id: "note-1", applicationId: "app-1", author: "Recruiter",
      content: "Great candidate", isPrivate: true, createdAt: new Date(),
    });
    expect(note.author).toBe("Recruiter");
    expect(note.isPrivate).toBe(true);
  });
});

/* ------------------------------------------------------------------ */
/* serializeAutomation                                                 */
/* ------------------------------------------------------------------ */
describe("serializeAutomation", () => {
  test("parses JSON string for triggerConfig and actionConfig", () => {
    const automation = serializeAutomation({
      id: "auto-1", name: "Test Rule", description: "Test",
      trigger: "score_threshold", triggerConfig: JSON.stringify({ min: 80 }),
      action: "send_email", actionConfig: JSON.stringify({ template: "rejection" }),
      enabled: true, runCount: 5, createdAt: new Date(), updatedAt: new Date(),
    });
    expect(automation.triggerConfig).toEqual({ min: 80 });
    expect(automation.actionConfig).toEqual({ template: "rejection" });
  });

  test("handles invalid JSON gracefully (returns empty object)", () => {
    const automation = serializeAutomation({
      id: "auto-1", name: "Test", description: "",
      trigger: "score_threshold", triggerConfig: "invalid",
      action: "send_email", actionConfig: "also invalid",
      enabled: true, runCount: 0, createdAt: new Date(), updatedAt: new Date(),
    });
    expect(automation.triggerConfig).toEqual({});
    expect(automation.actionConfig).toEqual({});
  });

  test("handles already-parsed objects", () => {
    const automation = serializeAutomation({
      id: "auto-1", name: "Test", description: "",
      trigger: "score_threshold", triggerConfig: { min: 75 },
      action: "send_email", actionConfig: { template: "welcome" },
      enabled: true, runCount: 0, createdAt: new Date(), updatedAt: new Date(),
    });
    expect(automation.triggerConfig).toEqual({ min: 75 });
  });
});
