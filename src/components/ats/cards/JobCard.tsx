"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Users, Star, Sparkles, Building2, Clock } from "lucide-react";
import { formatSalaryRange, relativeTime } from "@/lib/ats/format";
import { PRIORITY_BADGE } from "@/lib/ats/constants";
import type { Job } from "@/lib/ats/types";
import { cn } from "@/lib/utils";

interface JobCardProps {
  job: Job;
  onGenerateJD?: (job: Job) => void;
  onEdit?: (job: Job) => void;
  onViewPipeline?: (job: Job) => void;
}

export function JobCard({ job, onGenerateJD, onEdit, onViewPipeline }: JobCardProps) {
  const applicantCount = job.applications?.length ?? 0;
  return (
    <Card className="flex h-full flex-col overflow-hidden transition-shadow hover:shadow-md">
      <CardContent className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-1.5">
              <Badge variant="outline" className="text-[10px]">
                <Building2 className="mr-1 h-3 w-3" aria-hidden />
                {job.department}
              </Badge>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                  PRIORITY_BADGE[job.priority],
                )}
              >
                {job.priority}
              </span>
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                {job.status}
              </span>
            </div>
            <h3 className="text-base font-semibold leading-tight">{job.title}</h3>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" aria-hidden />
                {job.location}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" aria-hidden />
                {job.employmentType}
              </span>
              {job.remoteOk && (
                <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  Remote OK
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-md bg-muted/40 px-3 py-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Salary range</span>
            <span className="font-semibold">
              {formatSalaryRange(job.salaryMin, job.salaryMax, job.currency)}
            </span>
          </div>
          <div className="mt-1.5 flex items-center justify-between">
            <span className="text-muted-foreground">Openings</span>
            <span className="font-semibold">{job.openings}</span>
          </div>
          <div className="mt-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Users className="h-3 w-3" aria-hidden />
              Applicants
            </span>
            <span className="font-semibold">{applicantCount}</span>
          </div>
        </div>

        {job.skills.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {job.skills.slice(0, 5).map((s) => (
              <Badge key={s} variant="secondary" className="text-[10px]">
                {s}
              </Badge>
            ))}
            {job.skills.length > 5 && (
              <span className="text-[10px] text-muted-foreground">
                +{job.skills.length - 5} more
              </span>
            )}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <span className="text-[11px] text-muted-foreground">
            Updated {relativeTime(job.updatedAt)}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="text-amber-700 dark:text-amber-400"
              onClick={() => onGenerateJD?.(job)}
              aria-label={`Generate JD with AI for ${job.title}`}
            >
              <Sparkles className="mr-1 h-3.5 w-3.5" aria-hidden />
              AI JD
            </Button>
            {onViewPipeline && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewPipeline?.(job)}
                aria-label={`View pipeline for ${job.title}`}
              >
                <Star className="mr-1 h-3.5 w-3.5" aria-hidden />
                Pipeline
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => onEdit?.(job)}>
              Edit
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
