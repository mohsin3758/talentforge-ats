"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Settings, Building2, ListChecks, Plug, Sparkles, Bell } from "lucide-react";
import { useState } from "react";
import { STAGES } from "@/lib/ats/constants";
import { toast } from "sonner";

export function SettingsSection() {
  const [companyName, setCompanyName] = useState("TalentForge Staffing Co.");
  const [website, setWebsite] = useState("https://talentforge.example");
  const [size, setSize] = useState("51-200");
  const [temperature, setTemperature] = useState(40);
  const [maxTokens, setMaxTokens] = useState(2000);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl">
          <Settings className="h-7 w-7 text-emerald-600 dark:text-emerald-400" aria-hidden />
          Settings
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Configure your ATS workspace: company profile, hiring stages, integrations, AI behavior, and notification preferences.
        </p>
      </div>

      <Tabs defaultValue="company">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="company">
            <Building2 className="mr-1.5 h-3.5 w-3.5" aria-hidden />
            Company
          </TabsTrigger>
          <TabsTrigger value="stages">
            <ListChecks className="mr-1.5 h-3.5 w-3.5" aria-hidden />
            Hiring Stages
          </TabsTrigger>
          <TabsTrigger value="integrations">
            <Plug className="mr-1.5 h-3.5 w-3.5" aria-hidden />
            Integrations
          </TabsTrigger>
          <TabsTrigger value="ai">
            <Sparkles className="mr-1.5 h-3.5 w-3.5" aria-hidden />
            AI
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="mr-1.5 h-3.5 w-3.5" aria-hidden />
            Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Company Profile</CardTitle>
              <CardDescription>Shown on job postings and offer letters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label className="text-xs">Company name</Label>
                  <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Website</Label>
                  <Input value={website} onChange={(e) => setWebsite(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Company size</Label>
                  <Input value={size} onChange={(e) => setSize(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Logo</Label>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-md bg-emerald-500/10 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                      TF
                    </div>
                    <Button variant="outline" size="sm" onClick={() => toast.info("Logo upload is mocked in this demo")}>
                      Upload
                    </Button>
                  </div>
                </div>
              </div>
              <Button onClick={() => toast.success("Company profile saved")}>Save changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stages" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Hiring Stages</CardTitle>
              <CardDescription>
                Drag to reorder. Changes apply to all new pipelines.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {STAGES.map((s, i) => (
                <div
                  key={s.id}
                  className="flex items-center gap-2 rounded-md border border-border bg-muted/30 p-2.5"
                >
                  <span className="text-xs text-muted-foreground">{i + 1}.</span>
                  <span className={`h-2 w-2 rounded-full ${s.dotClass}`} aria-hidden />
                  <span className="flex-1 text-sm font-medium">{s.label}</span>
                  <Badge variant="outline" className="text-[10px]">{s.id}</Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toast.info("Drag to reorder (mocked in this demo)")}
                  >
                    ⋮⋮
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" className="mt-2" onClick={() => toast.info("Add stage (mocked)")}>
                + Add stage
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="mt-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { name: "LinkedIn Recruiter", desc: "Sync candidates and InMail activity", connected: true },
              { name: "Indeed Employer", desc: "Cross-post jobs and import applicants", connected: true },
              { name: "ZipRecruiter", desc: "One-click multi-post to 100+ boards", connected: false },
              { name: "Slack", desc: "Send pipeline alerts to channels", connected: true },
              { name: "Gmail / Google Workspace", desc: "Send email from your domain", connected: false },
              { name: "Google Calendar", desc: "Auto-schedule interviews", connected: false },
            ].map((int) => (
              <Card key={int.name}>
                <CardContent className="flex items-start justify-between gap-2 p-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{int.name}</p>
                    <p className="text-xs text-muted-foreground">{int.desc}</p>
                  </div>
                  {int.connected ? (
                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300">
                      Connected
                    </Badge>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toast.info(`${int.name} connection is mocked in this demo`)}
                    >
                      Connect
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="ai" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="h-4 w-4 text-amber-600" aria-hidden />
                AI Configuration
              </CardTitle>
              <CardDescription>
                All AI features use z-ai-web-dev-sdk (in-house). Zero per-token cost.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs">Model</Label>
                <Input value="zai-inhouse-v1 (zero-token)" readOnly className="mt-1 font-mono text-xs" />
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Only one model available. Custom fine-tunes coming Q3 2026.
                </p>
              </div>
              <div>
                <Label className="text-xs">Temperature: {temperature / 100}</Label>
                <Slider
                  value={[temperature]}
                  onValueChange={(v) => setTemperature(v[0])}
                  min={0}
                  max={100}
                  step={5}
                  className="mt-2"
                />
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Lower = more deterministic, higher = more creative. 0.4 is good default for recruiting tasks.
                </p>
              </div>
              <div>
                <Label className="text-xs">Max tokens per response</Label>
                <Input
                  type="number"
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(Number(e.target.value))}
                  className="mt-1"
                />
              </div>
              <div className="space-y-2">
                <FeatureToggle label="AI Resume Scoring" desc="Auto-score new applications" defaultOn />
                <FeatureToggle label="AI Daily Brief" desc="Generate every morning at 7am" defaultOn />
                <FeatureToggle label="AI Interview Questions" desc="Generate on interview create" />
                <FeatureToggle label="AI Email Drafting" desc="Enable AI email drafts in comms" defaultOn />
                <FeatureToggle label="AI Offer Letters" desc="Auto-draft offer letters in offer stage" />
              </div>
              <Button onClick={() => toast.success("AI settings saved")}>Save AI settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Notification Preferences</CardTitle>
              <CardDescription>Per-event delivery channels</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                "New application received",
                "Application moved to Interview stage",
                "Application moved to Offer stage",
                "Interview scheduled",
                "Interview feedback submitted",
                "Offer accepted",
                "Offer declined",
                "Candidate no-response 5 days",
              ].map((event) => (
                <div
                  key={event}
                  className="flex flex-col gap-2 rounded-md border border-border bg-muted/30 p-2.5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="text-sm font-medium">{event}</span>
                  <div className="flex items-center gap-3">
                    <ChannelToggle label="Email" defaultOn />
                    <ChannelToggle label="Push" />
                    <ChannelToggle label="In-app" defaultOn />
                  </div>
                </div>
              ))}
              <Button className="mt-3" onClick={() => toast.success("Notification preferences saved")}>
                Save preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function FeatureToggle({ label, desc, defaultOn }: { label: string; desc: string; defaultOn?: boolean }) {
  const [on, setOn] = useState(!!defaultOn);
  return (
    <div className="flex items-center justify-between gap-2 rounded-md border border-border p-2.5">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <Switch checked={on} onCheckedChange={setOn} aria-label={label} />
    </div>
  );
}

function ChannelToggle({ label, defaultOn }: { label: string; defaultOn?: boolean }) {
  const [on, setOn] = useState(!!defaultOn);
  return (
    <label className="flex items-center gap-1.5 text-xs">
      <Switch checked={on} onCheckedChange={setOn} aria-label={label} className="scale-75" />
      {label}
    </label>
  );
}
