"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api, queryKeys } from "@/lib/ats/api";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Sparkles, Loader2, Copy, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function AIOfferLetter() {
  const [applicationId, setApplicationId] = useState("");
  const [salary, setSalary] = useState("120000");
  const [startDate, setStartDate] = useState(
    new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
  );
  const [extras, setExtras] = useState("Remote-friendly, full benefits, $5K learning budget");
  const [copied, setCopied] = useState(false);

  const { data: apps } = useQuery({
    queryKey: queryKeys.applications({ stage: "offer" }),
    queryFn: () => api.listApplications({ stage: "offer" }),
  });
  const { data: moreApps } = useQuery({
    queryKey: queryKeys.applications({ stage: "interview" }),
    queryFn: () => api.listApplications({ stage: "interview" }),
  });
  const allApps = [...(apps ?? []), ...(moreApps ?? [])];

  const mutation = useMutation({
    mutationFn: () =>
      api.aiOffer({
        applicationId,
        salary: Number(salary),
        startDate,
        extras,
      }),
    onSuccess: () => toast.success("Offer letter generated"),
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
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <Label className="text-xs">Application (offer or interview stage)</Label>
          <Select value={applicationId} onValueChange={setApplicationId}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Pick candidate" />
            </SelectTrigger>
            <SelectContent>
              {allApps.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.candidate?.fullName ?? "?"} — {a.job?.title ?? ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Salary (annual, USD)</Label>
          <Input
            className="mt-1"
            type="number"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
          />
        </div>
        <div>
          <Label className="text-xs">Start Date</Label>
          <Input
            className="mt-1"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
      </div>
      <div>
        <Label className="text-xs">Extras / benefits</Label>
        <Input
          className="mt-1"
          value={extras}
          onChange={(e) => setExtras(e.target.value)}
          placeholder="Remote-friendly, full benefits…"
        />
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
          Generate Offer Letter
        </Button>
        {mutation.data && (
          <Button variant="outline" onClick={copy}>
            {copied ? (
              <Check className="mr-1.5 h-4 w-4 text-emerald-600" aria-hidden />
            ) : (
              <Copy className="mr-1.5 h-4 w-4" aria-hidden />
            )}
            Copy
          </Button>
        )}
      </div>
      {mutation.data && (
        <div className="max-h-96 overflow-y-auto scrollbar-thin rounded-lg border border-border bg-muted/30 p-4">
          <article className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown>{mutation.data.content}</ReactMarkdown>
          </article>
        </div>
      )}
    </div>
  );
}
