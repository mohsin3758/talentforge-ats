"use client";

import { useQuery } from "@tanstack/react-query";
import { api, queryKeys } from "@/lib/ats/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { KPICard } from "../cards/KPICard";
import { AIBriefCard } from "../ai/AIBriefCard";
import { Briefcase, Inbox, CalendarClock, UserCheck, TrendingUp, Star } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid,
} from "recharts";
import { SOURCES } from "@/lib/ats/constants";
import { relativeTime, initials } from "@/lib/ats/format";
import { useUIStore } from "@/lib/ats/store";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { scoreColor, scoreTextColor } from "@/lib/ats/constants";
import { cn } from "@/lib/utils";

const ACTIVITY_ICONS: Record<string, React.ElementType> = {
  interview: CalendarClock,
  note: Star,
  communication: Inbox,
  default: TrendingUp,
};

export function DashboardSection() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: queryKeys.analytics,
    queryFn: api.getAnalytics,
  });
  const { data: apps } = useQuery({
    queryKey: queryKeys.applications({}),
    queryFn: () => api.listApplications({}),
  });
  const setSection = useUIStore((s) => s.setSection);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const topPerformers = (apps ?? [])
    .slice()
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 5);

  const sourceData = (analytics?.sourceEffectiveness ?? []).map((s) => ({
    name: SOURCES.find((x) => x.id === s.source)?.label ?? s.source,
    value: s.applications,
    color: SOURCES.find((x) => x.id === s.source)?.color ?? "#94a3b8",
  }));

  const funnelData = analytics?.hiringFunnel ?? [];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Good morning, Recruiter</h1>
        <p className="text-sm text-muted-foreground">{today}</p>
      </div>

      <AIBriefCard />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {isLoading ? (
          [...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 w-full" />)
        ) : (
          <>
            <KPICard
              label="Active Jobs"
              value={analytics?.totalJobs ?? 0}
              delta={12}
              icon={Briefcase}
              hint="Across 5 departments"
              accentClass="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            />
            <KPICard
              label="Open Applications"
              value={analytics?.totalApps ?? 0}
              delta={8}
              icon={Inbox}
              hint={`${analytics?.byStageRecord?.screen ?? 0} in screening`}
              accentClass="bg-sky-500/10 text-sky-600 dark:text-sky-400"
            />
            <KPICard
              label="Interviews This Week"
              value={(analytics?.byStageRecord?.interview ?? 0)}
              delta={-3}
              icon={CalendarClock}
              hint="2 scheduled today"
              accentClass="bg-violet-500/10 text-violet-600 dark:text-violet-400"
            />
            <KPICard
              label="Hires This Month"
              value={analytics?.hiresThisMonth ?? analytics?.byStageRecord?.hired ?? 0}
              delta={20}
              icon={UserCheck}
              hint={`Avg ${analytics?.timeToHireAvgDays ?? 0} days to hire`}
              accentClass="bg-amber-500/10 text-amber-600 dark:text-amber-400"
            />
          </>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Hiring Funnel</CardTitle>
            <CardDescription>
              Distribution of active applications across pipeline stages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={funnelData}
                  layout="vertical"
                  margin={{ top: 5, right: 20, bottom: 5, left: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis
                    dataKey="stage"
                    type="category"
                    tick={{ fontSize: 11 }}
                    width={80}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      fontSize: 12,
                      border: "1px solid var(--border)",
                      background: "var(--popover)",
                    }}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} fill="#0d9488" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Source Effectiveness</CardTitle>
            <CardDescription>
              Where your applications are coming from
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sourceData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={45}
                    paddingAngle={2}
                  >
                    {sourceData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      fontSize: 12,
                      border: "1px solid var(--border)",
                      background: "var(--popover)",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Recent Activity</CardTitle>
            <CardDescription>
              Latest events across your recruiting pipeline
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : (
              <ul className="max-h-96 space-y-2 overflow-y-auto scrollbar-thin pr-1" role="log">
                {(analytics?.recentActivity ?? []).map((act, i) => {
                  const Icon = ACTIVITY_ICONS[act.type] ?? ACTIVITY_ICONS.default;
                  return (
                    <li
                      key={i}
                      className="flex items-start gap-3 rounded-md border border-border bg-muted/30 px-3 py-2 text-sm"
                    >
                      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-background">
                        <Icon className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate">{act.desc}</p>
                        <p className="text-[11px] text-muted-foreground">{relativeTime(act.at)}</p>
                      </div>
                    </li>
                  );
                })}
                {(!analytics?.recentActivity || analytics.recentActivity.length === 0) && (
                  <li className="py-8 text-center text-sm text-muted-foreground">
                    No recent activity yet.
                  </li>
                )}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Performers</CardTitle>
            <CardDescription>Highest match scores this week</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {topPerformers.map((app) => (
                <li key={app.id}>
                  <button
                    type="button"
                    onClick={() => {
                      useUIStore.getState().setSelectedAppId(app.id);
                      useUIStore.getState().setSection("pipeline");
                    }}
                    className="flex w-full items-center gap-3 rounded-md border border-border bg-background px-3 py-2 text-left transition-colors hover:bg-accent"
                  >
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className="bg-emerald-500/10 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                        {initials(app.candidate?.fullName ?? "?")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {app.candidate?.fullName ?? "Unknown"}
                      </p>
                      <p className="truncate text-[11px] text-muted-foreground">
                        {app.candidate?.currentTitle ?? "—"}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2 py-0.5 text-xs font-bold",
                        scoreColor(app.matchScore),
                      )}
                    >
                      {app.matchScore}
                    </span>
                  </button>
                </li>
              ))}
              {topPerformers.length === 0 && (
                <li className="py-8 text-center text-sm text-muted-foreground">
                  No applications yet.
                </li>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-center pt-2">
        <button
          type="button"
          onClick={() => setSection("pipeline")}
          className="text-xs text-muted-foreground underline-offset-4 hover:underline"
        >
          View full pipeline →
        </button>
      </div>
    </div>
  );
}
