"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/ats/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AIResumeScorer } from "../ai/AIResumeScorer";
import { AIJDGenerator } from "../ai/AIJDGenerator";
import { AIInterviewGenerator } from "../ai/AIInterviewGenerator";
import { AIEmailDrafter } from "../ai/AIEmailDrafter";
import { AIOfferLetter } from "../ai/AIOfferLetter";
import {
  Sparkles,
  FileText,
  Briefcase,
  MessageSquare,
  FileCheck2,
  DollarSign,
  Zap,
  Loader2,
  Copy,
  Check,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

export function AIToolsSection() {
  const [jdOpen, setJdOpen] = useState(false);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl">
          <Sparkles className="h-7 w-7 text-amber-600 dark:text-amber-400" aria-hidden />
          AI Tools
        </h1>
        <p className="mt-1 text-xs">
          <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-300">
            0-token · in-house
          </Badge>{" "}
          Powered by z-ai-web-dev-sdk
        </p>
      </div>

      <Card className="border-amber-200 bg-gradient-to-br from-amber-50/80 to-emerald-50/40 dark:border-amber-900/40 dark:from-amber-950/20 dark:to-emerald-950/10">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-400">
              <Zap className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <h2 className="text-lg font-bold">What is Zero-Token AI?</h2>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Every AI feature in TalentForge — resume scoring, JD generation, interview question drafting, email composition, offer letters, and the recruiter daily brief — is powered by our <strong>in-house <code>z-ai-web-dev-sdk</code></strong> model. Unlike traditional ATS platforms that proxy to OpenAI or Anthropic and pass per-token costs to you (typically <strong>$0.01 to $0.05 per AI call</strong>), TalentForge runs these models on platform credits already included in your subscription. The result: a <strong>$0 marginal cost</strong> per AI action, no surprise API bills, no rate limits tied to your OpenAI tier, and full control over data residency because resumes and candidate PII never leave our infrastructure.
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                For a staffing company running <strong>1,000 AI resume screens per month</strong>, that is <strong>$30 to $50/month saved</strong> versus Greenhouse AI, iCIMS SmartAssistant, or SmartRecruiters Recruiterbot. Across a year of heavy usage (JD generation, interview question sets, follow-up emails, offer letters), a single recruiter seat can save <strong>$600–$1,200/year</strong> in third-party AI fees. And because we own the model, we can fine-tune it on staffing-industry language without violating OpenAI&apos;s data retention clauses.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <AIToolCard
          icon={FileText}
          title="Resume Parser & Scorer"
          description="Paste a resume and pick a job. We extract structured fields and compute a 0-100 match score with detailed reasons and a written summary."
          cost="$0 / call"
        >
          <AIResumeScorer />
        </AIToolCard>

        <AIToolCard
          icon={Briefcase}
          title="Job Description Generator"
          description="Enter title, seniority, and required skills. Get a polished markdown JD with Overview, Responsibilities, Requirements, and Benefits."
          cost="$0 / call"
          action={
            <button
              onClick={() => setJdOpen(true)}
              className="text-xs text-emerald-700 underline-offset-4 hover:underline dark:text-emerald-400"
            >
              Open full-screen generator →
            </button>
          }
        >
          <AIJDGeneratorInline />
        </AIToolCard>

        <AIToolCard
          icon={MessageSquare}
          title="Interview Question Generator"
          description="Pick a candidate application and interview type. Get 6-8 tailored questions plus 2-4 focus areas to probe based on resume gaps."
          cost="$0 / call"
        >
          <AIInterviewGenerator />
        </AIToolCard>

        <AIToolCard
          icon={FileCheck2}
          title="Email Drafter"
          description="Pick an application, email type, and tone. Get a subject + body ready to copy. Automatically saves as a draft in the candidate's comms log."
          cost="$0 / call"
        >
          <AIEmailDrafter />
        </AIToolCard>

        <AIToolCard
          icon={DollarSign}
          title="Offer Letter Generator"
          description="Pick an application, salary, and start date. Generate a formal offer letter in markdown with compensation, terms, benefits, and acceptance."
          cost="$0 / call"
          className="lg:col-span-2"
        >
          <AIOfferLetter />
        </AIToolCard>
      </div>

      <AIJDGenerator open={jdOpen} onOpenChange={setJdOpen} />
    </div>
  );
}

function AIToolCard({
  icon: Icon,
  title,
  description,
  cost,
  children,
  action,
  className,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  cost: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-400">
              <Icon className="h-4 w-4" aria-hidden />
            </div>
            <CardTitle className="text-base">{title}</CardTitle>
          </div>
          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300">
            {cost}
          </Badge>
        </div>
        <CardDescription className="mt-1 text-xs leading-relaxed">
          {description}
        </CardDescription>
        {action}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function AIJDGeneratorInline() {
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("Engineering");
  const [seniority, setSeniority] = useState("Senior");
  const [skills, setSkills] = useState("");
  const [requirements, setRequirements] = useState("");
  const [copied, setCopied] = useState(false);

  const mutation = useMutation({
    mutationFn: () =>
      api.aiJD({
        title,
        department,
        seniority,
        skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
        requirements: requirements.split(",").map((s) => s.trim()).filter(Boolean),
      }),
    onSuccess: () => toast.success("JD generated"),
    onError: (e: Error) => toast.error(e.message),
  });

  function copy() {
    if (!mutation.data) return;
    navigator.clipboard.writeText(mutation.data.content);
    setCopied(true);
    toast.success("Copied");
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs">Title</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1"
            placeholder="Senior React Engineer"
          />
        </div>
        <div>
          <Label className="text-xs">Department</Label>
          <Input
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-xs">Seniority</Label>
          <Input
            value={seniority}
            onChange={(e) => setSeniority(e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-xs">Skills (comma-sep)</Label>
          <Input
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            className="mt-1"
            placeholder="React, TypeScript"
          />
        </div>
      </div>
      <div>
        <Label className="text-xs">Requirements (comma-sep)</Label>
        <Input
          value={requirements}
          onChange={(e) => setRequirements(e.target.value)}
          className="mt-1"
          placeholder="5+ years React, deep TS"
        />
      </div>
      <div className="flex gap-2">
        <Button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending || !title.trim()}
          size="sm"
        >
          {mutation.isPending ? (
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" aria-hidden />
          ) : (
            <Sparkles className="mr-1.5 h-3.5 w-3.5" aria-hidden />
          )}
          Generate JD
        </Button>
        {mutation.data && (
          <Button variant="outline" size="sm" onClick={copy}>
            {copied ? (
              <Check className="mr-1.5 h-3.5 w-3.5 text-emerald-600" aria-hidden />
            ) : (
              <Copy className="mr-1.5 h-3.5 w-3.5" aria-hidden />
            )}
            Copy
          </Button>
        )}
      </div>
      {mutation.data && (
        <div className="max-h-72 overflow-y-auto scrollbar-thin rounded-md border border-border bg-muted/30 p-3">
          <article className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown>{`# ${title}\n\n${mutation.data.content}`}</ReactMarkdown>
          </article>
        </div>
      )}
    </div>
  );
}
