"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, queryKeys } from "@/lib/ats/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUIStore } from "@/lib/ats/store";
import { STAGES, SOURCE_LABELS, scoreColor } from "@/lib/ats/constants";
import { initials, relativeTime, formatDateTime } from "@/lib/ats/format";
import { toast } from "sonner";
import {
  Star,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Sparkles,
  MessageSquare,
  FileText,
  Calendar,
  Loader2,
  Send,
  Copy,
  Check,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Application } from "@/lib/ats/types";

export function CandidateProfileDialog() {
  const qc = useQueryClient();
  const selectedAppId = useUIStore((s) => s.selectedAppId);
  const setSelectedAppId = useUIStore((s) => s.setSelectedAppId);
  const open = !!selectedAppId;

  const { data: app, isLoading } = useQuery({
    queryKey: queryKeys.application(selectedAppId ?? ""),
    queryFn: () => api.getApplication(selectedAppId!),
    enabled: !!selectedAppId,
  });

  const moveStageMutation = useMutation({
    mutationFn: ({ id, stage }: { id: string; stage: string }) => api.moveStage(id, stage),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ats", "applications"] });
      qc.invalidateQueries({ queryKey: queryKeys.analytics });
      toast.success("Stage updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const starMutation = useMutation({
    mutationFn: ({ id, starred }: { id: string; starred: boolean }) =>
      api.updateApplication(id, { starred }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ats", "applications"] });
    },
  });

  function handleStageChange(stage: string) {
    if (!app) return;
    moveStageMutation.mutate({ id: app.id, stage });
  }

  function handleStarToggle() {
    if (!app) return;
    starMutation.mutate({ id: app.id, starred: !app.starred });
  }


  return (
    <Dialog open={open} onOpenChange={(o) => !o && setSelectedAppId(null)}>
      <DialogContent
        className="max-h-[90vh] max-w-3xl overflow-y-auto scrollbar-thin"
        aria-describedby={undefined}
      >
        {isLoading || !app ? (
          <div className="space-y-3 p-4">
            <DialogTitle className="sr-only">Loading candidate profile</DialogTitle>
            <DialogDescription className="sr-only">
              Loading candidate details, please wait.
            </DialogDescription>
            <div className="h-16 w-16 animate-pulse rounded-full bg-muted" />
            <div className="h-6 w-1/3 animate-pulse rounded bg-muted" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
            <div className="h-40 w-full animate-pulse rounded bg-muted" />
          </div>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-start gap-3">
                <Avatar className="h-14 w-14">
                  <AvatarFallback className="bg-emerald-500/10 text-base font-bold text-emerald-700 dark:text-emerald-300">
                    {initials(app.candidate?.fullName ?? "?")}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <DialogTitle className="text-xl">{app.candidate?.fullName}</DialogTitle>
                  <DialogDescription className="mt-1">
                    {app.candidate?.currentTitle ?? "—"}
                    {app.candidate?.currentCompany ? ` @ ${app.candidate.currentCompany}` : ""}
                  </DialogDescription>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-bold",
                        scoreColor(app.matchScore),
                      )}
                    >
                      Score {app.matchScore}
                    </span>
                    <Badge variant="outline" className="text-[10px]">
                      {SOURCE_LABELS[app.source]}
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">
                      {app.candidate?.yearsExperience ?? 0} yrs exp
                    </Badge>
                    {app.starred && (
                      <Badge className="bg-amber-100 text-amber-700 text-[10px] hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-300">
                        <Star className="mr-1 h-3 w-3 fill-current" aria-hidden /> Starred
                      </Badge>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleStarToggle}
                  aria-label={app.starred ? "Unstar candidate" : "Star candidate"}
                >
                  <Star
                    className={cn(
                      "h-5 w-5",
                      app.starred && "fill-amber-400 text-amber-400",
                    )}
                    aria-hidden
                  />
                </Button>
              </div>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
              <InfoTile icon={Mail} label="Email" value={app.candidate?.email ?? "—"} />
              <InfoTile icon={Phone} label="Phone" value={app.candidate?.phone ?? "—"} />
              <InfoTile icon={MapPin} label="Location" value={app.candidate?.location ?? "—"} />
              <InfoTile
                icon={Briefcase}
                label="Applied"
                value={relativeTime(app.appliedAt)}
              />
            </div>

            <div className="flex items-center gap-2">
              <Label className="text-xs">Stage:</Label>
              <Select value={app.stage} onValueChange={handleStageChange}>
                <SelectTrigger className="h-8 w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STAGES.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {moveStageMutation.isPending && (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" aria-hidden />
              )}
            </div>

            <Tabs defaultValue="summary" className="w-full">
              <TabsList className="w-full justify-start overflow-x-auto">
                <TabsTrigger value="summary">
                  <Sparkles className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                  AI Summary
                </TabsTrigger>
                <TabsTrigger value="history">
                  <Calendar className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                  Stage History
                </TabsTrigger>
                <TabsTrigger value="interviews">
                  Interviews
                </TabsTrigger>
                <TabsTrigger value="comms">
                  <MessageSquare className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                  Communications
                </TabsTrigger>
                <TabsTrigger value="notes">
                  <FileText className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                  Notes
                </TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="space-y-3 mt-3">
                <AIActionsBlock app={app} />
              </TabsContent>

              <TabsContent value="history" className="mt-3">
                <StageHistoryTimeline app={app} />
              </TabsContent>

              <TabsContent value="interviews" className="mt-3">
                <InterviewsBlock app={app} />
              </TabsContent>

              <TabsContent value="comms" className="mt-3">
                <CommunicationsBlock app={app} />
              </TabsContent>

              <TabsContent value="notes" className="mt-3">
                <NotesBlock app={app} />
              </TabsContent>
            </Tabs>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function InfoTile({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-md border border-border bg-muted/30 p-2">
      <div className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-muted-foreground">
        <Icon className="h-3 w-3" aria-hidden />
        {label}
      </div>
      <p className="mt-0.5 truncate text-xs font-medium" title={value}>{value}</p>
    </div>
  );
}

function StageHistoryTimeline({ app }: { app: Application }) {
  const history = app.stageHistory ?? [];
  if (history.length === 0) {
    return <p className="py-6 text-center text-sm text-muted-foreground">No stage history.</p>;
  }
  return (
    <ol className="relative space-y-3 border-l border-border pl-4">
      {history.map((h, i) => {
        const stageMeta = STAGES.find((s) => s.id === h.stage);
        return (
          <li key={i} className="relative">
            <span
              className={cn(
                "absolute -left-[22px] top-1 h-3 w-3 rounded-full border-2 border-background",
                stageMeta?.dotClass ?? "bg-slate-400",
              )}
              aria-hidden
            />
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {stageMeta?.label ?? h.stage}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDateTime(h.at)}
              </span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function AIActionsBlock({ app }: { app: Application }) {
  return (
    <div className="space-y-3">
      <div className="rounded-md border border-amber-200 bg-amber-50/50 p-3 dark:border-amber-900/50 dark:bg-amber-950/20">
        <div className="mb-1 flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" aria-hidden />
          <span className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300">
            AI Match Summary
          </span>
        </div>
        <p className="text-sm">
          {app.aiSummary || "No AI summary yet. Run the AI Scorer below to generate one."}
        </p>
        {app.matchReasons.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {app.matchReasons.map((r, i) => (
              <span
                key={i}
                className="rounded-full bg-background px-2 py-0.5 text-[11px] text-muted-foreground"
              >
                {r}
              </span>
            ))}
          </div>
        )}
      </div>

      <AIInterviewBlock applicationId={app.id} />
      <AIEmailBlock applicationId={app.id} />
      <AIOfferBlock applicationId={app.id} />
    </div>
  );
}

function AIInterviewBlock({ applicationId }: { applicationId: string }) {
  const qc = useQueryClient();
  const [questions, setQuestions] = useState<string[] | null>(null);
  const [focus, setFocus] = useState<string[]>([]);

  const mutation = useMutation({
    mutationFn: () => api.aiInterview({ applicationId }),
    onSuccess: (data) => {
      setQuestions(data.questions);
      setFocus(data.focusAreas);
      toast.success("Generated interview questions");
      qc.invalidateQueries({ queryKey: ["ats", "applications"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="rounded-md border border-border p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-sm font-semibold">
          <Sparkles className="h-3.5 w-3.5 text-amber-600" aria-hidden />
          AI Interview Questions
        </span>
        <Button
          size="sm"
          variant="outline"
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
        >
          {mutation.isPending ? (
            <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" aria-hidden />
          ) : (
            <Sparkles className="mr-1 h-3.5 w-3.5" aria-hidden />
          )}
          Generate
        </Button>
      </div>
      {questions && (
        <div className="space-y-2">
          <ol className="list-decimal space-y-1 pl-5 text-sm">
            {questions.map((q, i) => (
              <li key={i}>{q}</li>
            ))}
          </ol>
          {focus.length > 0 && (
            <div className="rounded bg-muted/40 p-2 text-xs">
              <span className="font-semibold">Focus areas:</span>{" "}
              {focus.join(", ")}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AIEmailBlock({ applicationId }: { applicationId: string }) {
  const qc = useQueryClient();
  const [emailType, setEmailType] = useState<string>("screening");
  const [tone, setTone] = useState<string>("professional");
  const [result, setResult] = useState<{ subject: string; body: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const mutation = useMutation({
    mutationFn: () =>
      api.aiEmail({
        applicationId,
        emailType,
        tone,
      } as { applicationId: string; emailType: "screening" | "rejection" | "offer" | "interview_invite" | "follow_up"; tone: "professional" | "friendly" | "formal" }),
    onSuccess: (data) => {
      setResult(data);
      toast.success("Drafted email");
      qc.invalidateQueries({ queryKey: ["ats", "applications"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function copy() {
    if (!result) return;
    navigator.clipboard.writeText(`Subject: ${result.subject}\n\n${result.body}`);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="rounded-md border border-border p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-sm font-semibold">
          <MessageSquare className="h-3.5 w-3.5 text-amber-600" aria-hidden />
          AI Email Drafter
        </span>
        <div className="flex items-center gap-1">
          <Select value={emailType} onValueChange={setEmailType}>
            <SelectTrigger className="h-7 w-32 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="screening">Screening</SelectItem>
              <SelectItem value="interview_invite">Interview Invite</SelectItem>
              <SelectItem value="follow_up">Follow Up</SelectItem>
              <SelectItem value="rejection">Rejection</SelectItem>
              <SelectItem value="offer">Offer</SelectItem>
            </SelectContent>
          </Select>
          <Select value={tone} onValueChange={setTone}>
            <SelectTrigger className="h-7 w-28 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="professional">Professional</SelectItem>
              <SelectItem value="friendly">Friendly</SelectItem>
              <SelectItem value="formal">Formal</SelectItem>
            </SelectContent>
          </Select>
          <Button
            size="sm"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" aria-hidden />
            ) : (
              <Sparkles className="mr-1 h-3.5 w-3.5" aria-hidden />
            )}
            Draft
          </Button>
        </div>
      </div>
      {result && (
        <div className="space-y-2">
          <div className="rounded bg-muted/40 p-2">
            <p className="text-xs font-semibold">Subject: {result.subject}</p>
          </div>
          <pre className="whitespace-pre-wrap rounded bg-muted/40 p-2 text-xs font-mono">{result.body}</pre>
          <Button size="sm" variant="outline" onClick={copy}>
            {copied ? (
              <Check className="mr-1 h-3.5 w-3.5 text-emerald-600" aria-hidden />
            ) : (
              <Copy className="mr-1 h-3.5 w-3.5" aria-hidden />
            )}
            Copy
          </Button>
        </div>
      )}
    </div>
  );
}

function AIOfferBlock({ applicationId }: { applicationId: string }) {
  const qc = useQueryClient();
  const [salary, setSalary] = useState("120000");
  const [startDate, setStartDate] = useState(
    new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
  );
  const [extras, setExtras] = useState("");
  const [result, setResult] = useState<string>("");

  const mutation = useMutation({
    mutationFn: () =>
      api.aiOffer({
        applicationId,
        salary: Number(salary),
        startDate,
        extras,
      }),
    onSuccess: (data) => {
      setResult(data.content);
      toast.success("Generated offer letter");
      qc.invalidateQueries({ queryKey: ["ats", "applications"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="rounded-md border border-border p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-sm font-semibold">
          <FileText className="h-3.5 w-3.5 text-amber-600" aria-hidden />
          AI Offer Letter
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <Label className="text-[10px]">Salary</Label>
          <Input
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            className="h-7 text-xs"
          />
        </div>
        <div>
          <Label className="text-[10px]">Start Date</Label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="h-7 text-xs"
          />
        </div>
        <div>
          <Label className="text-[10px]">Extras</Label>
          <Input
            value={extras}
            onChange={(e) => setExtras(e.target.value)}
            placeholder="remote, signing bonus"
            className="h-7 text-xs"
          />
        </div>
      </div>
      <Button
        size="sm"
        className="mt-2"
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending}
      >
        {mutation.isPending ? (
          <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" aria-hidden />
        ) : (
          <Sparkles className="mr-1 h-3.5 w-3.5" aria-hidden />
        )}
        Generate Offer
      </Button>
      {result && (
        <pre className="mt-2 max-h-72 overflow-y-auto scrollbar-thin whitespace-pre-wrap rounded bg-muted/40 p-2 text-xs font-mono">
          {result}
        </pre>
      )}
    </div>
  );
}

function InterviewsBlock({ app }: { app: Application }) {
  const interviews = app.interviews ?? [];
  if (interviews.length === 0)
    return <p className="py-6 text-center text-sm text-muted-foreground">No interviews scheduled.</p>;
  return (
    <ul className="space-y-2">
      {interviews.map((i) => (
        <li key={i.id} className="rounded-md border border-border p-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="font-semibold capitalize">{i.type} Interview</span>
            <Badge variant="outline" className="text-[10px]">
              {i.status}
            </Badge>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {formatDateTime(i.scheduledAt)} · {i.durationMin}min · {i.interviewer}
          </p>
          {i.location && <p className="text-xs text-muted-foreground">📍 {i.location}</p>}
          {i.feedback && (
            <div className="mt-2 rounded bg-muted/40 p-2 text-xs">
              <span className="font-semibold">Feedback:</span> {i.feedback}
              {i.rating && (
                <span className="ml-2 rounded bg-amber-100 px-1.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                  ★ {i.rating}/5
                </span>
              )}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

function CommunicationsBlock({ app }: { app: Application }) {
  const comms = app.communications ?? [];
  if (comms.length === 0)
    return <p className="py-6 text-center text-sm text-muted-foreground">No communications.</p>;
  return (
    <ul className="space-y-2">
      {comms.map((c) => (
        <li key={c.id} className="rounded-md border border-border p-3 text-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5">
              <span className="capitalize text-xs font-semibold">{c.direction}</span>
              <span className="text-[10px] text-muted-foreground">via {c.channel}</span>
              {c.aiGenerated && (
                <Badge className="bg-amber-100 text-amber-700 text-[10px] hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-300">
                  AI
                </Badge>
              )}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {relativeTime(c.createdAt)}
            </span>
          </div>
          {c.subject && <p className="mt-1 text-xs font-medium">{c.subject}</p>}
          <pre className="mt-1 whitespace-pre-wrap text-xs text-muted-foreground">{c.body}</pre>
        </li>
      ))}
    </ul>
  );
}

function NotesBlock({ app }: { app: Application }) {
  const qc = useQueryClient();
  const notes = app.notes ?? [];
  const [content, setContent] = useState("");
  const [author] = useState("Recruiter");

  const addNote = useMutation({
    mutationFn: () => api.createNote({ applicationId: app.id, author, content }),
    onSuccess: () => {
      setContent("");
      qc.invalidateQueries({ queryKey: queryKeys.application(app.id) });
      toast.success("Note added");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Add a private note about this candidate…"
          rows={3}
        />
        <Button
          size="sm"
          onClick={() => addNote.mutate()}
          disabled={!content.trim() || addNote.isPending}
        >
          <Send className="mr-1 h-3.5 w-3.5" aria-hidden />
          Add Note
        </Button>
      </div>
      <ul className="space-y-2">
        {notes.map((n) => (
          <li key={n.id} className="rounded-md border border-border p-2.5 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold">{n.author}</span>
              <span className="text-[10px] text-muted-foreground">
                {relativeTime(n.createdAt)} {n.isPrivate && "· 🔒 private"}
              </span>
            </div>
            <p className="mt-1 text-xs">{n.content}</p>
          </li>
        ))}
        {notes.length === 0 && (
          <li className="py-6 text-center text-sm text-muted-foreground">No notes yet.</li>
        )}
      </ul>
    </div>
  );
}
