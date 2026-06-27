"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star, GripVertical } from "lucide-react";
import type { Application } from "@/lib/ats/types";
import { scoreColor, SOURCE_LABELS } from "@/lib/ats/constants";
import { initials } from "@/lib/ats/format";
import { cn } from "@/lib/utils";

interface ApplicationCardProps {
  application: Application;
  onClick?: (app: Application) => void;
  draggable?: boolean;
  compact?: boolean;
}

export function ApplicationCard({ application, onClick, draggable, compact }: ApplicationCardProps) {
  const candidate = application.candidate;
  const name = candidate?.fullName ?? "Unknown";
  return (
    <button
      type="button"
      onClick={() => onClick?.(application)}
      className={cn(
        "group relative flex w-full items-start gap-2 rounded-md border border-border bg-background p-2.5 text-left transition-all hover:border-emerald-300 hover:shadow-sm",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      )}
      aria-label={`Application from ${name}, score ${application.matchScore}`}
    >
      {draggable && (
        <GripVertical
          className="mt-0.5 h-3.5 w-3.5 shrink-0 cursor-grab text-muted-foreground/50 opacity-0 group-hover:opacity-100"
          aria-hidden
        />
      )}
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback className="bg-emerald-500/10 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
          {initials(name)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1">
          <p className="truncate text-xs font-semibold">{name}</p>
          {application.starred && (
            <Star className="h-3 w-3 shrink-0 fill-amber-400 text-amber-400" aria-hidden />
          )}
        </div>
        {!compact && (
          <p className="truncate text-[11px] text-muted-foreground">
            {candidate?.currentTitle ?? "—"}
          </p>
        )}
        <div className="mt-1 flex items-center gap-1">
          <span
            className={cn(
              "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
              scoreColor(application.matchScore),
            )}
          >
            {application.matchScore}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {SOURCE_LABELS[application.source]}
          </span>
        </div>
      </div>
    </button>
  );
}
