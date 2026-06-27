"use client";

import { useUIStore, type Section } from "@/lib/ats/store";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Briefcase,
  KanbanSquare,
  Users,
  Sparkles,
  Zap,
  BarChart3,
  Scale,
  Settings,
  ChevronLeft,
  Hammer,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const NAV: { id: Section; label: string; icon: React.ElementType; badge?: string }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "jobs", label: "Jobs", icon: Briefcase },
  { id: "pipeline", label: "Pipeline", icon: KanbanSquare },
  { id: "candidates", label: "Candidates", icon: Users },
  { id: "ai-tools", label: "AI Tools", icon: Sparkles, badge: "0-token" },
  { id: "automations", label: "Automations", icon: Zap },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "ats-compare", label: "ATS Compare", icon: Scale },
  { id: "settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const section = useUIStore((s) => s.section);
  const setSection = useUIStore((s) => s.setSection);
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);

  return (
    <aside
      aria-label="Primary navigation"
      className={cn(
        "sticky top-16 self-start shrink-0 border-r border-border bg-sidebar text-sidebar-foreground transition-[width] duration-200",
        collapsed ? "w-[64px]" : "w-[244px]",
      )}
      style={{ height: "calc(100vh - 4rem)" }}
    >
      <nav className="flex flex-col gap-1 p-3" aria-label="ATS sections">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = section === item.id;
          return (
            <button
              key={item.id}
              type="button"
              aria-current={active ? "page" : undefined}
              onClick={() => setSection(item.id)}
              className={cn(
                "group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                active
                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                collapsed && "justify-center px-2",
              )}
              title={collapsed ? item.label : undefined}
            >
              {active && (
                <span
                  aria-hidden
                  className="absolute left-0 top-1/2 h-7 w-[3px] -translate-y-1/2 rounded-r bg-emerald-500"
                />
              )}
              <Icon className="h-4 w-4 shrink-0" aria-hidden />
              {!collapsed && <span className="flex-1 text-left">{item.label}</span>}
              {!collapsed && item.badge && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 border-t border-border p-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className={cn("w-full justify-start text-muted-foreground", collapsed && "justify-center px-2")}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft
            className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")}
            aria-hidden
          />
          {!collapsed && <span className="ml-2">Collapse</span>}
        </Button>
      </div>

      <div className="pointer-events-none absolute -bottom-10 left-0 right-0 flex items-center justify-center gap-1 text-[10px] text-muted-foreground/60">
        <Hammer className="h-3 w-3" aria-hidden />
        {!collapsed && <span>v1.0.0</span>}
      </div>
    </aside>
  );
}
