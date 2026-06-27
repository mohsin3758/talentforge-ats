"use client";

import { create } from "zustand";

export type Section =
  | "dashboard"
  | "jobs"
  | "pipeline"
  | "candidates"
  | "ai-tools"
  | "automations"
  | "analytics"
  | "ats-compare"
  | "settings";

interface UIState {
  section: Section;
  selectedJobId: string | null;
  selectedAppId: string | null;
  sidebarCollapsed: boolean;
  pipelineJobId: string | "all" | null;
  setSection: (s: Section) => void;
  setSelectedJobId: (id: string | null) => void;
  setSelectedAppId: (id: string | null) => void;
  setPipelineJobId: (id: string | "all" | null) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (v: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  section: "dashboard",
  selectedJobId: null,
  selectedAppId: null,
  sidebarCollapsed: false,
  pipelineJobId: "all",
  setSection: (section) => set({ section }),
  setSelectedJobId: (selectedJobId) => set({ selectedJobId }),
  setSelectedAppId: (selectedAppId) => set({ selectedAppId }),
  setPipelineJobId: (pipelineJobId) => set({ pipelineJobId }),
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
}));
