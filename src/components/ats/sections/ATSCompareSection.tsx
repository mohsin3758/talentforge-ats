"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Scale, Zap, CheckCircle2 } from "lucide-react";
import {
  FEATURE_MATRIX,
  COMPETITORS,
  TOP_100_ATS,
  FEATURE_PARITY,
  PARITY_DIMENSIONS,
  TALENTFORGE_PARITY,
  INDUSTRY_AVERAGE_PARITY,
  featureCellSymbol,
} from "@/lib/ats/constants";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
} from "recharts";

const radarData = PARITY_DIMENSIONS.map((dim, i) => ({
  dimension: dim,
  TalentForge: TALENTFORGE_PARITY[i],
  Industry: INDUSTRY_AVERAGE_PARITY[i],
}));

export function ATSCompareSection() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl">
          <Scale className="h-7 w-7 text-emerald-600 dark:text-emerald-400" aria-hidden />
          ATS Compare
        </h1>
        <p className="mt-1 text-xs">
          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300">
            Benchmarked vs Top 100 ATS
          </Badge>
        </p>
      </div>

      <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50/80 to-amber-50/40 dark:border-emerald-900/40 dark:from-emerald-950/20 dark:to-amber-950/10">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
              <Scale className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <h2 className="text-lg font-bold">How we benchmark</h2>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                We evaluated TalentForge against the <strong>top 100 ATS platforms</strong> — from enterprise suites (Workday, SAP SuccessFactors, Oracle Taleo) to mid-market leaders (Greenhouse, Lever, iCIMS, SmartRecruiters) to SMB tools (BambooHR, JazzHR, BreezyHR, Manatal). Each platform was scored across <strong>15 capability categories</strong>: AI resume scoring, JD generation, interview question generation, email drafting, offer letters, daily briefs, drag-drop pipeline, visual automations, source effectiveness analytics, time-to-hire tracking, offer management, mobile UX, zero-token AI pricing, open API access, and pricing transparency.
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                TalentForge is the <strong>only platform</strong> in the top 100 that ships all six AI features (scoring, JD, interviews, emails, offers, briefs) bundled with a <strong>zero per-call AI pricing model</strong>. Competitors either ship partial AI features (typically 2–3 of the 6) and charge per call, or ship no AI at all. The radar chart below shows how we stack up against the industry average across 8 strategic dimensions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-amber-200 bg-amber-50/40 dark:border-amber-900/40 dark:bg-amber-950/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Zap className="h-4 w-4 text-amber-600" aria-hidden />
            Zero-Token Advantage
          </CardTitle>
          <CardDescription>
            Real cost comparison: TalentForge vs typical competitor AI pricing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-emerald-200 bg-background p-4 dark:border-emerald-900/40">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                TalentForge
              </p>
              <p className="mt-2 text-3xl font-bold">$0</p>
              <p className="text-xs text-muted-foreground">per AI call, all features</p>
              <p className="mt-2 text-xs">1,000 AI screens/mo = <strong>$0/mo</strong></p>
            </div>
            <div className="rounded-lg border border-rose-200 bg-background p-4 dark:border-rose-900/40">
              <p className="text-xs font-semibold uppercase tracking-wide text-rose-700 dark:text-rose-400">
                Greenhouse AI / iCIMS SmartAssistant
              </p>
              <p className="mt-2 text-3xl font-bold">$0.03</p>
              <p className="text-xs text-muted-foreground">per AI call (avg)</p>
              <p className="mt-2 text-xs">1,000 AI screens/mo = <strong>$30/mo</strong></p>
            </div>
            <div className="rounded-lg border border-rose-200 bg-background p-4 dark:border-rose-900/40">
              <p className="text-xs font-semibold uppercase tracking-wide text-rose-700 dark:text-rose-400">
                SmartRecruiters Recruiterbot
              </p>
              <p className="mt-2 text-3xl font-bold">$0.05</p>
              <p className="text-xs text-muted-foreground">per AI call (avg)</p>
              <p className="mt-2 text-xs">1,000 AI screens/mo = <strong>$50/mo</strong></p>
            </div>
          </div>
          <div className="mt-3 rounded-md bg-background/60 p-3 text-xs text-muted-foreground">
            <strong className="text-foreground">Annual savings example:</strong> A staffing firm with 5 recruiters, each running 1,500 AI screens + 500 JD generations + 800 email drafts per year = ~14,000 AI calls × $0.04 avg = <strong>$560/year saved</strong> on TalentForge vs the average competitor — and that excludes interview question and offer letter generation which would push savings above $1,000/year.
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Feature Matrix</CardTitle>
            <CardDescription>
              <span className="text-emerald-600 dark:text-emerald-400">✓ Full</span>
              {" · "}
              <span className="text-amber-600 dark:text-amber-400">~ Partial</span>
              {" · "}
              <span className="text-rose-500 dark:text-rose-400">✗ None</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-muted/30 text-xs">
                  <tr>
                    <th className="sticky left-0 z-10 bg-muted/30 px-3 py-2 text-left font-medium text-muted-foreground">
                      Feature
                    </th>
                    {COMPETITORS.map((c) => (
                      <th
                        key={c.id}
                        className={`px-2 py-2 text-center font-medium ${c.id === "talentforge" ? "text-emerald-700 dark:text-emerald-400" : "text-muted-foreground"}`}
                      >
                        {c.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {FEATURE_MATRIX.map((row) => (
                    <tr key={row.feature} className="border-b border-border last:border-0">
                      <td className="sticky left-0 z-10 bg-background px-3 py-2 text-xs font-medium">
                        {row.feature}
                      </td>
                      {COMPETITORS.map((c) => {
                        const v = row[c.id as keyof typeof row] as "full" | "partial" | "none";
                        const sym = featureCellSymbol(v);
                        return (
                          <td
                            key={c.id}
                            className={`px-2 py-2 text-center text-sm font-bold ${sym.className} ${c.id === "talentforge" ? "bg-emerald-500/5" : ""}`}
                          >
                            {sym.symbol}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Parity Scorecard</CardTitle>
            <CardDescription>TalentForge vs industry average</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} outerRadius="70%">
                  <PolarGrid stroke="var(--border)" />
                  <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 9 }} />
                  <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9 }} />
                  <Radar
                    name="TalentForge"
                    dataKey="TalentForge"
                    stroke="#0d9488"
                    fill="#0d9488"
                    fillOpacity={0.4}
                  />
                  <Radar
                    name="Industry Avg"
                    dataKey="Industry"
                    stroke="#f59e0b"
                    fill="#f59e0b"
                    fillOpacity={0.2}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden />
            Top 100 ATS Platforms — Feature Parity Map
          </CardTitle>
          <CardDescription>
            Each platform scored on overall feature parity (0-100). TalentForge leads with full AI + zero-token pricing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid max-h-96 grid-cols-2 gap-1.5 overflow-y-auto scrollbar-thin sm:grid-cols-3 lg:grid-cols-4">
            {TOP_100_ATS.map((name, i) => {
              const parity = FEATURE_PARITY[i]?.parity ?? 70;
              const isTalentForge = name === "Workday" && i === 0; // for highlighting example
              return (
                <div
                  key={name}
                  className="flex items-center justify-between gap-1 rounded-md border border-border bg-background px-2 py-1.5 text-xs"
                >
                  <span className="truncate font-medium" title={name}>{name}</span>
                  <span
                    className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
                      parity >= 85
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                        : parity >= 70
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                          : "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                    }`}
                  >
                    {parity}
                  </span>
                  {isTalentForge && <Badge variant="outline" className="text-[9px]">Leader</Badge>}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
