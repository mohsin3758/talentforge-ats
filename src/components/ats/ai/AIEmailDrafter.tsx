"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api, queryKeys } from "@/lib/ats/api";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Sparkles, Loader2, Copy, Check, Send } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const EMAIL_TYPES = [
  { value: "screening", label: "Screening" },
  { value: "interview_invite", label: "Interview Invite" },
  { value: "follow_up", label: "Follow Up" },
  { value: "rejection", label: "Rejection" },
  { value: "offer", label: "Offer" },
];
const TONES = [
  { value: "professional", label: "Professional" },
  { value: "friendly", label: "Friendly" },
  { value: "formal", label: "Formal" },
];

export function AIEmailDrafter() {
  const [applicationId, setApplicationId] = useState("");
  const [emailType, setEmailType] = useState("screening");
  const [tone, setTone] = useState("professional");
  const [copied, setCopied] = useState(false);

  const { data: apps } = useQuery({
    queryKey: queryKeys.applications({}),
    queryFn: () => api.listApplications({}),
  });

  const mutation = useMutation({
    mutationFn: () =>
      api.aiEmail({
        applicationId,
        emailType,
        tone,
      } as {
        applicationId: string;
        emailType: "screening" | "rejection" | "offer" | "interview_invite" | "follow_up";
        tone: "professional" | "friendly" | "formal";
      }),
    onSuccess: () => toast.success("Email drafted"),
    onError: (e: Error) => toast.error(e.message),
  });

  function copy() {
    if (!mutation.data) return;
    navigator.clipboard.writeText(`Subject: ${mutation.data.subject}\n\n${mutation.data.body}`);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <Label className="text-xs">Application</Label>
          <Select value={applicationId} onValueChange={setApplicationId}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Pick candidate" />
            </SelectTrigger>
            <SelectContent>
              {(apps ?? []).slice(0, 50).map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.candidate?.fullName ?? "?"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Email Type</Label>
          <Select value={emailType} onValueChange={setEmailType}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EMAIL_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Tone</Label>
          <Select value={tone} onValueChange={setTone}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TONES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending || !applicationId}
        >
          {mutation.isPending ? (
            <Loader2 className="mr-1.5 h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Sparkles className="mr-1.5 h-4 w-4" aria-hidden />
          )}
          Draft Email
        </Button>
        {mutation.data && (
          <Button variant="outline" onClick={copy}>
            {copied ? (
              <Check className="mr-1.5 h-4 w-4 text-emerald-600" aria-hidden />
            ) : (
              <Copy className="mr-1.5 h-4 w-4" aria-hidden />
            )}
            {copied ? "Copied" : "Copy"}
          </Button>
        )}
      </div>
      {mutation.data && (
        <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-4">
          <div className="rounded bg-background/60 p-2 text-sm">
            <span className="text-xs font-semibold text-muted-foreground">Subject: </span>
            <span className="font-medium">{mutation.data.subject}</span>
          </div>
          <pre className="whitespace-pre-wrap rounded bg-background/60 p-3 text-xs font-mono">
            {mutation.data.body}
          </pre>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Send className="h-3 w-3" aria-hidden />
            Saved as draft in candidate&apos;s communication log
          </div>
        </div>
      )}
    </div>
  );
}
