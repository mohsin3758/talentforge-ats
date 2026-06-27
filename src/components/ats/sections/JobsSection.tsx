"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, queryKeys } from "@/lib/ats/api";
import { JobCard } from "../cards/JobCard";
import { JobDialog } from "../dialogs/JobDialog";
import { AIJDGenerator } from "../ai/AIJDGenerator";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Briefcase } from "lucide-react";
import { useUIStore } from "@/lib/ats/store";
import type { Job } from "@/lib/ats/types";

export function JobsSection() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [jdJob, setJdJob] = useState<Job | null>(null);
  const [jdOpen, setJdOpen] = useState(false);

  const { data: jobs, isLoading } = useQuery({
    queryKey: [...queryKeys.jobs, statusFilter],
    queryFn: () => api.listJobs(statusFilter === "all" ? undefined : statusFilter),
  });

  const setSection = useUIStore((s) => s.setSection);
  const setPipelineJobId = useUIStore((s) => s.setPipelineJobId);

  function handleEdit(job: Job) {
    setEditingJob(job);
    setDialogOpen(true);
  }
  function handleNew() {
    setEditingJob(null);
    setDialogOpen(true);
  }
  function handleGenerateJD(job: Job) {
    setJdJob(job);
    setJdOpen(true);
  }
  function handleViewPipeline(job: Job) {
    setPipelineJobId(job.id);
    setSection("pipeline");
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl">
            <Briefcase className="h-7 w-7 text-emerald-600 dark:text-emerald-400" aria-hidden />
            Jobs
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Manage your open requisitions across departments. Each card surfaces headcount, applicant pipeline volume, priority, and salary range. Use the AI JD generator to draft polished job descriptions in seconds at zero per-call cost.
          </p>
        </div>
        <Button onClick={handleNew}>
          <Plus className="mr-1.5 h-4 w-4" aria-hidden />
          New Job
        </Button>
      </div>

      <Tabs value={statusFilter} onValueChange={setStatusFilter}>
        <TabsList className="w-full justify-start overflow-x-auto sm:w-auto">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="open">Open</TabsTrigger>
          <TabsTrigger value="paused">Paused</TabsTrigger>
          <TabsTrigger value="draft">Draft</TabsTrigger>
          <TabsTrigger value="closed">Closed</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      ) : jobs && jobs.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onGenerateJD={handleGenerateJD}
              onEdit={handleEdit}
              onViewPipeline={handleViewPipeline}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border p-12 text-center">
          <Briefcase className="h-10 w-10 text-muted-foreground" aria-hidden />
          <p className="text-sm font-medium">No jobs found</p>
          <p className="text-xs text-muted-foreground">
            Try a different filter or create a new job posting.
          </p>
          <Button variant="outline" size="sm" onClick={handleNew} className="mt-2">
            <Plus className="mr-1.5 h-3.5 w-3.5" aria-hidden />
            New Job
          </Button>
        </div>
      )}

      <JobDialog open={dialogOpen} onOpenChange={setDialogOpen} job={editingJob} />
      <AIJDGenerator
        key={jdJob?.id ?? "none"}
        open={jdOpen}
        onOpenChange={setJdOpen}
        job={jdJob}
      />
    </div>
  );
}
