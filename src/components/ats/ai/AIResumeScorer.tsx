"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api, queryKeys } from "@/lib/ats/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function AIResumeScorer() {
  const [resumeText, setResumeText] = useState("");
  const [jobId, setJobId] = useState<string>("");

  const { data: jobs } = useQuery({
    queryKey: queryKeys.jobs,
    queryFn: () => api.listJobs(),
  });
  const selectedJob = jobs?.find((j) => j.id === jobId);

  const mutation = useMutation({
    mutationFn: () =>
      api.aiScore({
        resumeText,
        jobDescription: selectedJob?.description ?? "",
        requiredSkills: selectedJob?.skills ?? [],
      }),
    onSuccess: () => toast.success("Resume scored"),
    onError: (e: Error) => toast.error(e.message),
  });

  const result = mutation.data;

  return (
    <div className="space-y-3">
      <div>
        <Label className="text-xs">Select Job</Label>
        <Select value={jobId} onValueChange={setJobId}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Pick a job to score against" />
          </SelectTrigger>
          <SelectContent>
            {(jobs ?? []).map((j) => (
              <SelectItem key={j.id} value={j.id}>
                {j.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-xs">Resume Text</Label>
        <Textarea
          className="mt-1 min-h-32 font-mono text-xs"
          placeholder="Paste the candidate's resume text here…"
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
        />
      </div>
      <Button
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending || !resumeText.trim() || !jobId}
      >
        {mutation.isPending ? (
          <Loader2 className="mr-1.5 h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <Sparkles className="mr-1.5 h-4 w-4" aria-hidden />
        )}
        Score Resume
      </Button>

      {result && (
        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <div className="mb-3 flex items-center gap-4">
            <ScoreGauge score={result.score} />
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Match Score
              </p>
              <p className="text-3xl font-bold">{result.score}/100</p>
              <p
                className={cn(
                  "text-xs font-semibold",
                  result.score >= 75
                    ? "text-emerald-600"
                    : result.score >= 50
                      ? "text-amber-600"
                      : "text-rose-600",
                )}
              >
                {result.score >= 75
                  ? "Strong match — fast track"
                  : result.score >= 50
                    ? "Partial match — interview to probe gaps"
                    : "Weak match — likely not a fit"}
              </p>
            </div>
          </div>
          {result.reasons.length > 0 && (
            <div className="mb-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Reasons
              </p>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
                {result.reasons.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          )}
          {result.summary && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Summary
              </p>
              <p className="mt-1 text-sm">{result.summary}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ScoreGauge({ score }: { score: number }) {
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 75 ? "#10b981" : score >= 50 ? "#f59e0b" : "#f43f5e";
  return (
    <div className="relative h-20 w-20">
      <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80">
        <circle
          cx="40"
          cy="40"
          r={radius}
          stroke="currentColor"
          strokeWidth="6"
          fill="none"
          className="text-muted/30"
        />
        <circle
          cx="40"
          cy="40"
          r={radius}
          stroke={color}
          strokeWidth="6"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-sm font-bold">
        {score}
      </div>
    </div>
  );
}
