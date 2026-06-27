import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryProvider } from "@/components/query-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TalentForge ATS — Zero-Token AI Recruiting Platform",
  description:
    "Production-grade Applicant Tracking System powered by zero-token in-house AI. Benchmarked feature-by-feature against the top 100 ATS platforms.",
  keywords: [
    "ATS", "Recruiting", "AI", "Zero-Token AI", "Applicant Tracking System",
    "TalentForge", "Greenhouse", "Workday", "Lever",
  ],
  authors: [{ name: "TalentForge" }],
  icons: { icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg" },
  openGraph: {
    title: "TalentForge ATS — Zero-Token AI",
    description: "Production-grade ATS powered by zero-token in-house AI.",
    siteName: "TalentForge",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>{children}</QueryProvider>
          <Toaster position="top-right" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
