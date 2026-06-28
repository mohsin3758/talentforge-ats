"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, queryKeys } from "@/lib/ats/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Zap, Plus, Loader2, ArrowRight, Play } from "lucide-react";
import { AUTOMATION_TEMPLATES, TRIGGER_TYPES, ACTION_TYPES } from "@/lib/ats/constants";
import { toast } from "sonner";
import type { Automation } from "@/lib/ats/types";

export function AutomationsSection() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: automations, isLoading } = useQuery({
    queryKey: queryKeys.automations,
    queryFn: api.listAutomations,
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      api.updateAutomation(id, { enabled }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.automations });
    },
  });

  const addTemplateMutation = useMutation({
    mutationFn: (template: (typeof AUTOMATION_TEMPLATES)[number]) =>
      api.createAutomation({
        name: template.name,
        description: template.description,
        trigger: template.trigger,
        triggerConfig: template.triggerConfig,
        action: template.action,
        actionConfig: template.actionConfig,
        enabled: true,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.automations });
      toast.success("Template enabled");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl">
            <Zap className="h-7 w-7 text-amber-600 dark:text-amber-400" aria-hidden />
            Automations
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Build rule-based automations that trigger on pipeline events. Combine triggers (stage change, new application, score threshold, inactivity) with actions (send email, move stage, create task, alert, AI screen) to remove manual follow-up work. Each automation tracks total run count so you can measure impact.
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-1.5 h-4 w-4" aria-hidden />
          New Automation
        </Button>
      </div>

      <Card className="border-amber-200 bg-amber-50/40 dark:border-amber-900/40 dark:bg-amber-950/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Play className="h-4 w-4 text-amber-600" aria-hidden />
            Quick Templates
          </CardTitle>
          <CardDescription>
            One-click enable a pre-built automation tuned for staffing workflows.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {AUTOMATION_TEMPLATES.map((t) => (
              <div key={t.name} className="rounded-md border border-border bg-background p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold">{t.name}</p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => addTemplateMutation.mutate(t)}
                    disabled={addTemplateMutation.isPending}
                  >
                    <Plus className="mr-1 h-3 w-3" aria-hidden />
                    Enable
                  </Button>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{t.description}</p>
                <div className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Badge variant="secondary" className="text-[10px]">
                    {TRIGGER_TYPES.find((x) => x.id === t.trigger)?.label}
                  </Badge>
                  <ArrowRight className="h-3 w-3" aria-hidden />
                  <Badge variant="secondary" className="text-[10px]">
                    {ACTION_TYPES.find((x) => x.id === t.action)?.label}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3">
        {isLoading && [...Array(4)].map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-md border border-border bg-muted/30" />
        ))}
        {(automations ?? []).map((a) => (
          <AutomationCard
            key={a.id}
            automation={a}
            onToggle={(enabled) => toggleMutation.mutate({ id: a.id, enabled })}
          />
        ))}
      </div>

      <CreateAutomationDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}

function AutomationCard({
  automation,
  onToggle,
}: {
  automation: Automation;
  onToggle: (enabled: boolean) => void;
}) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-3 p-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">{automation.name}</h3>
            {automation.enabled ? (
              <Badge className="bg-emerald-100 text-emerald-700 text-[10px] hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300">
                Active
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-[10px]">Paused</Badge>
            )}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{automation.description}</p>
          <div className="mt-2 flex flex-wrap items-center gap-1 text-[10px] text-muted-foreground">
            <Badge variant="outline" className="text-[10px]">
              {TRIGGER_TYPES.find((t) => t.id === automation.trigger)?.label}
            </Badge>
            <ArrowRight className="h-3 w-3" aria-hidden />
            <Badge variant="outline" className="text-[10px]">
              {ACTION_TYPES.find((a) => a.id === automation.action)?.label}
            </Badge>
            <span className="ml-2">· {automation.runCount} runs</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={automation.enabled}
            onCheckedChange={onToggle}
            aria-label={`Toggle ${automation.name}`}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function CreateAutomationDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [trigger, setTrigger] = useState<string>("score_threshold");
  const [action, setAction] = useState<string>("send_email");
  const [triggerConfig, setTriggerConfig] = useState("{}");
  const [actionConfig, setActionConfig] = useState("{}");

  const mutation = useMutation({
    mutationFn: () => {
      let parsedTrigger: Record<string, unknown>;
      let parsedAction: Record<string, unknown>;
      try {
        parsedTrigger = JSON.parse(triggerConfig || "{}");
      } catch {
        throw new Error(
          "Trigger config is not valid JSON. Use {} or {\"min\": 80} etc.",
        );
      }
      try {
        parsedAction = JSON.parse(actionConfig || "{}");
      } catch {
        throw new Error(
          "Action config is not valid JSON. Use {} or {\"template\": \"rejection\"} etc.",
        );
      }
      return api.createAutomation({
        name,
        description,
        trigger: trigger as Automation["trigger"],
        action: action as Automation["action"],
        triggerConfig: parsedTrigger,
        actionConfig: parsedAction,
        enabled: true,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.automations });
      toast.success("Automation created");
      onOpenChange(false);
      setName(""); setDescription(""); setTriggerConfig("{}"); setActionConfig("{}");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>New automation</DialogTitle>
          <DialogDescription>
            Define a trigger and the action to take when it fires.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Name *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1" rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Trigger</Label>
              <Select value={trigger} onValueChange={setTrigger}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TRIGGER_TYPES.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Action</Label>
              <Select value={action} onValueChange={setAction}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ACTION_TYPES.map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-xs">Trigger config (JSON)</Label>
            <Textarea
              value={triggerConfig}
              onChange={(e) => setTriggerConfig(e.target.value)}
              className="mt-1 font-mono text-xs"
              rows={2}
              placeholder='{"minScore": 80}'
            />
          </div>
          <div>
            <Label className="text-xs">Action config (JSON)</Label>
            <Textarea
              value={actionConfig}
              onChange={(e) => setActionConfig(e.target.value)}
              className="mt-1 font-mono text-xs"
              rows={2}
              placeholder='{"emailType": "rejection"}'
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || !name}
          >
            {mutation.isPending && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" aria-hidden />}
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
