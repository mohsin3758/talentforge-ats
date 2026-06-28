"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api, queryKeys } from "@/lib/ats/api";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Sparkles, Loader2, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function AIInterviewGenerator() {
  const [applicationId, setApplicationId] = useState("");
  const [interviewType, setInterviewType] = useState("video");
  const [copied, setCopied] = useState(false);

  const { data: apps } = useQuery({
    queryKey: queryKeys.applications({}),
    queryFn: () => api.listApplications({}),
  });

  const mutation = useMutation({
    mutationFn: () => api.aiInterview({ applicationId, interviewType }),
    onSuccess: () => toast.success("Questions generated"),
    onError: (e: Error) => toast.error(e.message),
  });

  function copy() {
    if (!mutation.data) return;
    navigator.clipboard.writeText(
      mutation.data.questions.map((q, i) => `${i + 1}. ${q}`).join("\n"),
    );
    setCopied(true);
    toast.success("Copied");
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Application</Label>
          <Select value={applicationId} onValueChange={setApplicationId}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Pick candidate application" />
            </SelectTrigger>
            <SelectContent>
              {(apps ?? []).slice(0, 50).map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.candidate?.fullName ?? "?"} — {a.job?.title ?? ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Interview Type</Label>
          <Select value={interviewType} onValueChange={setInterviewType}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Pick type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="phone">Phone Screen</SelectItem>
              <SelectItem value="video">Video Interview</SelectItem>
              <SelectItem value="onsite">Onsite</SelectItem>
              <SelectItem value="panel">Panel</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending || !applicationId}
      >
        {mutation.isPending ? (
          <Loader2 className="mr-1.5 h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <Sparkles className="mr-1.5 h-4 w-4" aria-hidden />
        )}
        Generate Questions
      </Button>
      {mutation.data && (
        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Tailored Questions
            </span>
            <Button variant="outline" size="sm" onClick={copy}>
              {copied ? (
                <Check className="mr-1 h-3.5 w-3.5 text-emerald-600" aria-hidden />
              ) : (
                <Copy className="mr-1 h-3.5 w-3.5" aria-hidden />
              )}
              Copy
            </Button>
          </div>
          <ol className="list-decimal space-y-1.5 pl-5 text-sm">
            {mutation.data.questions.map((q, i) => (
              <li key={i}>{q}</li>
            ))}
          </ol>
          {mutation.data.focusAreas.length > 0 && (
            <div className="mt-3 rounded bg-background/60 p-2 text-xs">
              <span className="font-semibold">Focus areas to probe:</span>{" "}
              {mutation.data.focusAreas.join(" · ")}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
