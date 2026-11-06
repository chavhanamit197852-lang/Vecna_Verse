"use client";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useState } from "react";

const DEMO = [
  { label: "Admin",      email: "admin@eventverse.local",     pw: "EventVerse@123" },
  { label: "Club Admin", email: "clubadmin@eventverse.local", pw: "EventVerse@123" },
  { label: "User",       email: "user@eventverse.local",      pw: "EventVerse@123" },
];

export default function LoginPage() {
  const [email, setEmail]               = useState("");
  const [password, setPassword]         = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock]         = useState(false);
  const [err, setErr]                   = useState(null);
  const [loading, setLoading]           = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    if (res?.error) {
      setErr("Invalid credentials. Try a demo account below.");
      setLoading(false);
      return;
    }
    const session = await fetch("/api/auth/session").then((r) => r.json());
    const role = session?.user?.role;
    window.location.href =
      role === "ADMIN"        ? "/admin/analytics"
      : role === "CLUB_ADMIN" ? "/club/analytics"
      : "/dashboard";
  }

  const fillDemo = (d) => { setEmail(d.email); setPassword(d.pw); setErr(null); };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#09090b] text-white">

      {/* ── Subtle yellow grid ── */}
    

      {/* ── Corner glows ── */}

      
        <main className="flex min-h-screen items-center justify-center p-6 lg:p-12">
          <div className="relative w-full max-w-md">

            {/* Card glow */}
            <div aria-hidden className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-yellow-400/10 blur-3xl" />

            <div className="relative rounded-3xl border border-white/10 bg-black/50 p-8 shadow-2xl backdrop-blur-xl">
              {/* Top accent bar */}
              <div aria-hidden className="absolute inset-x-0 top-0 h-[3px] rounded-t-3xl bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500" />

              <header className="mb-8 mt-2">
                <p className="mb-2 text-[10px] font-black uppercase tracking-[0.3em] text-yellow-400">
                  // Welcome back
                </p>
                <h2 className="font-display text-3xl font-black text-white">
                  Sign in to continue.
                </h2>
                <p className="mt-2 text-sm text-zinc-500">
                  Use your campus credentials, or grab a demo account below.
                </p>
              </header>

              <form onSubmit={submit} className="space-y-4">

                {/* Email */}
                <div>
                  <label htmlFor="login-email" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Email
                  </label>
                  <div className="group relative">
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-600 transition-colors group-focus-within:text-yellow-400">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <rect x="2" y="4" width="20" height="16" rx="2" />
                        <path d="m2 7 10 6 10-6" />
                      </svg>
                    </span>
                    <input
                      id="login-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@campus.edu"
                      className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-3 pl-11 pr-4 text-sm text-white placeholder-zinc-600 outline-none transition-all focus:border-yellow-400/60 focus:bg-yellow-400/[0.03] focus:ring-2 focus:ring-yellow-400/20"
                      autoComplete="email"
                      inputMode="email"
                      spellCheck={false}
                      autoCapitalize="none"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="mb-1.5 flex items-baseline justify-between">
                    <label htmlFor="login-password" className="block text-xs font-bold uppercase tracking-wider text-zinc-500">
                      Password
                    </label>
                    <Link href="/forgot-password" tabIndex={-1} className="text-[11px] font-semibold text-zinc-500 transition-colors hover:text-yellow-400">
                      Forgot?
                    </Link>
                  </div>
                  <div className="group relative">
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-600 transition-colors group-focus-within:text-yellow-400">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <rect x="3" y="11" width="18" height="11" rx="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </span>
                    <input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={(e) => setCapsLock(e.getModifierState?.("CapsLock") ?? false)}
                      onKeyUp={(e) => setCapsLock(e.getModifierState?.("CapsLock") ?? false)}
                      onBlur={() => setCapsLock(false)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-3 pl-11 pr-12 text-sm text-white placeholder-zinc-600 outline-none transition-all focus:border-yellow-400/60 focus:bg-yellow-400/[0.03] focus:ring-2 focus:ring-yellow-400/20"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      tabIndex={-1}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      aria-pressed={showPassword}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-600 transition-colors hover:text-yellow-400 focus:text-yellow-400 focus:outline-none"
                    >
                      {showPassword ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                          <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                          <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                          <line x1="2" y1="2" x2="22" y2="22" />
                        </svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {capsLock && (
                    <p role="status" aria-live="polite" className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-yellow-400">
                      <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-yellow-400" />
                      Caps Lock is on
                    </p>
                  )}
                </div>

                {err && (
                  <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-400">
                    ⚠ {err}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full overflow-hidden rounded-xl bg-yellow-400 py-3.5 text-sm font-bold text-black transition-all hover:bg-yellow-300 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {loading ? "Signing in…" : "Sign in"}
                    {!loading && <span className="transition-transform group-hover:translate-x-1">→</span>}
                  </span>
                </button>
              </form>

              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600">or continue with</span>
                <div className="h-px flex-1 bg-white/10" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => signIn("google")}
                  className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] py-3 text-sm font-semibold text-white transition-all hover:border-yellow-400/40 hover:bg-yellow-400/5"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Google
                </button>
                <button
                  type="button"
                  onClick={() => signIn("github")}
                  className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] py-3 text-sm font-semibold text-white transition-all hover:border-yellow-400/40 hover:bg-yellow-400/5"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                  </svg>
                  GitHub
                </button>
              </div>

          

              <p className="mt-6 text-center text-xs text-zinc-600">
                New to EventVerse?{" "}
                <Link href="/register" className="font-bold text-yellow-400 transition-colors hover:text-yellow-300">
                  Create an account
                </Link>
              </p>
            </div>

            <div className="mt-6 text-center">
              <Link href="/" className="text-xs font-semibold text-zinc-500 transition-colors hover:text-yellow-400">
                ← Back to home
              </Link>
            </div>
          </div>
        </main>
     
    </div>
  );
}