"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Settings,
  Building2,
  ListChecks,
  Plug,
  Sparkles,
  Bell,
  Upload,
  GripVertical,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Check,
  Loader2,
} from "lucide-react";
import { useState, useRef, useSyncExternalStore } from "react";
import { STAGES } from "@/lib/ats/constants";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Local persistence helpers (localStorage-backed user preferences)    */
/* ------------------------------------------------------------------ */
const STORAGE_KEY = "talentforge:settings";

interface SavedSettings {
  company: { name: string; website: string; size: string; logo: string | null };
  ai: { temperature: number; maxTokens: number; features: Record<string, boolean> };
  notifications: Record<string, { email: boolean; push: boolean; inApp: boolean }>;
  stages: { id: string; label: string }[];
  integrations: Record<string, boolean>;
}

const DEFAULT_SETTINGS: SavedSettings = {
  company: {
    name: "TalentForge Staffing Co.",
    website: "https://talentforge.example",
    size: "51-200",
    logo: null,
  },
  ai: {
    temperature: 40,
    maxTokens: 2000,
    features: {
      "AI Resume Scoring": true,
      "AI Daily Brief": true,
      "AI Interview Questions": false,
      "AI Email Drafting": true,
      "AI Offer Letters": false,
    },
  },
  notifications: {},
  stages: STAGES.map((s) => ({ id: s.id, label: s.label })),
  integrations: {
    "LinkedIn Recruiter": true,
    "Indeed Employer": true,
    "ZipRecruiter": false,
    "Slack": true,
    "Gmail / Google Workspace": false,
    "Google Calendar": false,
  },
};

function loadSettings(): SavedSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<SavedSettings>;
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      company: { ...DEFAULT_SETTINGS.company, ...parsed.company },
      ai: {
        ...DEFAULT_SETTINGS.ai,
        ...parsed.ai,
        features: { ...DEFAULT_SETTINGS.ai.features, ...parsed.ai?.features },
      },
      notifications: { ...parsed.notifications },
      stages: parsed.stages?.length ? parsed.stages : DEFAULT_SETTINGS.stages,
      integrations: { ...DEFAULT_SETTINGS.integrations, ...parsed.integrations },
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function saveSettings(s: SavedSettings) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

// In-memory cache so useSyncExternalStore returns a stable reference between saves
let cachedSettings: SavedSettings | null = null;

function readSettingsCache(): SavedSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  if (cachedSettings) return cachedSettings;
  cachedSettings = loadSettings();
  return cachedSettings;
}

function subscribeSettings(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = () => {
    cachedSettings = loadSettings();
    callback();
  };
  window.addEventListener("talentforge:settings-changed", handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener("talentforge:settings-changed", handler);
    window.removeEventListener("storage", handler);
  };
}

const COMPANY_SIZES = ["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"];

const NOTIFICATION_EVENTS = [
  "New application received",
  "Application moved to Interview stage",
  "Application moved to Offer stage",
  "Interview scheduled",
  "Interview feedback submitted",
  "Offer accepted",
  "Offer declined",
  "Candidate no-response 5 days",
];

const INTEGRATIONS = [
  { name: "LinkedIn Recruiter", desc: "Sync candidates and InMail activity" },
  { name: "Indeed Employer", desc: "Cross-post jobs and import applicants" },
  { name: "ZipRecruiter", desc: "One-click multi-post to 100+ boards" },
  { name: "Slack", desc: "Send pipeline alerts to channels" },
  { name: "Gmail / Google Workspace", desc: "Send email from your domain" },
  { name: "Google Calendar", desc: "Auto-schedule interviews" },
];

