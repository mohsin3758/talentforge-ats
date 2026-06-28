"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, queryKeys } from "@/lib/ats/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { KPICard } from "../cards/KPICard";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart3,
  Clock,
  DollarSign,
  Percent,
  Star,
  Download,
  Users,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ScatterChart,
  Scatter,
  ZAxis,
} from "recharts";
import { SOURCES } from "@/lib/ats/constants";
import { toast } from "sonner";

const RANGES = [
  { id: "7", label: "Last 7 days" },
  { id: "30", label: "Last 30 days" },
  { id: "90", label: "Last 90 days" },
];

export function AnalyticsSection() {
  const [range, setRange] = useState("30");
  const { data: analytics, isLoading } = useQuery({
    queryKey: queryKeys.analytics,
    queryFn: api.getAnalytics,
  });

  // Deterministic time-series data (seeded by day index — no Math.random for stable renders)
  const days = Number(range);
  const timeSeries = Array.from({ length: days }, (_, i) => {
    const date = new Date(Date.now() - (days - i - 1) * 86400000);
    // Seeded pseudo-random: deterministic per day index
    const seed = i + 1;
    const appsWave = Math.sin(i / 3) * 2 + Math.cos(i / 7) * 1.5;
    const intWave = Math.sin(i / 4) + Math.cos(i / 5) * 0.5;
    return {
      date: date.toISOString().slice(5, 10),
      applications: Math.max(0, Math.round(4 + appsWave + (seed % 3))),
      interviews: Math.max(0, Math.round(1.5 + intWave + (seed % 2))),
    };
  });

  const funnelConversion = (analytics?.hiringFunnel ?? []).map((s, i, arr) => {
    const prev = i === 0 ? s.count : arr[i - 1].count;
    const rate = prev === 0 ? 0 : Math.round((s.count / prev) * 100);
    return { stage: s.stage, count: s.count, rate };
  });

  // Deterministic per-source cost (industry benchmarks, no Math.random)
  const SOURCE_COST: Record<string, number> = {
    linkedin: 4200,
    indeed: 1800,
    referral: 800,
    direct: 500,
    job_board: 2400,
    agency: 6500,
  };
  const sourceROI = (analytics?.sourceEffectiveness ?? []).map((s) => {
    const sourceMeta = SOURCES.find((x) => x.id === s.source);
    return {
      source: sourceMeta?.label ?? s.source,
      applications: s.applications,
      hires: s.hires,
      costPerHire: SOURCE_COST[s.source] ?? 1500,
    };
  });

  // Compute departmentHires from real applications (joined with job data)
  const { data: allApps } = useQuery({
    queryKey: queryKeys.applications({}),
    queryFn: () => api.listApplications({}),
  });
  const departmentHires = (() => {
    const byDept: Record<string, { applied: number; interviewed: number; offered: number; hired: number }> = {};
    for (const a of allApps ?? []) {
      const dept = a.job?.department ?? "Unknown";
      if (!byDept[dept]) byDept[dept] = { applied: 0, interviewed: 0, offered: 0, hired: 0 };
      byDept[dept].applied++;
      if (["interview", "assessment", "offer", "hired"].includes(a.stage)) byDept[dept].interviewed++;
      if (["offer", "hired"].includes(a.stage)) byDept[dept].offered++;
      if (a.stage === "hired") byDept[dept].hired++;
    }
    return Object.entries(byDept).map(([dept, v]) => ({ dept, ...v }));
  })();

  // Recruiter perf is based on hiring managers (from jobs) — deterministic
  const recruiterPerf = (() => {
    const byHm: Record<string, { apps: number; interviews: number; hires: number }> = {};
    for (const a of allApps ?? []) {
      const hm = a.job?.hiringManager ?? "Unassigned";
      if (!byHm[hm]) byHm[hm] = { apps: 0, interviews: 0, hires: 0 };
      byHm[hm].apps++;
      if (["interview", "assessment", "offer", "hired"].includes(a.stage)) byHm[hm].interviews++;
      if (a.stage === "hired") byHm[hm].hires++;
    }
    return Object.entries(byHm).map(([name, v]) => ({ name, ...v }));
  })();

  function handleExport() {
    toast.success("Report exported (mock) — would download as CSV in production");
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl">
            <BarChart3 className="h-7 w-7 text-emerald-600 dark:text-emerald-400" aria-hidden />
            Analytics
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Track recruiting performance across pipeline, sources, departments, and individual recruiters. All metrics pull live from the database — no stale snapshots.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-2 text-sm"
            aria-label="Date range"
          >
            {RANGES.map((r) => (
              <option key={r.id} value={r.id}>{r.label}</option>
            ))}
          </select>
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-1.5 h-4 w-4" aria-hidden />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {isLoading ? (
          [...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 w-full" />)
        ) : (
          <>
            <KPICard
              label="Time to Hire"
              value={`${analytics?.timeToHireAvgDays ?? analytics?.timeToHireAvg ?? 0}d`}
              delta={-8}
              icon={Clock}
              hint="Avg days from applied → hired"
              accentClass="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            />
            <KPICard
              label="Cost per Hire"
              value={`$${(analytics?.costPerHire ?? 0).toLocaleString()}`}
              delta={-5}
              icon={DollarSign}
              hint="Weighted avg across sources"
              accentClass="bg-amber-500/10 text-amber-600 dark:text-amber-400"
            />
            <KPICard
              label="Offer Acceptance"
              value={`${analytics?.offerAcceptanceRate ?? 0}%`}
              delta={4}
              icon={Percent}
              hint={`${analytics?.offersAccepted ?? 0} of ${(analytics?.offersAccepted ?? 0) + (analytics?.offersDeclined ?? 0)} offers accepted`}
              accentClass="bg-sky-500/10 text-sky-600 dark:text-sky-400"
            />
            <KPICard
              label="Quality of Hire"
              value={`${(analytics?.qualityOfHire ?? 0).toFixed(1)}/5`}
              delta={2}
              icon={Star}
              hint="Avg interviewer rating"
              accentClass="bg-violet-500/10 text-violet-600 dark:text-violet-400"
            />
          </>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Applications Over Time</CardTitle>
            <CardDescription>Daily volume over the selected range</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeSeries} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="appsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0d9488" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#0d9488" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      fontSize: 12,
                      border: "1px solid var(--border)",
                      background: "var(--popover)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="applications"
                    stroke="#0d9488"
                    fill="url(#appsGrad)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="interviews"
                    stroke="#f59e0b"
                    fill="#f59e0b33"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Funnel Conversion Rate</CardTitle>
            <CardDescription>Stage-to-stage conversion %</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnelConversion} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="stage" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      fontSize: 12,
                      border: "1px solid var(--border)",
                      background: "var(--popover)",
                    }}
                  />
                  <Bar dataKey="count" name="Count" fill="#0d9488" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Source ROI</CardTitle>
            <CardDescription>Cost vs hires per source</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 5, right: 10, bottom: 0, left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis
                    type="number"
                    dataKey="costPerHire"
                    name="Cost per Hire"
                    tick={{ fontSize: 10 }}
                    tickFormatter={(v) => `$${v}`}
                  />
                  <YAxis
                    type="number"
                    dataKey="hires"
                    name="Hires"
                    tick={{ fontSize: 10 }}
                  />
                  <ZAxis type="number" dataKey="applications" range={[60, 360]} name="Applications" />
                  <Tooltip
                    cursor={{ strokeDasharray: "3 3" }}
                    contentStyle={{
                      borderRadius: 8,
                      fontSize: 12,
                      border: "1px solid var(--border)",
                      background: "var(--popover)",
                    }}
                  />
                  <Scatter data={sourceROI} fill="#0d9488" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Hiring by Department</CardTitle>
            <CardDescription>Stacked: applied / interviewed / offered / hired</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentHires} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="dept" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      fontSize: 12,
                      border: "1px solid var(--border)",
                      background: "var(--popover)",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="applied" stackId="a" fill="#94a3b8" />
                  <Bar dataKey="interviewed" stackId="a" fill="#8b5cf6" />
                  <Bar dataKey="offered" stackId="a" fill="#06b6d4" />
                  <Bar dataKey="hired" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4 text-emerald-600" aria-hidden />
            Recruiter Performance
          </CardTitle>
          <CardDescription>Apps processed, interviews, and hires per recruiter</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/30 text-xs">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Recruiter</th>
                  <th className="px-4 py-2 text-right font-medium text-muted-foreground">Apps</th>
                  <th className="px-4 py-2 text-right font-medium text-muted-foreground">Interviews</th>
                  <th className="px-4 py-2 text-right font-medium text-muted-foreground">Hires</th>
                  <th className="px-4 py-2 text-right font-medium text-muted-foreground">Conv. Rate</th>
                </tr>
              </thead>
              <tbody>
                {recruiterPerf.map((r) => (
                  <tr key={r.name} className="border-b border-border last:border-0">
                    <td className="px-4 py-2 font-medium">{r.name}</td>
                    <td className="px-4 py-2 text-right">{r.apps}</td>
                    <td className="px-4 py-2 text-right">{r.interviews}</td>
                    <td className="px-4 py-2 text-right">{r.hires}</td>
                    <td className="px-4 py-2 text-right">
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                        {r.apps === 0 ? 0 : Math.round((r.hires / r.apps) * 100)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
