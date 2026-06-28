import { db } from "../src/lib/db";

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length];
}

function parseArr(v: unknown): string[] {
  if (Array.isArray(v)) return v as string[];
  if (typeof v === "string") {
    try {
      const r = JSON.parse(v);
      return Array.isArray(r) ? r : [];
    } catch {
      return [];
    }
  }
  return [];
}

async function main() {
  console.log("Clearing existing data…");
  await db.note.deleteMany();
  await db.offer.deleteMany();
  await db.communication.deleteMany();
  await db.interview.deleteMany();
  await db.application.deleteMany();
  await db.candidate.deleteMany();
  await db.job.deleteMany();
  await db.automation.deleteMany();

  console.log("Creating jobs…");
  const jobs = await Promise.all([
    db.job.create({
      data: {
        title: "Senior React Engineer",
        department: "Engineering",
        location: "Remote",
        employmentType: "Full-time",
        salaryMin: 150000,
        salaryMax: 210000,
        currency: "USD",
        description:
          "We are hiring a Senior React Engineer to lead frontend architecture for our flagship analytics platform. You will own complex features end-to-end, mentor mid-level engineers, and partner with design and product to ship a world-class UX. This role requires deep expertise in React 18+, TypeScript, state management, and modern build tooling. You should be comfortable making architectural tradeoffs, driving performance initiatives, and advocating for engineering best practices across the org.",
        requirements: JSON.stringify([
          "5+ years building production React apps",
          "Deep TypeScript expertise",
          "Experience with Next.js 14+ App Router",
          "Strong CSS / Tailwind fundamentals",
          "Test-driven mindset (Vitest, Playwright)",
          "Excellent communication skills",
        ]),
        skills: JSON.stringify(["React", "TypeScript", "Next.js", "Tailwind CSS", "Vite", "Vitest", "Node.js"]),
        experienceYears: 5,
        status: "open",
        priority: "critical",
        remoteOk: true,
        openings: 2,
        hiringManager: "Priya Venkatesan",
      },
    }),
    db.job.create({
      data: {
        title: "Staff Accountant",
        department: "Finance",
        location: "New York, NY",
        employmentType: "Full-time",
        salaryMin: 75000,
        salaryMax: 95000,
        currency: "USD",
        description:
          "We are looking for a detail-oriented Staff Accountant to manage AP/AR, monthly close, and reconciliations. You will partner with the controller on audits, payroll support, and process improvements. The ideal candidate thrives in a fast-paced SaaS environment, has strong GAAP knowledge, and is comfortable owning a portion of the close. QuickBooks and NetSuite experience preferred.",
        requirements: JSON.stringify([
          "Bachelor's in Accounting or Finance",
          "3+ years accounting experience",
          "NetSuite or QuickBooks proficiency",
          "Strong Excel skills",
          "CPA preferred but not required",
        ]),
        skills: JSON.stringify(["NetSuite", "QuickBooks", "Excel", "GAAP", "Month-end Close", "Reconciliation"]),
        experienceYears: 3,
        status: "open",
        priority: "high",
        remoteOk: true,
        openings: 1,
        hiringManager: "Marcus Hill",
      },
    }),
    db.job.create({
      data: {
        title: "Travel Nurse RN",
        department: "Healthcare",
        location: "Multi-site",
        employmentType: "Contract",
        salaryMin: 8500,
        salaryMax: 10500,
        currency: "USD",
        description:
          "Join our travel nurse program for a 13-week ICU assignment at a Level I trauma center. You'll provide critical care to a diverse patient population, collaborate with intensivists, and mentor new grads. We offer premium pay, housing stipends, travel reimbursement, and full benefits. BLS, ACLS, and 2+ years ICU experience required.",
        requirements: JSON.stringify([
          "Active AZ RN license (or compact)",
          "BLS & ACLS certification",
          "2+ years recent ICU experience",
          "Ability to lift 50 lbs and work 12-hour shifts",
        ]),
        skills: JSON.stringify(["ICU", "Critical Care", "Epic", "Ventilator Management", "ACLS", "BLS", "Patient Assessment"]),
        experienceYears: 2,
        status: "open",
        priority: "critical",
        remoteOk: false,
        openings: 3,
        hiringManager: "Dr. Helen Okafor",
      },
    }),
    db.job.create({
      data: {
        title: "Warehouse Associate",
        department: "Operations",
        location: "Dallas, TX",
        employmentType: "Temp",
        salaryMin: 38000,
        salaryMax: 46000,
        currency: "USD",
        description:
          "We're hiring Warehouse Associates for our Dallas distribution center. You'll pick, pack, and ship orders using RF scanners, operate pallet jacks and forklifts, and maintain a clean, safety-first work environment. Opportunities for overtime and advancement to lead roles. Climate-controlled facility with on-site parking and weekly pay.",
        requirements: JSON.stringify([
          "High school diploma or equivalent",
          "Ability to stand for 8-hour shifts",
          "Basic math and scanner skills",
          "Reliable transportation",
        ]),
        skills: JSON.stringify(["Forklift", "OSHA 10", "RF Scanner", "Pallet Jack", "Inventory", "Picking & Packing"]),
        experienceYears: 0,
        status: "open",
        priority: "medium",
        remoteOk: false,
        openings: 12,
        hiringManager: "Tasha Robinson",
      },
    }),
    db.job.create({
      data: {
        title: "DevOps Engineer",
        department: "Engineering",
        location: "Remote",
        employmentType: "Full-time",
        salaryMin: 130000,
        salaryMax: 175000,
        currency: "USD",
        description:
          "Seeking a DevOps Engineer to own our AWS infrastructure, CI/CD pipelines, and observability stack. You'll automate everything, harden security posture, and reduce deployment friction for 40+ engineers. Strong Kubernetes, Terraform, and cost-optimization experience required. You'll also participate in on-call rotation (1 week per quarter).",
        requirements: JSON.stringify([
          "4+ years DevOps or SRE experience",
          "Deep AWS (EKS, IAM, VPC, RDS)",
          "Terraform at scale",
          "Kubernetes production experience",
          "Observability: Datadog/Grafana/OTel",
        ]),
        skills: JSON.stringify(["AWS", "Kubernetes", "Terraform", "Docker", "ArgoCD", "Datadog", "Python", "Go"]),
        experienceYears: 4,
        status: "paused",
        priority: "high",
        remoteOk: true,
        openings: 1,
        hiringManager: "Priya Venkatesan",
      },
    }),
    db.job.create({
      data: {
        title: "Marketing Manager",
        department: "Marketing",
        location: "Chicago, IL",
        employmentType: "Full-time",
        salaryMin: 110000,
        salaryMax: 140000,
        currency: "USD",
        description:
          "We're hiring a Marketing Manager to own demand generation, content strategy, and ABM campaigns. You'll lead a team of three, partner closely with sales, and report directly to the VP Marketing. Strong B2B SaaS background required; experience with HubSpot, Salesforce, and lifecycle marketing a plus. You should be equally comfortable in spreadsheets and Figma.",
        requirements: JSON.stringify([
          "5+ years B2B marketing experience",
          "2+ years managing a team",
          "HubSpot + Salesforce proficiency",
          "Strong written communication",
          "Experience running paid + organic campaigns",
        ]),
        skills: JSON.stringify(["HubSpot", "Salesforce", "SEO", "Paid Media", "Content Strategy", "ABM", "Figma"]),
        experienceYears: 5,
        status: "open",
        priority: "medium",
        remoteOk: true,
        openings: 1,
        hiringManager: "Daniel Park",
      },
    }),
  ]);

  console.log("Creating candidates…");
  const candidateSeed = [
    { fullName: "Olivia Chen", email: "olivia.chen@example.com", phone: "+1-415-555-0101", location: "San Francisco, CA", currentTitle: "Senior Frontend Engineer", currentCompany: "Stripe", yearsExperience: 6, skills: ["React", "TypeScript", "Next.js", "GraphQL", "Tailwind CSS"], source: "linkedin", resumeText: "Senior Frontend Engineer with 6 years building React apps at scale. Led migration from CRA to Next.js App Router, shipped design system used by 40+ engineers, reduced bundle size 35%. Strong TypeScript and performance optimization background." },
    { fullName: "Marcus Johnson", email: "marcus.johnson@example.com", phone: "+1-512-555-0102", location: "Austin, TX", currentTitle: "Frontend Engineer", currentCompany: "Atlassian", yearsExperience: 4, skills: ["React", "JavaScript", "CSS", "Webpack"], source: "indeed", resumeText: "Frontend Engineer with 4 years experience. Built Jira plugin marketplace UI. Comfortable with React and modern build tooling. Limited TypeScript exposure but eager to grow." },
    { fullName: "Priya Patel", email: "priya.patel@example.com", phone: "+1-206-555-0103", location: "Seattle, WA", currentTitle: "Staff Software Engineer", currentCompany: "Amazon", yearsExperience: 9, skills: ["React", "TypeScript", "Node.js", "AWS", "GraphQL"], source: "referral", resumeText: "Staff Engineer at Amazon with 9 years building full-stack React/Node apps. Architected internal design system, mentored 12 engineers, owned migration to AWS CDK. Strong on TypeScript, performance, accessibility." },
    { fullName: "Diego Ramirez", email: "diego.ramirez@example.com", phone: "+1-305-555-0104", location: "Miami, FL", currentTitle: "Junior Developer", currentCompany: "Freelance", yearsExperience: 1, skills: ["HTML", "CSS", "JavaScript"], source: "job_board", resumeText: "Bootcamp grad with 1 year freelance experience. Built small business websites with vanilla JS. No React or TypeScript experience yet but highly motivated." },
    { fullName: "Hannah Williams", email: "hannah.williams@example.com", phone: "+1-312-555-0105", location: "Chicago, IL", currentTitle: "React Developer", currentCompany: "Trunk Club", yearsExperience: 3, skills: ["React", "Redux", "TypeScript", "Jest"], source: "linkedin", resumeText: "React Developer with 3 years experience. Built customer-facing styling app. Strong TypeScript and testing background. Some Next.js exposure." },
    { fullName: "Yuki Tanaka", email: "yuki.tanaka@example.com", phone: "+1-408-555-0106", location: "San Jose, CA", currentTitle: "Senior Software Engineer", currentCompany: "Google", yearsExperience: 7, skills: ["React", "TypeScript", "Go", "Kubernetes", "gRPC"], source: "indeed", resumeText: "Senior Engineer at Google with 7 years experience. Built internal admin tools in React + TypeScript. Strong systems background in Go and Kubernetes. Mentored 8 junior engineers." },
    { fullName: "Aisha Okafor", email: "aisha.okafor@example.com", phone: "+1-615-555-0107", location: "Nashville, TN", currentTitle: "ICU Travel Nurse", currentCompany: "Cross Country Nurses", yearsExperience: 8, skills: ["ICU", "Critical Care", "Epic", "ACLS", "BLS", "Ventilator Management"], source: "agency", resumeText: "Travel RN with 8 years critical care experience. Completed 5 travel assignments at Level I trauma centers. Epic super-user, ACLS/BLS certified, strong charge nurse leadership." },
    { fullName: "Robert Smith", email: "robert.smith@example.com", phone: "+1-602-555-0108", location: "Phoenix, AZ", currentTitle: "ER Nurse", currentCompany: "Banner Health", yearsExperience: 5, skills: ["ER", "Trauma", "Cerner", "ACLS", "BLS"], source: "direct", resumeText: "ER Nurse with 5 years experience at Banner Health. Strong trauma background but limited ICU time. Cerner proficient, ACLS/BLS certified. Looking to transition to ICU." },
    { fullName: "Emily Davis", email: "emily.davis@example.com", phone: "+1-503-555-0109", location: "Portland, OR", currentTitle: "PICU Nurse", currentCompany: "OHSU", yearsExperience: 6, skills: ["ICU", "Pediatric ICU", "Epic", "ACLS", "PALS"], source: "linkedin", resumeText: "PICU Nurse with 6 years experience. Strong critical care and ventilator management skills. Epic super-user. Recently completed PALS renewal. Open to adult ICU assignments." },
    { fullName: "Carlos Mendez", email: "carlos.mendez@example.com", phone: "+1-210-555-0110", location: "San Antonio, TX", currentTitle: "Staff Accountant", currentCompany: "Torchy's Tacos", yearsExperience: 4, skills: ["NetSuite", "QuickBooks", "Excel", "Month-end Close", "GAAP"], source: "linkedin", resumeText: "Staff Accountant with 4 years experience. Owns AP/AR and a portion of month-end close at a 200-location restaurant group. NetSuite power user. CPA candidate (2 sections passed)." },
    { fullName: "Sophia Brown", email: "sophia.brown@example.com", phone: "+1-214-555-0111", location: "Dallas, TX", currentTitle: "Junior Accountant", currentCompany: "Mary Kay", yearsExperience: 1, skills: ["QuickBooks", "Excel", "Data Entry"], source: "indeed", resumeText: "Junior Accountant with 1 year experience. AP data entry and bank recs. No NetSuite experience yet but quick learner. Recent grad with finance degree." },
    { fullName: "James Wilson", email: "james.wilson@example.com", phone: "+1-720-555-0112", location: "Denver, CO", currentTitle: "Senior Accountant", currentCompany: "Arrow Electronics", yearsExperience: 6, skills: ["NetSuite", "SAP", "Excel", "Audit", "GAAP", "SOX"], source: "referral", resumeText: "Senior Accountant with 6 years experience. Owned SOX compliance and external audit at Fortune 200. NetSuite + SAP proficiency. CPA. Strong process improvement track record." },
    { fullName: "Ling Chen", email: "ling.chen@example.com", phone: "+1-617-555-0113", location: "Boston, MA", currentTitle: "Accounting Manager", currentCompany: "Wayfair", yearsExperience: 8, skills: ["NetSuite", "SQL", "Excel", "GAAP", "Team Management"], source: "linkedin", resumeText: "Accounting Manager with 8 years experience. Leads team of 5 at Wayfair. Strong NetSuite and SQL background. CPA. Looking for IC role to reduce management overhead." },
    { fullName: "Trevor Adams", email: "trevor.adams@example.com", phone: "+1-901-555-0114", location: "Memphis, TN", currentTitle: "Warehouse Worker", currentCompany: "FedEx Ground", yearsExperience: 2, skills: ["RF Scanner", "Pallet Jack", "Picking"], source: "direct", resumeText: "Warehouse worker with 2 years experience at FedEx Ground. RF scanner certified, pallet jack operator. Reliable, on-time, willing to work overtime. Forklift cert in progress." },
    { fullName: "Maria Gonzalez", email: "maria.gonzalez@example.com", phone: "+1-901-555-0115", location: "Memphis, TN", currentTitle: "Warehouse Lead", currentCompany: "AutoZone", yearsExperience: 5, skills: ["Forklift", "RF Scanner", "Inventory", "Leadership"], source: "referral", resumeText: "Warehouse Lead with 5 years experience. Forklift certified, led team of 8 at AutoZone DC. Strong inventory and cycle count skills. Bilingual English/Spanish." },
    { fullName: "Kevin Nguyen", email: "kevin.nguyen@example.com", phone: "+1-901-555-0116", location: "Bartlett, TN", currentTitle: "Picker/Packer", currentCompany: "Amazon Warehouse", yearsExperience: 1, skills: ["RF Scanner", "Picking", "Packing"], source: "indeed", resumeText: "Picker/Packer with 1 year experience at Amazon BNA4. Hit 120% rate consistently. Reliable transportation, available for all shifts." },
    { fullName: "Brittany Foster", email: "brittany.foster@example.com", phone: "+1-615-555-0117", location: "Nashville, TN", currentTitle: "Warehouse Associate", currentCompany: "Gap Distribution", yearsExperience: 3, skills: ["RF Scanner", "Forklift", "Pallet Jack"], source: "job_board", resumeText: "Warehouse Associate with 3 years experience. Forklift and pallet jack certified. Strong attendance record. Recently relocated to Memphis area, willing to commute 30 min." },
    { fullName: "Tyler Brooks", email: "tyler.brooks@example.com", phone: "+1-901-555-0118", location: "Memphis, TN", currentTitle: "Material Handler", currentCompany: "International Paper", yearsExperience: 4, skills: ["Forklift", "Stand-up Reach", "Inventory", "Safety"], source: "direct", resumeText: "Material Handler with 4 years experience at International Paper. Stand-up reach truck certified, strong safety record. Member of facility safety committee." },
    { fullName: "Naomi Lee", email: "naomi.lee@example.com", phone: "+1-646-555-0119", location: "New York, NY", currentTitle: "Marketing Manager", currentCompany: "Squarespace", yearsExperience: 6, skills: ["HubSpot", "Salesforce", "SEO", "Paid Media", "Content Strategy"], source: "linkedin", resumeText: "Marketing Manager with 6 years B2B SaaS experience. Owns demand gen at Squarespace. HubSpot + Salesforce power user. Grew organic traffic 80% YoY. Manages team of 3." },
    { fullName: "Ethan Wright", email: "ethan.wright@example.com", phone: "+1-917-555-0120", location: "Brooklyn, NY", currentTitle: "Content Marketer", currentCompany: "Notion", yearsExperience: 3, skills: ["SEO", "Content Strategy", "Figma", "Webflow", "Copywriting"], source: "indeed", resumeText: "Content Marketer with 3 years experience. Strong SEO and writing background. Limited paid media exposure. Built Notion's templates gallery growth strategy." },
    { fullName: "Grace Park", email: "grace.park@example.com", phone: "+1-201-555-0121", location: "Jersey City, NJ", currentTitle: "Senior Marketing Manager", currentCompany: "Asana", yearsExperience: 8, skills: ["HubSpot", "ABM", "Salesforce", "Paid Media", "Lifecycle Marketing"], source: "linkedin", resumeText: "Senior Marketing Manager with 8 years B2B SaaS. Owns ABM and lifecycle at Asana. HubSpot + Salesforce expert. Built multi-touch attribution model. Manages team of 4." },
    { fullName: "Omar Hassan", email: "omar.hassan@example.com", phone: "+1-929-555-0122", location: "Queens, NY", currentTitle: "Growth Marketer", currentCompany: "Better.com", yearsExperience: 4, skills: ["Paid Media", "Google Ads", "Meta Ads", "Analytics", "SQL"], source: "indeed", resumeText: "Growth Marketer with 4 years experience. Strong paid media and analytics background. Limited content/SEO exposure. Managed $2M annual ad spend at Better.com." },
    { fullName: "Raj Mehta", email: "raj.mehta@example.com", phone: "+1-408-555-0123", location: "Sunnyvale, CA", currentTitle: "DevOps Engineer", currentCompany: "Splunk", yearsExperience: 5, skills: ["AWS", "Kubernetes", "Terraform", "Docker", "Python"], source: "linkedin", resumeText: "DevOps Engineer with 5 years experience. Owns EKS platform at Splunk. Terraform at scale (200+ modules). Strong cost optimization track record, saved $400K annually." },
    { fullName: "Elena Petrova", email: "elena.petrova@example.com", phone: "+1-415-555-0124", location: "San Francisco, CA", currentTitle: "SRE", currentCompany: "Cloudflare", yearsExperience: 6, skills: ["Kubernetes", "Go", "Prometheus", "Grafana", "Terraform"], source: "referral", resumeText: "SRE with 6 years experience. Strong Kubernetes + Go background. Built multi-region failover at Cloudflare. Limited AWS exposure (mostly bare metal + GCP)." },
    { fullName: "Felix Bauer", email: "felix.bauer@example.com", phone: "+1-206-555-0125", location: "Seattle, WA", currentTitle: "Platform Engineer", currentCompany: "Tableau", yearsExperience: 7, skills: ["AWS", "Kubernetes", "Terraform", "ArgoCD", "Datadog"], source: "linkedin", resumeText: "Platform Engineer with 7 years experience. Built internal developer platform at Tableau on EKS. ArgoCD + Datadog expert. Strong cost optimization and observability focus." },
    { fullName: "Jordan Avery", email: "jordan.avery@example.com", phone: "+1-503-555-0126", location: "Portland, OR", currentTitle: "DevOps Lead", currentCompany: "Nike", yearsExperience: 10, skills: ["AWS", "Kubernetes", "Terraform", "CI/CD", "Leadership"], source: "agency", resumeText: "DevOps Lead with 10 years experience. Built Nike's commerce platform CI/CD. Strong leadership and architecture background. Looking for IC role." },
    { fullName: "Bianca Romano", email: "bianca.romano@example.com", phone: "+1-312-555-0127", location: "Chicago, IL", currentTitle: "Cloud Engineer", currentCompany: "United Airlines", yearsExperience: 4, skills: ["AWS", "Terraform", "Python", "Lambda", "IAM"], source: "direct", resumeText: "Cloud Engineer with 4 years experience. AWS-focused, strong Terraform and Python. Limited Kubernetes exposure (mostly Lambda + ECS). Built United's flight ops data pipeline." },
    { fullName: "Samuel Okoye", email: "samuel.okoye@example.com", phone: "+1-615-555-0128", location: "Nashville, TN", currentTitle: "ICU Nurse", currentCompany: "Vanderbilt", yearsExperience: 4, skills: ["ICU", "Critical Care", "Epic", "ACLS", "BLS"], source: "referral", resumeText: "ICU Nurse with 4 years experience at Vanderbilt Medical Center. Strong critical care and ventilator management. Epic super-user. Open to travel assignment." },
    { fullName: "Lily Anderson", email: "lily.anderson@example.com", phone: "+1-720-555-0129", location: "Denver, CO", currentTitle: "Frontend Developer", currentCompany: "Mapbox", yearsExperience: 5, skills: ["React", "TypeScript", "Mapbox GL", "WebGL", "Next.js"], source: "linkedin", resumeText: "Frontend Developer with 5 years experience. Built Mapbox's data visualization tools in React + TypeScript. Strong WebGL and geospatial background. Some Next.js exposure." },
    { fullName: "Noah Carter", email: "noah.carter@example.com", phone: "+1-512-555-0130", location: "Austin, TX", currentTitle: "Full-Stack Engineer", currentCompany: "Indeed", yearsExperience: 5, skills: ["React", "Node.js", "TypeScript", "PostgreSQL", "AWS"], source: "job_board", resumeText: "Full-stack engineer with 5 years experience. React + Node + TypeScript. Built Indeed's employer dashboard. Strong AWS (Lambda, RDS) background. Limited Next.js exposure." },
  ];

  const candidates = await Promise.all(
    candidateSeed.map((c) =>
      db.candidate.create({
        data: {
          ...c,
          skills: JSON.stringify(c.skills),
          tags: JSON.stringify([]),
        } as never,
      }),
    ),
  );

  console.log("Creating applications…");
  // stages: 10 applied, 8 screen, 6 interview, 4 assessment, 2 offer, 3 hired, 7 rejected
  const appPlan: { cand: number; job: number; stage: string; score: number; source: string; starred?: boolean }[] = [
    { cand: 0, job: 0, stage: "interview", score: 92, source: "linkedin", starred: true },
    { cand: 1, job: 0, stage: "screen", score: 58, source: "indeed" },
    { cand: 2, job: 0, stage: "assessment", score: 88, source: "referral", starred: true },
    { cand: 3, job: 0, stage: "rejected", score: 38, source: "job_board" },
    { cand: 4, job: 0, stage: "applied", score: 71, source: "linkedin" },
    { cand: 5, job: 0, stage: "applied", score: 65, source: "referral" },
    { cand: 28, job: 0, stage: "screen", score: 78, source: "linkedin" },
    { cand: 29, job: 0, stage: "screen", score: 77, source: "direct" },

    { cand: 9, job: 1, stage: "interview", score: 86, source: "linkedin", starred: true },
    { cand: 10, job: 1, stage: "applied", score: 48, source: "indeed" },
    { cand: 11, job: 1, stage: "offer", score: 91, source: "referral", starred: true },
    { cand: 12, job: 1, stage: "hired", score: 95, source: "linkedin", starred: true },
    { cand: 13, job: 1, stage: "rejected", score: 39, source: "direct" },

    { cand: 6, job: 2, stage: "offer", score: 94, source: "agency", starred: true },
    { cand: 7, job: 2, stage: "interview", score: 72, source: "direct" },
    { cand: 8, job: 2, stage: "assessment", score: 89, source: "linkedin", starred: true },
    { cand: 27, job: 2, stage: "hired", score: 90, source: "referral", starred: true },
    { cand: 7, job: 2, stage: "screen", score: 70, source: "direct" },

    { cand: 13, job: 3, stage: "applied", score: 75, source: "direct" },
    { cand: 14, job: 3, stage: "interview", score: 82, source: "referral", starred: true },
    { cand: 15, job: 3, stage: "applied", score: 62, source: "indeed" },
    { cand: 16, job: 3, stage: "screen", score: 78, source: "job_board" },
    { cand: 17, job: 3, stage: "hired", score: 88, source: "direct", starred: true },
    { cand: 13, job: 3, stage: "rejected", score: 36, source: "direct" },

    { cand: 22, job: 4, stage: "interview", score: 87, source: "linkedin", starred: true },
    { cand: 23, job: 4, stage: "screen", score: 64, source: "referral" },
    { cand: 24, job: 4, stage: "assessment", score: 92, source: "linkedin", starred: true },
    { cand: 25, job: 4, stage: "applied", score: 70, source: "agency" },
    { cand: 26, job: 4, stage: "applied", score: 55, source: "direct" },
    { cand: 25, job: 4, stage: "rejected", score: 37, source: "agency" },

    { cand: 18, job: 5, stage: "interview", score: 89, source: "linkedin", starred: true },
    { cand: 19, job: 5, stage: "applied", score: 52, source: "referral" },
    { cand: 20, job: 5, stage: "assessment", score: 90, source: "linkedin", starred: true },
    { cand: 21, job: 5, stage: "screen", score: 68, source: "indeed" },
    { cand: 18, job: 5, stage: "rejected", score: 35, source: "linkedin" },
    { cand: 19, job: 5, stage: "applied", score: 60, source: "referral" },

    // Additional apps to reach ~40 with spec'd stage distribution
    // (10 applied, 8 screen, 6 interview, 4 assessment, 2 offer, 3 hired, 7 rejected)
    { cand: 25, job: 5, stage: "applied", score: 47, source: "agency" },                       // Jordan Avery (DevOps lead) applying to Marketing — career pivot
    { cand: 20, job: 1, stage: "screen", score: 64, source: "linkedin" },                      // Grace Park (Marketing) applying to Staff Accountant — adjacent
    { cand: 3, job: 4, stage: "rejected", score: 36, source: "direct" },                       // Diego Ramirez (jr dev) applying to DevOps — too junior
    { cand: 19, job: 2, stage: "rejected", score: 38, source: "referral" },                    // Ethan Wright (content) applying to Travel Nurse — wrong field
  ];

  const applications = [];
  for (let i = 0; i < appPlan.length; i++) {
    const plan = appPlan[i];
    const candidate = candidates[plan.cand];
    const job = jobs[plan.job];
    const appliedDaysAgo = 30 - Math.floor((i * 1.5) % 25);
    const appliedAt = new Date(Date.now() - appliedDaysAgo * 24 * 60 * 60 * 1000);
    const stageUpdatedAt = new Date(appliedAt.getTime() + (appliedDaysAgo > 5 ? 5 : 1) * 24 * 60 * 60 * 1000);
    const stageHistory = [
      { stage: "applied", at: appliedAt.toISOString() },
      ...(plan.stage !== "applied"
        ? [{ stage: plan.stage, at: stageUpdatedAt.toISOString() }]
        : []),
    ];
    const candSkills = parseArr(candidate.skills);
    const jobSkillsList = parseArr(job.skills);
    const reasons = generateReasons(plan.score, candSkills, jobSkillsList);
    const summary = generateSummary(plan.score, candidate.fullName, job.title, candSkills, jobSkillsList);
    const app = await db.application.create({
      data: {
        jobId: job.id,
        candidateId: candidate.id,
        stage: plan.stage,
        matchScore: plan.score,
        matchReasons: JSON.stringify(reasons),
        aiSummary: summary,
        source: plan.source,
        starred: plan.starred ?? false,
        rejectedReason: plan.stage === "rejected" ? "Skills gap on core requirements" : null,
        appliedAt,
        stageUpdatedAt,
        hiredAt: plan.stage === "hired" ? new Date(stageUpdatedAt.getTime() + 2 * 24 * 60 * 60 * 1000) : null,
        stageHistory: JSON.stringify(stageHistory),
      },
    });
    applications.push(app);
  }

  console.log("Creating interviews…");
  // 5 interviews: mix of completed/scheduled
  const interviewPlans = [
    { appIdx: 0, type: "video", status: "completed", daysOffset: -3, interviewer: "Priya Venkatesan", feedback: "Strong React fundamentals, clear system design thinking. Some gaps on performance optimization. Recommended for next round.", rating: 4 },
    { appIdx: 2, type: "panel", status: "completed", daysOffset: -5, interviewer: "Priya Venkatesan + 2", feedback: "Excellent architecture discussion. Candidate owned the migration story end-to-end. Strong hire recommendation.", rating: 5 },
    { appIdx: 8, type: "phone", status: "scheduled", daysOffset: 2, interviewer: "Marcus Hill" },
    { appIdx: 10, type: "video", status: "scheduled", daysOffset: 1, interviewer: "Helen Okafor" },
    { appIdx: 13, type: "onsite", status: "completed", daysOffset: -7, interviewer: "Tasha Robinson", feedback: "Great cultural fit, demonstrated RF scanner competency. Some forklift cert needed before start.", rating: 4 },
  ];

  for (const ip of interviewPlans) {
    const app = applications[ip.appIdx];
    await db.interview.create({
      data: {
        applicationId: app.id,
        type: ip.type,
        scheduledAt: new Date(Date.now() + ip.daysOffset * 24 * 60 * 60 * 1000),
        durationMin: 60,
        interviewer: ip.interviewer,
        location: ip.type === "onsite" ? "Memphis DC - Conference Room A" : null,
        status: ip.status,
        feedback: ip.feedback ?? null,
        rating: ip.rating ?? null,
        aiQuestions: JSON.stringify([
          "Tell us about a recent project where you led a major architectural decision.",
          "How do you approach performance optimization in your current stack?",
          "Walk us through how you would design a feature end-to-end from spec to production.",
          "Describe a time you had to mentor a struggling teammate.",
          "What's a technical tradeoff you made recently, and what did you learn?",
        ]),
        aiSummary: ip.status === "completed" ? "Candidate demonstrated strong technical depth and cultural alignment. Recommended to advance." : null,
      },
    });
  }

  console.log("Creating communications…");
  // 8 communications: mix of AI-generated and manual
  const commPlans = [
    { appIdx: 0, channel: "email", direction: "outbound", subject: "Interview Invitation — Senior React Engineer", body: "Hi Olivia,\n\nWe'd love to schedule a 60-minute video interview to discuss your React and TypeScript experience. Are you available this Thursday or Friday afternoon?\n\nBest,\nPriya", aiGenerated: true, status: "read" },
    { appIdx: 0, channel: "email", direction: "inbound", subject: "Re: Interview Invitation", body: "Hi Priya,\n\nThursday afternoon works great. Looking forward to it!\n\nOlivia", aiGenerated: false, status: "read" },
    { appIdx: 3, channel: "email", direction: "outbound", subject: "Update on your application", body: "Hi Diego,\n\nThank you for your interest in the Senior React Engineer role. After careful review, we've decided to move forward with candidates whose experience more closely matches our current needs. We encourage you to apply again as you grow your React skills.\n\nBest of luck,\nTalentForge Recruiting", aiGenerated: true, status: "delivered" },
    { appIdx: 10, channel: "email", direction: "outbound", subject: "Next Steps — Staff Accountant", body: "Hi Carlos,\n\nGreat news — we'd like to move forward! Please find attached a screening call invitation. We'll discuss your NetSuite experience and CPA progress.\n\nThanks,\nMarcus", aiGenerated: true, status: "delivered" },
    { appIdx: 12, channel: "email", direction: "outbound", subject: "Offer — Staff Accountant", body: "Hi James,\n\nWe're thrilled to extend an offer for the Staff Accountant position. Please review the attached offer letter and let us know if you have any questions.\n\nWarmly,\nMarcus Hill", aiGenerated: true, status: "read" },
    { appIdx: 13, channel: "sms", direction: "outbound", subject: null, body: "Hi Trevor, this is Tasha from TalentForge. We'd like to schedule an on-site interview this week. Reply with a preferred day/time. Thanks!", aiGenerated: false, status: "delivered" },
    { appIdx: 24, channel: "email", direction: "outbound", subject: "Interview Confirmation — DevOps Engineer", body: "Hi Felix,\n\nYour panel interview is confirmed for Tuesday at 2pm PT via Zoom. You'll meet with Priya, Raj, and Elena. Looking forward to it!\n\nTalentForge", aiGenerated: true, status: "delivered" },
    { appIdx: 28, channel: "email", direction: "outbound", subject: "Interview Invite — Senior React Engineer", body: "Hi Lily,\n\nWe were impressed by your Mapbox GL work and would love to chat. Are you free for a 45-min phone screen next Monday?\n\nBest,\nPriya", aiGenerated: false, status: "sent" },
  ];
  for (const cp of commPlans) {
    const app = applications[cp.appIdx];
    await db.communication.create({
      data: {
        applicationId: app.id,
        channel: cp.channel,
        direction: cp.direction,
        subject: cp.subject,
        body: cp.body,
        aiGenerated: cp.aiGenerated,
        status: cp.status,
      },
    });
  }

  console.log("Creating offers…");
  const offerPlans = [
    { appIdx: 11, salary: 110000, currency: "USD", startDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), terms: "Full-time, 90-day probationary period, 15 days PTO, full medical/dental/vision, 401(k) with 4% match.", status: "accepted" },
    { appIdx: 9, salary: 95000, currency: "USD", startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), terms: "Full-time, remote-friendly, 20 days PTO, full benefits, $5K annual learning budget.", status: "sent" },
  ];
  for (const op of offerPlans) {
    const app = applications[op.appIdx];
    await db.offer.create({
      data: {
        applicationId: app.id,
        salary: op.salary,
        currency: op.currency,
        startDate: op.startDate,
        terms: op.terms,
        aiGenerated: true,
        status: op.status,
      },
    });
  }

  console.log("Creating notes…");
  const notePlans = [
    { appIdx: 0, author: "Priya Venkatesan", content: "Olivia's Stripe migration story is exactly the kind of leadership we need. Move her to onsite panel next.", isPrivate: false },
    { appIdx: 2, author: "Priya Venkatesan", content: "Priya's staff-level experience at Amazon would be a huge asset. Strong referral from internal team. Speed up the process.", isPrivate: false },
    { appIdx: 11, author: "Marcus Hill", content: "James has 6 years NetSuite and is CPA. Top of slate. Let's extend offer this week before a competitor does.", isPrivate: true },
    { appIdx: 14, author: "Tasha Robinson", content: "Maria has forklift cert and leadership experience. Consider for lead role after 90 days.", isPrivate: false },
    { appIdx: 24, author: "Priya Venkatesan", content: "Felix's ArgoCD experience is rare and valuable. Move quickly. Hiring manager push.", isPrivate: false },
    { appIdx: 20, author: "Daniel Park", content: "Grace has the ABM background we need but comp expectations are at top of band. Get VP sign-off before extending offer.", isPrivate: true },
  ];
  for (const np of notePlans) {
    const app = applications[np.appIdx];
    await db.note.create({
      data: {
        applicationId: app.id,
        author: np.author,
        content: np.content,
        isPrivate: np.isPrivate,
      },
    });
  }

  console.log("Creating automations…");
  // Spec-aligned automations:
  //   1. Auto-screen applicants > 80       | score_threshold {min:80}             | ai_screen {}
  //   2. Auto-reject < 40 with email       | score_threshold {max:40}             | send_email {template:'rejection'}
  //   3. Top 5 → Interview                 | stage_changed {to:'screen'}          | move_stage {to:'interview'}
  //   4. Alert: no activity 5d             | no_activity_days {days:5}            | alert {}
  //   5. AI summary to HM                  | stage_changed {to:'interview'}       | send_email {template:'summary_to_hm'}
  const automationPlans = [
    { name: "Auto-screen applicants > 80", description: "When an application scores above 80, automatically run an AI screening pass and surface it to the hiring manager for fast-track review.", trigger: "score_threshold", triggerConfig: { min: 80 }, action: "ai_screen", actionConfig: {}, enabled: true, runCount: 14 },
    { name: "Auto-reject < 40 with email", description: "When an application scores below 40, send a polite AI-drafted rejection email and move the candidate to Rejected.", trigger: "score_threshold", triggerConfig: { max: 40 }, action: "send_email", actionConfig: { template: "rejection" }, enabled: true, runCount: 7 },
    { name: "Top 5 → Interview", description: "When the top 5 candidates by score for a job enter Screening, automatically advance them to the Interview stage.", trigger: "stage_changed", triggerConfig: { to: "screen" }, action: "move_stage", actionConfig: { to: "interview" }, enabled: true, runCount: 3 },
    { name: "Alert: no activity 5d", description: "When an application has no activity for 5 days, alert the assigned recruiter via in-app notification.", trigger: "no_activity_days", triggerConfig: { days: 5 }, action: "alert", actionConfig: {}, enabled: true, runCount: 22 },
    { name: "AI summary to HM", description: "When a candidate moves to Interview stage, generate an AI summary of their profile and email it to the hiring manager.", trigger: "stage_changed", triggerConfig: { to: "interview" }, action: "send_email", actionConfig: { template: "summary_to_hm" }, enabled: false, runCount: 9 },
  ];
  for (const ap of automationPlans) {
    await db.automation.create({
      data: {
        name: ap.name,
        description: ap.description,
        trigger: ap.trigger,
        triggerConfig: JSON.stringify(ap.triggerConfig),
        action: ap.action,
        actionConfig: JSON.stringify(ap.actionConfig),
        enabled: ap.enabled,
        runCount: ap.runCount,
      },
    });
  }

  console.log("Seed complete!");
  console.log(`  Jobs: ${jobs.length}`);
  console.log(`  Candidates: ${candidates.length}`);
  console.log(`  Applications: ${applications.length}`);
  console.log(`  Interviews: ${interviewPlans.length}`);
  console.log(`  Communications: ${commPlans.length}`);
  console.log(`  Offers: ${offerPlans.length}`);
  console.log(`  Notes: ${notePlans.length}`);
  console.log(`  Automations: ${automationPlans.length}`);
}

