"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/logo";

export default function SignupPage() {
  const router = useRouter();
  const [role, setRole] = useState<"ATHLETE" | "COACH">("COACH");
  const [form, setForm] = useState({ name: "", email: "", password: "", schoolName: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function set(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, role }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Signup failed.");
        return;
      }
      router.push(role === "COACH" ? "/dashboard/coach" : "/dashboard/athlete");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-[calc(100vh-4rem)] place-items-center bg-chalk-50 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex justify-center">
          <Logo href="/" />
        </div>
        <div className="card p-6 sm:p-8">
          <h1 className="font-display text-2xl font-black tracking-tight text-ink-900">Create your free account</h1>
          <p className="mt-1 text-sm text-chalk-500">No paywalls. Free at launch.</p>

          <div className="mt-5 grid grid-cols-2 gap-2 rounded-xl bg-chalk-100 p-1">
            {(["COACH", "ATHLETE"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`rounded-lg py-2 text-sm font-bold transition-colors ${role === r ? "bg-white text-ink-900 shadow-sm" : "text-chalk-500"}`}
              >
                {r === "COACH" ? "JUCO Coach" : "Athlete"}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="mt-5 space-y-4">
            <div>
              <span className="label">{role === "COACH" ? "Your name" : "Full name"}</span>
              <input required value={form.name} onChange={(e) => set("name", e.target.value)} className="input" placeholder="Alex Morgan" />
            </div>
            {role === "COACH" && (
              <div>
                <span className="label">Your JUCO / school</span>
                <input value={form.schoolName} onChange={(e) => set("schoolName", e.target.value)} className="input" placeholder="Palomar College" />
              </div>
            )}
            <div>
              <span className="label">Email</span>
              <input type="email" required value={form.email} onChange={(e) => set("email", e.target.value)} className="input" placeholder="you@school.edu" />
            </div>
            <div>
              <span className="label">Password</span>
              <input type="password" required value={form.password} onChange={(e) => set("password", e.target.value)} className="input" placeholder="At least 6 characters" />
            </div>
            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
            <button type="submit" disabled={loading} className="btn-primary btn-lg w-full">
              {loading ? "Creating…" : "Create account"}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-chalk-500">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-accent hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