export function SettingsSection() {
  // useSyncExternalStore gives us SSR-safe reads of localStorage with no
  // "setState in effect" anti-pattern. We subscribe to a custom event we
  // dispatch on every save.
  const settings = useSyncExternalStore(
    subscribeSettings,
    readSettingsCache,
    () => DEFAULT_SETTINGS,
  );
  const loaded = typeof window !== "undefined";

  function update<K extends keyof SavedSettings>(key: K, value: SavedSettings[K]) {
    const next = { ...readSettingsCache(), [key]: value };
    saveSettings(next);
    window.dispatchEvent(new Event("talentforge:settings-changed"));
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl">
          <Settings className="h-7 w-7 text-emerald-600 dark:text-emerald-400" aria-hidden />
          Settings
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Configure your ATS workspace: company profile, hiring stages, integrations, AI behavior, and notification preferences. All changes are saved locally to your browser.
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
          {loaded && (
            <CompanyTab
              key={JSON.stringify(settings.company)}
              company={settings.company}
              onUpdate={(company) => update("company", company)}
            />
          )}
        </TabsContent>

        <TabsContent value="stages" className="mt-4">
          <StagesTab
            stages={settings.stages}
            onUpdate={(stages) => update("stages", stages)}
          />
        </TabsContent>

        <TabsContent value="integrations" className="mt-4">
          <IntegrationsTab
            integrations={settings.integrations}
            onUpdate={(integrations) => update("integrations", integrations)}
          />
        </TabsContent>

        <TabsContent value="ai" className="mt-4">
          <AITab
            settings={settings}
            onUpdate={(ai) => update("ai", ai)}
          />
        </TabsContent>

        <TabsContent value="notifications" className="mt-4">
          <NotificationsTab
            notifications={settings.notifications}
            onUpdate={(notifications) => update("notifications", notifications)}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Company Tab                                                          */
/* ------------------------------------------------------------------ */
function CompanyTab({
  company,
  onUpdate,
}: {
  company: SavedSettings["company"];
  onUpdate: (company: SavedSettings["company"]) => void;
}) {
  const [name, setName] = useState(company.name);
  const [website, setWebsite] = useState(company.website);
  const [size, setSize] = useState(company.size);
  const [logo, setLogo] = useState<string | null>(company.logo);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500_000) {
      toast.error("Logo must be under 500KB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setLogo(dataUrl);
      toast.success("Logo preview updated — click Save to persist");
    };
    reader.readAsDataURL(file);
  }

  function handleSave() {
    onUpdate({ name, website, size, logo });
    toast.success("Company profile saved");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Company Profile</CardTitle>
        <CardDescription>Shown on job postings and offer letters</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label className="text-xs" htmlFor="company-name">Company name</Label>
            <Input id="company-name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label className="text-xs" htmlFor="company-website">Website</Label>
            <Input id="company-website" value={website} onChange={(e) => setWebsite(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label className="text-xs" htmlFor="company-size">Company size</Label>
            <Select value={size} onValueChange={setSize}>
              <SelectTrigger id="company-size" className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COMPANY_SIZES.map((s) => (
                  <SelectItem key={s} value={s}>{s} employees</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Logo</Label>
            <div className="mt-1 flex items-center gap-2">
              {logo ? (
                <img
                  src={logo}
                  alt="Company logo"
                  className="h-9 w-9 rounded-md border border-border object-cover"
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-emerald-500/10 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                  {name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/svg+xml"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                <Upload className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                Upload
              </Button>
              {logo && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setLogo(null);
                    toast.info("Logo removed — click Save to persist");
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden />
                </Button>
              )}
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">PNG/JPG/SVG, max 500KB</p>
          </div>
        </div>
        <Button onClick={handleSave}>Save changes</Button>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Hiring Stages Tab — working add / remove / reorder                  */
/* ------------------------------------------------------------------ */
function StagesTab({
  stages,
  onUpdate,
}: {
  stages: { id: string; label: string }[];
  onUpdate: (stages: { id: string; label: string }[]) => void;
}) {
  const [newLabel, setNewLabel] = useState("");
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  function addStage() {
    const label = newLabel.trim();
    if (!label) {
      toast.error("Stage label cannot be empty");
      return;
    }
    const id = label.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
    if (stages.some((s) => s.id === id)) {
      toast.error(`Stage "${label}" already exists`);
      return;
    }
    onUpdate([...stages, { id, label }]);
    setNewLabel("");
    toast.success(`Stage "${label}" added`);
  }

  function removeStage(idx: number) {
    const stage = stages[idx];
    onUpdate(stages.filter((_, i) => i !== idx));
    toast.success(`Stage "${stage.label}" removed`);
  }

  function moveStage(idx: number, direction: -1 | 1) {
    const newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= stages.length) return;
    const next = [...stages];
    [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
    onUpdate(next);
  }

  function handleDragStart(idx: number) {
    setDragIndex(idx);
  }
  function handleDragOver(e: React.DragEvent, idx: number) {
    e.preventDefault();
    if (dragIndex === null || dragIndex === idx) return;
    const next = [...stages];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(idx, 0, moved);
    setDragIndex(idx);
    onUpdate(next);
  }
  function handleDragEnd() {
    setDragIndex(null);
    toast.success("Stage order saved");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Hiring Stages</CardTitle>
        <CardDescription>
          Drag to reorder, or use the arrow buttons. Changes apply to all new pipelines and persist locally.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <ul className="space-y-2" role="list">
          {stages.map((s, i) => (
            <li
              key={s.id}
              draggable
              onDragStart={() => handleDragStart(i)}
              onDragOver={(e) => handleDragOver(e, i)}
              onDragEnd={handleDragEnd}
              className={cn(
                "flex items-center gap-2 rounded-md border border-border bg-muted/30 p-2.5 transition-opacity",
                dragIndex === i && "opacity-50",
              )}
            >
              <GripVertical
                className="h-4 w-4 cursor-grab text-muted-foreground active:cursor-grabbing"
                aria-label="Drag to reorder"
              />
              <span className="w-6 text-xs text-muted-foreground">{i + 1}.</span>
              <span className="flex-1 text-sm font-medium">{s.label}</span>
              <Badge variant="outline" className="text-[10px] font-mono">{s.id}</Badge>
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => moveStage(i, -1)}
                  disabled={i === 0}
                  aria-label={`Move ${s.label} up`}
                >
                  <ArrowUp className="h-3.5 w-3.5" aria-hidden />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => moveStage(i, 1)}
                  disabled={i === stages.length - 1}
                  aria-label={`Move ${s.label} down`}
                >
                  <ArrowDown className="h-3.5 w-3.5" aria-hidden />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-rose-500 hover:text-rose-600"
                  onClick={() => removeStage(i)}
                  aria-label={`Remove ${s.label}`}
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden />
                </Button>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-3 flex items-center gap-2 rounded-md border border-dashed border-border p-2.5">
          <Plus className="h-4 w-4 text-muted-foreground" aria-hidden />
          <Input
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addStage();
              }
            }}
            placeholder="New stage name (e.g. Reference Check)"
            className="h-8 border-0 shadow-none focus-visible:ring-0"
          />
          <Button variant="outline" size="sm" onClick={addStage} disabled={!newLabel.trim()}>
            Add stage
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Integrations Tab — working Connect/Disconnect toggle                */
/* ------------------------------------------------------------------ */
function IntegrationsTab({
  integrations,
  onUpdate,
}: {
  integrations: Record<string, boolean>;
  onUpdate: (integrations: Record<string, boolean>) => void;
}) {
  function toggle(name: string) {
    const next = { ...integrations, [name]: !integrations[name] };
    onUpdate(next);
    toast.success(`${name} ${next[name] ? "connected" : "disconnected"}`);
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {INTEGRATIONS.map((int) => {
        const connected = integrations[int.name] ?? false;
        return (
          <Card key={int.name}>
            <CardContent className="flex items-start justify-between gap-2 p-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{int.name}</p>
                <p className="text-xs text-muted-foreground">{int.desc}</p>
              </div>
              {connected ? (
                <div className="flex flex-col items-end gap-1">
                  <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300">
                    <Check className="mr-1 h-3 w-3" aria-hidden />
                    Connected
                  </Badge>
                  <Button variant="ghost" size="sm" onClick={() => toggle(int.name)}>
                    Disconnect
                  </Button>
                </div>
              ) : (
                <Button variant="outline" size="sm" onClick={() => toggle(int.name)}>
                  <Plug className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                  Connect
                </Button>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* AI Tab — temperature, maxTokens, feature toggles, all persisted     */
/* ------------------------------------------------------------------ */
function AITab({
  settings,
  onUpdate,
}: {
  settings: SavedSettings;
  onUpdate: (ai: SavedSettings["ai"]) => void;
}) {
  const ai = settings.ai;
  const [draft, setDraft] = useState(ai);
  const [saving, setSaving] = useState(false);

  const dirty =
    draft.temperature !== ai.temperature ||
    draft.maxTokens !== ai.maxTokens ||
    JSON.stringify(draft.features) !== JSON.stringify(ai.features);

  function syncFromStore() {
    setDraft(ai);
  }

  function save() {
    setSaving(true);
    onUpdate({
      temperature: draft.temperature,
      maxTokens: draft.maxTokens,
      features: draft.features,
    });
    setTimeout(() => {
      setSaving(false);
      toast.success("AI settings saved");
    }, 250);
  }

  function toggleFeature(label: string) {
    setDraft((prev) => ({
      ...prev,
      features: { ...prev.features, [label]: !prev.features[label] },
    }));
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-4 w-4 text-amber-600" aria-hidden />
          AI Configuration
        </CardTitle>
        <CardDescription>
          All AI features use z-ai-web-dev-sdk (in-house). Zero per-token cost. Settings persist locally.
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
          <Label className="text-xs">Temperature: {(draft.temperature / 100).toFixed(2)}</Label>
          <Slider
            value={[draft.temperature]}
            onValueChange={(v) => setDraft((prev) => ({ ...prev, temperature: v[0] }))}
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
            value={draft.maxTokens}
            onChange={(e) =>
              setDraft((prev) => ({ ...prev, maxTokens: Number(e.target.value) || 0 }))
            }
            className="mt-1"
          />
        </div>
        <div className="space-y-2">
          {Object.entries(draft.features).map(([label, on]) => (
            <div
              key={label}
              className="flex items-center justify-between gap-2 rounded-md border border-border p-2.5"
            >
              <div>
                <p className="text-sm font-medium">{label}</p>
              </div>
              <Switch
                checked={on}
                onCheckedChange={() => toggleFeature(label)}
                aria-label={label}
              />
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={save} disabled={!dirty || saving}>
            {saving ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Check className="mr-1.5 h-4 w-4" aria-hidden />
            )}
            Save AI settings
          </Button>
          {dirty && (
            <button
              type="button"
              onClick={syncFromStore}
              className="text-xs text-muted-foreground underline-offset-4 hover:underline"
            >
              Reset
            </button>
          )}
          {dirty && <span className="text-xs text-amber-600 dark:text-amber-400">Unsaved changes</span>}
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Notifications Tab — per-event channel toggles, persisted            */
/* ------------------------------------------------------------------ */
function NotificationsTab({
  notifications,
  onUpdate,
}: {
  notifications: Record<string, { email: boolean; push: boolean; inApp: boolean }>;
  onUpdate: (notifications: Record<string, { email: boolean; push: boolean; inApp: boolean }>) => void;
}) {
  function getChannels(event: string) {
    return notifications[event] ?? { email: true, push: false, inApp: true };
  }
  function toggleChannel(event: string, channel: "email" | "push" | "inApp") {
    const current = getChannels(event);
    const next = { ...current, [channel]: !current[channel] };
    onUpdate({ ...notifications, [event]: next });
  }
  function saveAll() {
    toast.success("Notification preferences saved");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Notification Preferences</CardTitle>
        <CardDescription>Per-event delivery channels. Changes save automatically.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {NOTIFICATION_EVENTS.map((event) => {
          const channels = getChannels(event);
          return (
            <div
              key={event}
              className="flex flex-col gap-2 rounded-md border border-border bg-muted/30 p-2.5 sm:flex-row sm:items-center sm:justify-between"
            >
              <span className="text-sm font-medium">{event}</span>
              <div className="flex items-center gap-3">
                <ChannelToggle
                  label="Email"
                  checked={channels.email}
                  onToggle={() => toggleChannel(event, "email")}
                />
                <ChannelToggle
                  label="Push"
                  checked={channels.push}
                  onToggle={() => toggleChannel(event, "push")}
                />
                <ChannelToggle
                  label="In-app"
                  checked={channels.inApp}
                  onToggle={() => toggleChannel(event, "inApp")}
                />
              </div>
            </div>
          );
        })}
        <Button className="mt-3" onClick={saveAll}>
          Save preferences
        </Button>
      </CardContent>
    </Card>
  );
}

function ChannelToggle({
  label,
  checked,
  onToggle,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <label className="flex items-center gap-1.5 text-xs">
      <Switch checked={checked} onCheckedChange={onToggle} aria-label={label} className="scale-75" />
      {label}
    </label>
  );
}
