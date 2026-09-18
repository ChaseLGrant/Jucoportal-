"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/logo";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Login failed.");
        return;
      }
      const dest = data.role === "ADMIN" ? "/admin" : data.role === "COACH" ? "/dashboard/coach" : "/dashboard/athlete";
      router.push(dest);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  function fillDemo(kind: "admin" | "coach" | "athlete") {
    setEmail(`${kind}@jucoportal.com`);
    setPassword("password123");
  }

  return (
    <div className="grid min-h-[calc(100vh-4rem)] place-items-center bg-chalk-50 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex justify-center">
          <Logo href="/" />
        </div>
        <div className="card p-6 sm:p-8">
          <h1 className="font-display text-2xl font-black tracking-tight text-ink-900">Log in</h1>
          <p className="mt-1 text-sm text-chalk-500">Access your dashboard.</p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <span className="label">Email</span>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="you@school.edu" />
            </div>
            <div>
              <span className="label">Password</span>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="input" placeholder="••••••••" />
            </div>
            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
            <button type="submit" disabled={loading} className="btn-primary btn-lg w-full">
              {loading ? "Signing in…" : "Log in"}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-chalk-500">
            No account?{" "}
            <Link href="/signup" className="font-semibold text-accent hover:underline">
              Create one free
            </Link>
          </p>
        </div>

        <div className="mt-4 rounded-xl border border-chalk-200 bg-white p-4">
          <p className="text-[11px] font-bold uppercase tracking-wide text-chalk-400">Demo accounts (password123)</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button onClick={() => fillDemo("admin")} className="btn-outline btn-sm">Admin</button>
            <button onClick={() => fillDemo("coach")} className="btn-outline btn-sm">JUCO Coach</button>
            <button onClick={() => fillDemo("athlete")} className="btn-outline btn-sm">Athlete</button>
          </div>
        </div>
      </div>
    </div>
  );
}
