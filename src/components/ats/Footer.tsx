import { Hammer, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer
      role="contentinfo"
      className="mt-auto border-t border-border bg-background px-4 py-3 text-xs text-muted-foreground"
    >
      <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
        <div className="flex items-center gap-2">
          <Hammer className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden />
          <span>© 2026 TalentForge ATS · Powered by Zero-Token AI · Benchmarked vs Top 100 ATS</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span>Built with</span>
          <Heart className="h-3 w-3 fill-rose-500 text-rose-500" aria-hidden />
          <span>using Next.js 16, Prisma, and z-ai-web-dev-sdk</span>
        </div>
      </div>
    </footer>
  );
}
