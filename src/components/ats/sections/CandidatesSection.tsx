"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, queryKeys } from "@/lib/ats/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Plus, Search, Sparkles, Loader2, FileText } from "lucide-react";
import { SOURCES, scoreColor, SOURCE_LABELS } from "@/lib/ats/constants";
import { initials, relativeTime } from "@/lib/ats/format";
import { useUIStore } from "@/lib/ats/store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { AIParseResumeResult } from "@/lib/ats/types";

export function CandidatesSection() {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [minScore, setMinScore] = useState(0);
  const [addOpen, setAddOpen] = useState(false);
  const [parseOpen, setParseOpen] = useState(false);
  const setSelectedAppId = useUIStore((s) => s.setSelectedAppId);
  const setSection = useUIStore((s) => s.setSection);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  const { data: candidates, isLoading } = useQuery({
    queryKey: queryKeys.candidates(debounced),
    queryFn: () => api.listCandidates(debounced || undefined),
  });

  const filtered = (candidates ?? []).filter((c) => {
    if (sourceFilter !== "all" && c.source !== sourceFilter) return false;
    const topScore = c.applications?.reduce(
      (max, a) => Math.max(max, a.matchScore),
      0,
    ) ?? 0;
    if (topScore < minScore) return false;
    return true;
  });

  function openProfile(appId?: string) {
    if (appId) {
      setSelectedAppId(appId);
      return;
    }
    // No application - go to pipeline section to view
    setSection("pipeline");
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl">
            <Users className="h-7 w-7 text-emerald-600 dark:text-emerald-400" aria-hidden />
            Candidates
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Search, filter, and manage your candidate pool. Use the AI Resume Parser to extract structured data from pasted resumes in one click — saving 5–10 minutes per candidate vs manual entry.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setParseOpen(true)}>
            <Sparkles className="mr-1.5 h-4 w-4 text-amber-600" aria-hidden />
            AI Parse Resume
          </Button>
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="mr-1.5 h-4 w-4" aria-hidden />
            Add Candidate
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <Input
                placeholder="Search by name, email, title, or skill…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9"
                aria-label="Search candidates"
              />
            </div>
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All sources</SelectItem>
                {SOURCES.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Label className="whitespace-nowrap text-xs text-muted-foreground">
                Min score
              </Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={minScore}
                onChange={(e) => setMinScore(Number(e.target.value) || 0)}
                className="w-20"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto scrollbar-thin">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Candidate</TableHead>
                    <TableHead className="hidden md:table-cell">Title</TableHead>
                    <TableHead className="hidden sm:table-cell">Exp</TableHead>
                    <TableHead className="hidden lg:table-cell">Skills</TableHead>
                    <TableHead className="hidden md:table-cell">Source</TableHead>
                    <TableHead className="text-center">Apps</TableHead>
                    <TableHead className="text-center">Score</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((c) => {
                    const topScore = c.applications?.reduce(
                      (max, a) => Math.max(max, a.matchScore),
                      0,
                    ) ?? 0;
                    const topApp = c.applications?.find((a) => a.matchScore === topScore);
                    return (
                      <TableRow
                        key={c.id}
                        className="cursor-pointer hover:bg-muted/40"
                        onClick={() => topApp && openProfile(topApp.id)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-emerald-500/10 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
                                {initials(c.fullName)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium">{c.fullName}</p>
                              <p className="truncate text-[11px] text-muted-foreground">
                                {c.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                          {c.currentTitle ?? "—"}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">
                          {c.yearsExperience}y
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="flex flex-wrap gap-1">
                            {c.skills.slice(0, 3).map((s) => (
                              <Badge key={s} variant="secondary" className="text-[10px]">
                                {s}
                              </Badge>
                            ))}
                            {c.skills.length > 3 && (
                              <span className="text-[10px] text-muted-foreground">
                                +{c.skills.length - 3}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                          {SOURCE_LABELS[c.source]}
                        </TableCell>
                        <TableCell className="text-center text-xs">
                          {c.applications?.length ?? 0}
                        </TableCell>
                        <TableCell className="text-center">
                          {topScore > 0 ? (
                            <span
                              className={cn(
                                "rounded-full px-2 py-0.5 text-[10px] font-bold",
                                scoreColor(topScore),
                              )}
                            >
                              {topScore}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (topApp) openProfile(topApp.id);
                              else toast.info("No applications on file");
                            }}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="py-12 text-center text-sm text-muted-foreground">
                        No candidates match your filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AddCandidateDialog open={addOpen} onOpenChange={setAddOpen} />
      <ParseResumeDialog
        open={parseOpen}
        onOpenChange={setParseOpen}
        onApply={(parsed) => {
          setParseOpen(false);
          setAddOpen(true);
          // Pass parsed data via window event for AddCandidateDialog to pick up
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent("ats:parsed-resume", { detail: parsed }));
          }, 100);
        }}
      />
    </div>
  );
}

function AddCandidateDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const qc = useQueryClient();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [currentTitle, setCurrentTitle] = useState("");
  const [currentCompany, setCurrentCompany] = useState("");
  const [location, setLocation] = useState("");
  const [yearsExperience, setYearsExperience] = useState("0");
  const [skills, setSkills] = useState("");
  const [source, setSource] = useState("direct");
  const [resumeText, setResumeText] = useState("");

  useEffect(() => {
    function onParsed(e: Event) {
      const detail = (e as CustomEvent<AIParseResumeResult>).detail;
      setFullName(detail.name);
      setEmail(detail.email);
      setPhone(detail.phone);
      setCurrentTitle(detail.currentTitle);
      setYearsExperience(String(detail.yearsExperience));
      setSkills(detail.skills.join(", "));
      setResumeText(detail.summary);
      toast.success("Parsed resume data applied to form");
    }
    window.addEventListener("ats:parsed-resume", onParsed);
    return () => window.removeEventListener("ats:parsed-resume", onParsed);
  }, []);

  const mutation = useMutation({
    mutationFn: () =>
      api.createCandidate({
        fullName,
        email,
        phone,
        currentTitle,
        currentCompany,
        location,
        yearsExperience: Number(yearsExperience),
        skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
        source: source as never,
        resumeText,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ats", "candidates"] });
      toast.success("Candidate added");
      onOpenChange(false);
      setFullName(""); setEmail(""); setPhone(""); setCurrentTitle("");
      setCurrentCompany(""); setLocation(""); setYearsExperience("0");
      setSkills(""); setResumeText("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto scrollbar-thin">
        <DialogHeader>
          <DialogTitle>Add candidate</DialogTitle>
          <DialogDescription>
            Manually enter candidate info, or use the AI Parse Resume tool to autofill.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label className="text-xs">Full Name *</Label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Email *</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Phone</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Current Title</Label>
            <Input value={currentTitle} onChange={(e) => setCurrentTitle(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Current Company</Label>
            <Input value={currentCompany} onChange={(e) => setCurrentCompany(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Location</Label>
            <Input value={location} onChange={(e) => setLocation(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Years Experience</Label>
            <Input type="number" value={yearsExperience} onChange={(e) => setYearsExperience(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Source</Label>
            <Select value={source} onValueChange={setSource}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SOURCES.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label className="text-xs">Skills (comma-separated)</Label>
          <Input value={skills} onChange={(e) => setSkills(e.target.value)} className="mt-1" />
        </div>
        <div>
          <Label className="text-xs">Resume text / summary</Label>
          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-20"
            placeholder="Paste resume text here…"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || !fullName || !email}
          >
            {mutation.isPending && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" aria-hidden />}
            Add Candidate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ParseResumeDialog({
  open,
  onOpenChange,
  onApply,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onApply: (parsed: AIParseResumeResult) => void;
}) {
  const [text, setText] = useState("");
  const [result, setResult] = useState<AIParseResumeResult | null>(null);

  const mutation = useMutation({
    mutationFn: () => api.aiParseResume({ resumeText: text }),
    onSuccess: (data) => {
      setResult(data);
      toast.success("Resume parsed");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto scrollbar-thin">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-amber-600" aria-hidden />
            AI Resume Parser
          </DialogTitle>
          <DialogDescription>
            Paste resume text and we&apos;ll extract name, contact, skills, years of experience, current title, and a summary — all at zero token cost.
          </DialogDescription>
        </DialogHeader>
        <div>
          <Label className="text-xs">Resume text</Label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono min-h-32"
            placeholder="Paste full resume text here…"
          />
        </div>
        <Button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending || text.trim().length < 20}
        >
          {mutation.isPending ? (
            <Loader2 className="mr-1.5 h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Sparkles className="mr-1.5 h-4 w-4" aria-hidden />
          )}
          Parse Resume
        </Button>

        {result && (
          <div className="rounded-lg border border-amber-200 bg-amber-50/40 p-3 dark:border-amber-900/40 dark:bg-amber-950/20">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300">
              Parsed fields
            </p>
            <dl className="grid grid-cols-2 gap-2 text-xs">
              <div><dt className="text-muted-foreground">Name</dt><dd className="font-medium">{result.name || "—"}</dd></div>
              <div><dt className="text-muted-foreground">Email</dt><dd className="font-medium">{result.email || "—"}</dd></div>
              <div><dt className="text-muted-foreground">Phone</dt><dd className="font-medium">{result.phone || "—"}</dd></div>
              <div><dt className="text-muted-foreground">Current Title</dt><dd className="font-medium">{result.currentTitle || "—"}</dd></div>
              <div><dt className="text-muted-foreground">Years Exp</dt><dd className="font-medium">{result.yearsExperience}</dd></div>
              <div className="col-span-2">
                <dt className="text-muted-foreground">Skills</dt>
                <dd className="mt-1 flex flex-wrap gap-1">
                  {result.skills.map((s) => (
                    <Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>
                  ))}
                </dd>
              </div>
              <div className="col-span-2">
                <dt className="text-muted-foreground">Summary</dt>
                <dd className="mt-1">{result.summary}</dd>
              </div>
            </dl>
            <Button
              className="mt-3"
              size="sm"
              onClick={() => onApply(result)}
            >
              Apply to Add Candidate form →
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
