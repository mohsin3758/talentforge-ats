"use client";

import { useUIStore } from "@/lib/ats/store";
import { Topbar } from "./Topbar";
import { Sidebar } from "./Sidebar";
import { Footer } from "./Footer";
import { DashboardSection } from "./sections/DashboardSection";
import { JobsSection } from "./sections/JobsSection";
import { PipelineSection } from "./sections/PipelineSection";
import { CandidatesSection } from "./sections/CandidatesSection";
import { AIToolsSection } from "./sections/AIToolsSection";
import { AutomationsSection } from "./sections/AutomationsSection";
import { AnalyticsSection } from "./sections/AnalyticsSection";
import { ATSCompareSection } from "./sections/ATSCompareSection";
import { SettingsSection } from "./sections/SettingsSection";
import { CandidateProfileDialog } from "./dialogs/CandidateProfileDialog";

export function ATSApp() {
  const section = useUIStore((s) => s.section);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Topbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6" role="main">
          {section === "dashboard" && <DashboardSection />}
          {section === "jobs" && <JobsSection />}
          {section === "pipeline" && <PipelineSection />}
          {section === "candidates" && <CandidatesSection />}
          {section === "ai-tools" && <AIToolsSection />}
          {section === "automations" && <AutomationsSection />}
          {section === "analytics" && <AnalyticsSection />}
          {section === "ats-compare" && <ATSCompareSection />}
          {section === "settings" && <SettingsSection />}
        </main>
      </div>
      <Footer />
      <CandidateProfileDialog />
    </div>
  );
}
