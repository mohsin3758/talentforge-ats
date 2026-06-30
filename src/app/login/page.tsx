"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Hammer, Loader2, Mail, Lock, User } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "register") {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error ?? "Registration failed");
        }
        toast.success("Account created! Logging you in...");
      }
      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) throw new Error("Invalid email or password");
      toast.success(mode === "register" ? "Welcome to TalentForge!" : "Welcome back!");
      router.push(callbackUrl);
      router.refresh();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 px-4 dark:from-slate-950 dark:to-slate-900">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg">
            <Hammer className="h-6 w-6" aria-hidden />
          </div>
          <CardTitle className="text-2xl">{mode === "login" ? "Welcome back" : "Create account"}</CardTitle>
          <CardDescription>
            {mode === "login" ? "Sign in to your TalentForge ATS account" : "Get started with TalentForge ATS"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                  <Input id="name" type="text" placeholder="Jane Doe" value={name} onChange={(e) => setName(e.target.value)} className="pl-9" required />
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                <Input id="password" type="password" placeholder={mode === "register" ? "At least 8 characters" : "Your password"} value={password} onChange={(e) => setPassword(e.target.value)} className="pl-9" required minLength={mode === "register" ? 8 : undefined} />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden /> : null}
              {mode === "login" ? "Sign in" : "Create account"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            {mode === "login" ? (
              <>Don&apos;t have an account? <button type="button" onClick={() => setMode("register")} className="font-medium text-emerald-600 underline-offset-4 hover:underline dark:text-emerald-400">Sign up</button></>
            ) : (
              <>Already have an account? <button type="button" onClick={() => setMode("login")} className="font-medium text-emerald-600 underline-offset-4 hover:underline dark:text-emerald-400">Sign in</button></>
            )}
          </div>
          <div className="mt-6 rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">
            <p className="font-semibold">Demo credentials:</p>
            <p>Email: admin@talentforge.com</p>
            <p>Password: Admin123!</p>
          </div>
          <div className="mt-4 text-center">
            <Link href="/" className="text-xs text-muted-foreground underline-offset-4 hover:underline">← Back to app</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>}>
      <LoginForm />
    </Suspense>
  );
}
