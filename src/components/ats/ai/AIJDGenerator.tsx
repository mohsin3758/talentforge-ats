"use client";

import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "@/lib/ats/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Sparkles, Loader2, Copy, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import type { Job } from "@/lib/ats/types";

interface AIJDGeneratorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job?: Job | null;
}

export function AIJDGenerator({ open, onOpenChange, job }: AIJDGeneratorProps) {
  const [title, setTitle] = useState(job?.title ?? "");
  const [department, setDepartment] = useState(job?.department ?? "Engineering");
  const [seniority, setSeniority] = useState("Senior");
  const [skills, setSkills] = useState(job?.skills.join(", ") ?? "");
  const [requirements, setRequirements] = useState(job?.requirements.join(", ") ?? "");
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);

  // Sync state when job changes — handled via `key` prop on parent <AIJDGenerator> element
  // so the component remounts with fresh initial state when job changes.

  const mutation = useMutation({
    mutationFn: () =>
      api.aiJD({
        title,
        department,
        seniority,
        skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
        requirements: requirements.split(",").map((s) => s.trim()).filter(Boolean),
      }),
    onSuccess: (data) => {
      setResult(data.content);
      toast.success("JD generated! Review and copy below.");
    },
    onError: (e: Error) => {
      toast.error(`Failed to generate JD: ${e.message}`);
    },
  });

  function handleCopy() {
    navigator.clipboard.writeText(result);
    setCopied(true);
    toast.success("JD copied to clipboard");
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto scrollbar-thin">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-600 dark:text-amber-400" aria-hidden />
            AI Job Description Generator
          </DialogTitle>
          <DialogDescription>
            Powered by zero-token in-house AI. Fill in the basics and we&apos;ll draft a polished JD in seconds — at no per-call cost.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="jd-title" className="text-xs">Title</Label>
            <Input
              id="jd-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Senior React Engineer"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="jd-dept" className="text-xs">Department</Label>
            <Input
              id="jd-dept"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="jd-seniority" className="text-xs">Seniority</Label>
            <Input
              id="jd-seniority"
              value={seniority}
              onChange={(e) => setSeniority(e.target.value)}
              placeholder="Junior / Mid / Senior / Staff"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="jd-skills" className="text-xs">Skills (comma-separated)</Label>
            <Input
              id="jd-skills"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="React, TypeScript, Next.js"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="jd-reqs" className="text-xs">Core requirements (comma-separated)</Label>
          <Textarea
            id="jd-reqs"
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            placeholder="5+ years React, deep TypeScript, CI/CD experience"
            rows={2}
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || !title.trim()}
          >
            {mutation.isPending ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Sparkles className="mr-1.5 h-4 w-4" aria-hidden />
            )}
            {mutation.isPending ? "Generating…" : "Generate JD"}
          </Button>
          {result && (
            <Button variant="outline" onClick={handleCopy}>
              {copied ? (
                <Check className="mr-1.5 h-4 w-4 text-emerald-600" aria-hidden />
              ) : (
                <Copy className="mr-1.5 h-4 w-4" aria-hidden />
              )}
              {copied ? "Copied!" : "Copy"}
            </Button>
          )}
        </div>

        {result && (
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Generated JD
              </span>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                $0 cost
              </span>
            </div>
            <article className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown>{`# ${title}\n\n${result}`}</ReactMarkdown>
            </article>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
