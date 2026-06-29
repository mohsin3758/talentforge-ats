"use client";

import { useTheme } from "next-themes";
import { useSession, signOut } from "next-auth/react";
import { useUIStore } from "@/lib/ats/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Search,
  Sun,
  Moon,
  Plus,
  Sparkles,
  Menu,
  Hammer,
  LogOut,
  User as UserIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export function Topbar() {
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();
  const setSection = useUIStore((s) => s.setSection);
  const setSelectedJobId = useUIStore((s) => s.setSelectedJobId);

  return (
    <header
      className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/70"
      role="banner"
    >
      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm">
          <Hammer className="h-5 w-5" aria-hidden />
        </div>
        <div className="hidden sm:block">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold tracking-tight">TalentForge ATS</span>
            <span className="rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700 dark:bg-amber-950 dark:text-amber-300">
              Zero-Token AI
            </span>
          </div>
          <div className="text-[11px] text-muted-foreground">
            Powered by z-ai-web-dev-sdk · Benchmarked vs Top 100 ATS
          </div>
        </div>
      </div>

      <div className="relative ml-2 hidden flex-1 max-w-md md:block">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          type="search"
          placeholder="Search candidates, jobs, applications…"
          className="pl-9"
          aria-label="Global search"
          onChange={(e) => {
            const v = e.target.value;
            if (v.length > 2) {
              setSection("candidates");
            }
          }}
        />
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle dark mode"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" aria-hidden />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" aria-hidden />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="hidden sm:flex"
          onClick={() => {
            setSection("ai-tools");
            toast.info("Opened AI Tools — try generating a JD or scoring a resume!");
          }}
        >
          <Sparkles className="mr-1.5 h-4 w-4 text-amber-600 dark:text-amber-400" aria-hidden />
          AI Tools
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm">
              <Plus className="mr-1.5 h-4 w-4" aria-hidden />
              <span className="hidden sm:inline">New</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Create new</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                setSelectedJobId(null);
                setSection("jobs");
              }}
            >
              <Plus className="mr-2 h-4 w-4" aria-hidden /> Job posting
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSection("candidates")}>
              <Plus className="mr-2 h-4 w-4" aria-hidden /> Candidate
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSection("automations")}>
              <Plus className="mr-2 h-4 w-4" aria-hidden /> Automation rule
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setSection("ai-tools")}>
              <Sparkles className="mr-2 h-4 w-4 text-amber-600" aria-hidden /> Run AI tool
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Open menu"
          onClick={() => toast.info("Use the sidebar to navigate sections.")}
        >
          <Menu className="h-4 w-4" aria-hidden />
        </Button>

        {/* User menu */}
        {session?.user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="bg-emerald-500/10 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                    {session.user.name?.[0]?.toUpperCase() ?? session.user.email?.[0]?.toUpperCase() ?? "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden text-sm font-medium sm:inline">
                  {session.user.name ?? session.user.email}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{session.user.name ?? "User"}</span>
                  <span className="text-xs text-muted-foreground">{session.user.email}</span>
                  {("role" in session.user) && (
                    <span className="mt-1 text-xs capitalize text-emerald-600 dark:text-emerald-400">
                      {(session.user as { role?: string }).role}
                    </span>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  signOut({ callbackUrl: "/login" });
                  toast.info("Signed out");
                }}
              >
                <LogOut className="mr-2 h-4 w-4" aria-hidden />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => (window.location.href = "/login")}
          >
            <UserIcon className="mr-1.5 h-4 w-4" aria-hidden />
            Sign in
          </Button>
        )}
      </div>
    </header>
  );
}
