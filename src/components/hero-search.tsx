"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { SPORTS } from "@/lib/sports";

export function HeroSearch() {
  const router = useRouter();
  const [sport, setSport] = useState("baseball");
  const [position, setPosition] = useState("");
  const [year, setYear] = useState("");

  const positions = useMemo(
    () => SPORTS.find((s) => s.slug === sport)?.positions ?? [],
    [sport]
  );

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (sport) params.set("sport", sport);
    if (position) params.set("position", position);
    if (year) params.set("transferYear", year);
    router.push(`/search?${params.toString()}`);
  }

  return (
    <form
      onSubmit={submit}
      className="grid gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-3 backdrop-blur sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end"
    >
      <Field label="Sport">
        <select
          value={sport}
          onChange={(e) => {
            setSport(e.target.value);
            setPosition("");
          }}
          className="hero-select"
        >
          {SPORTS.map((s) => (
            <option key={s.slug} value={s.slug}>
              {s.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Position">
        <select
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          className="hero-select"
        >
          <option value="">Any position</option>
          {positions.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Transfer Year">
        <select value={year} onChange={(e) => setYear(e.target.value)} className="hero-select">
          <option value="">Any year</option>
          {[2026, 2027, 2028].map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </Field>

      <button type="submit" className="btn-primary btn-lg h-[46px] w-full sm:w-auto">
        Search
      </button>

      <style jsx>{`
        .hero-select {
          height: 46px;
          width: 100%;
          border-radius: 0.6rem;
          border: 1px solid rgba(255, 255, 255, 0.14);
          background-color: rgba(255, 255, 255, 0.96);
          padding: 0 0.9rem;
          font-size: 14px;
          font-weight: 600;
          color: #0f1219;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 0.7rem center;
          background-size: 1rem;
        }
        .hero-select:focus {
          outline: none;
          border-color: #ff5a1f;
        }
      `}</style>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.1em] text-white/60">
        {label}
      </span>
      {children}
    </label>
  );
}
