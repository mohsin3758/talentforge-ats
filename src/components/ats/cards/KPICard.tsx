"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

interface KPICardProps {
  label: string;
  value: string | number;
  delta?: number;
  icon?: React.ElementType;
  hint?: string;
  accentClass?: string;
}

export function KPICard({ label, value, delta, icon: Icon, hint, accentClass }: KPICardProps) {
  const isUp = (delta ?? 0) >= 0;
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {label}
            </p>
            <p className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">{value}</p>
            {hint && <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>}
            {delta !== undefined && (
              <div
                className={cn(
                  "mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold",
                  isUp
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                    : "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
                )}
              >
                {isUp ? (
                  <ArrowUpRight className="h-3 w-3" aria-hidden />
                ) : (
                  <ArrowDownRight className="h-3 w-3" aria-hidden />
                )}
                <span>
                  {isUp ? "+" : ""}
                  {delta}%
                </span>
                <span className="font-normal text-muted-foreground">vs last month</span>
              </div>
            )}
          </div>
          {Icon && (
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                accentClass ?? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
              )}
              aria-hidden
            >
              <Icon className="h-5 w-5" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