function generateReasons(score: number, candidateSkills: string[], jobSkills: string[]): string[] {
  const reasons: string[] = [];
  const matched = candidateSkills.filter((s) => jobSkills.some((j) => j.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(j.toLowerCase())));
  const missing = jobSkills.filter((j) => !candidateSkills.some((s) => j.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(j.toLowerCase())));
  if (matched.length > 0) reasons.push(`Strong overlap on ${matched.slice(0, 3).join(", ")}`);
  if (missing.length > 0) reasons.push(`Missing or weak: ${missing.slice(0, 2).join(", ")}`);
  if (score >= 80) reasons.push("Senior-level experience aligns with role seniority");
  if (score >= 60 && score < 80) reasons.push("Mid-level experience, some upskilling needed");
  if (score < 50) reasons.push("Significant skill gap on core requirements");
  if (matched.length >= 4) reasons.push("Bonus: rare combination of in-demand skills");
  return reasons.slice(0, 4);
}

function generateSummary(score: number, name: string, title: string, candidateSkills: string[], jobSkills: string[]): string {
  const matched = candidateSkills.filter((s) => jobSkills.some((j) => j.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(j.toLowerCase())));
  if (score >= 85) return `${name} is an exceptional match for the ${title} role with ${matched.length} of ${jobSkills.length} required skills directly evidenced. Strong senior-level signal across resume. Recommend fast-track to interview.`;
  if (score >= 70) return `${name} is a solid match for the ${title} role with ${matched.length} of ${jobSkills.length} required skills present. Some gaps to probe in interview but overall a promising candidate.`;
  if (score >= 50) return `${name} shows partial fit for the ${title} role with ${matched.length} of ${jobSkills.length} required skills. Consider for adjacent roles or upskilling track.`;
  return `${name} has limited direct match for the ${title} role (${matched.length}/${jobSkills.length} required skills). Significant upskilling would be required.`;
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
