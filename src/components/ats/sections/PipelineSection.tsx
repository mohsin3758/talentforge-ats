"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  useDroppable,
} from "@dnd-kit/core";
import { api, queryKeys } from "@/lib/ats/api";
import { ApplicationCard } from "../cards/ApplicationCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useUIStore } from "@/lib/ats/store";
import { STAGES } from "@/lib/ats/constants";
import type { Application, Stage } from "@/lib/ats/types";
import { KanbanSquare, Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function Column({
  stage,
  applications,
  onCardClick,
}: {
  stage: (typeof STAGES)[number];
  applications: Application[];
  onCardClick: (app: Application) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });
  return (
    <div className="flex w-72 shrink-0 flex-col rounded-lg border border-border bg-muted/30">
      <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2">
        <div className="flex items-center gap-2">
          <span className={cn("h-2 w-2 rounded-full", stage.dotClass)} aria-hidden />
          <span className="text-xs font-semibold">{stage.label}</span>
        </div>
        <span className="rounded-full bg-background px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
          {applications.length}
        </span>
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 space-y-2 overflow-y-auto scrollbar-thin p-2",
          isOver && "bg-emerald-500/5",
        )}
        style={{ maxHeight: "calc(100vh - 18rem)" }}
        aria-label={`${stage.label} column with ${applications.length} applications`}
      >
        {applications.map((app) => (
          <ApplicationCard key={app.id} application={app} onClick={onCardClick} draggable />
        ))}
        {applications.length === 0 && (
          <div className="flex h-20 items-center justify-center rounded-md border border-dashed border-border/60 text-[10px] text-muted-foreground">
            Drop here
          </div>
        )}
      </div>
    </div>
  );
}

export function PipelineSection() {
  const qc = useQueryClient();
  const selectedAppId = useUIStore((s) => s.selectedAppId);
  const setSelectedAppId = useUIStore((s) => s.setSelectedAppId);
  const pipelineJobId = useUIStore((s) => s.pipelineJobId);
  const setPipelineJobId = useUIStore((s) => s.setPipelineJobId);
  const [dragId, setDragId] = useState<string | null>(null);

  const { data: jobs } = useQuery({
    queryKey: queryKeys.jobs,
    queryFn: () => api.listJobs(),
  });

  const filters = useMemo(
    () => ({
      jobId: pipelineJobId && pipelineJobId !== "all" ? pipelineJobId : "",
    }),
    [pipelineJobId],
  );

  const { data: applications, isLoading } = useQuery({
    queryKey: queryKeys.applications(filters),
    queryFn: () => api.listApplications(filters),
  });

  const stageMutation = useMutation({
    mutationFn: ({ id, stage }: { id: string; stage: string }) => api.moveStage(id, stage),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ats", "applications"] });
      qc.invalidateQueries({ queryKey: queryKeys.analytics });
      toast.success("Stage updated");
    },
    onError: (e: Error) => toast.error(`Move failed: ${e.message}`),
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  function handleDragStart(e: DragStartEvent) {
    setDragId(String(e.active.id));
  }
  function handleDragEnd(e: DragEndEvent) {
    setDragId(null);
    const { active, over } = e;
    if (!over) return;
    const newStage = String(over.id) as Stage;
    const appId = String(active.id);
    const app = applications?.find((a) => a.id === appId);
    if (!app || app.stage === newStage) return;
    stageMutation.mutate({ id: appId, stage: newStage });
  }

  function handleCardClick(app: Application) {
    setSelectedAppId(app.id);
  }

  const activeApp = applications?.find((a) => a.id === dragId);
  const grouped = (applications ?? []).reduce(
    (acc, app) => {
      (acc[app.stage] ??= []).push(app);
      return acc;
    },
    {} as Record<string, Application[]>,
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl">
            <KanbanSquare className="h-7 w-7 text-emerald-600 dark:text-emerald-400" aria-hidden />
            Pipeline
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Drag candidates across stages to update their pipeline position. All stage changes persist immediately and trigger any matching automations (e.g. AI summary to hiring manager on interview stage).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" aria-hidden />
          <Select
            value={pipelineJobId ?? "all"}
            onValueChange={(v) => setPipelineJobId(v as string | "all")}
          >
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Filter by job" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All jobs</SelectItem>
              {(jobs ?? []).map((j) => (
                <SelectItem key={j.id} value={j.id}>
                  {j.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {STAGES.map((s) => (
            <Skeleton key={s.id} className="h-80 w-72 shrink-0" />
          ))}
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setDragId(null)}
        >
          <div
            className="flex gap-3 overflow-x-auto scrollbar-thin pb-3"
            role="region"
            aria-label="Pipeline Kanban board"
          >
            {STAGES.map((stage) => (
              <Column
                key={stage.id}
                stage={stage}
                applications={grouped[stage.id] ?? []}
                onCardClick={handleCardClick}
              />
            ))}
          </div>
          <DragOverlay>
            {activeApp ? (
              <div className="w-72 rotate-2 opacity-80">
                <ApplicationCard application={activeApp} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {selectedAppId && (
        <p className="text-xs text-muted-foreground">
          Selected: {selectedAppId.slice(0, 8)}… — see profile dialog.
        </p>
      )}
    </div>
  );
}
