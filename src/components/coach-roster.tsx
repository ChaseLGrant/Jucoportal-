"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TRANSFER_STATUSES, TRANSFER_STATUS_META } from "@/lib/constants";
import { StatusBadge, VerificationBadge } from "./badges";

export interface RosterAthlete {
  id: string;
  slug: string;
  name: string;
  sportName: string;
  position: string;
  transferStatus: string;
  verification: string;
  gpa: number | null;
}

export function CoachRoster({ athletes }: { athletes: RosterAthlete[] }) {
  const [q, setQ] = useState("");
  const filtered = athletes.filter((a) =>
    `${a.name} ${a.position} ${a.sportName}`.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-chalk-200 px-4 py-3">
        <h2 className="font-display text-sm font-bold uppercase tracking-wide text-ink-900">My Roster</h2>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search roster…"
          className="input h-9 w-48 text-sm"
        />
      </div>
      {filtered.length === 0 ? (
        <p className="px-4 py-10 text-center text-sm text-chalk-500">No athletes yet. Upload a roster to get started.</p>
      ) : (
        <div className="divide-y divide-chalk-100">
          {filtered.map((a) => (
            <RosterRow key={a.id} athlete={a} />
          ))}
        </div>
      )}
    </div>
  );
}

function RosterRow({ athlete }: { athlete: RosterAthlete }) {
  const router = useRouter();
  const [status, setStatus] = useState(athlete.transferStatus);
  const [verification, setVerification] = useState(athlete.verification);
  const [busy, setBusy] = useState(false);

  async function update(patch: Record<string, string>) {
    setBusy(true);
    try {
      await fetch("/api/athletes/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: athlete.id, ...patch }),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  const verified = verification !== "SUBMITTED";

  return (
    <div className={`flex flex-wrap items-center gap-3 px-4 py-3 ${busy ? "opacity-60" : ""}`}>
      <div className="min-w-0 flex-1">
        <Link href={`/athletes/${athlete.slug}`} className="font-bold text-ink-900 hover:text-accent">
          {athlete.name}
        </Link>
        <p className="text-xs text-chalk-500">
          {athlete.position || athlete.sportName} • {athlete.sportName}
          {athlete.gpa ? ` • ${athlete.gpa.toFixed(2)} GPA` : ""}
        </p>
      </div>

      <div className="hidden sm:block"><StatusBadge status={status} size="sm" /></div>

      <select
        value={status}
        onChange={(e) => { setStatus(e.target.value); update({ transferStatus: e.target.value }); }}
        className="select h-9 w-44 text-sm"
      >
        {TRANSFER_STATUSES.map((s) => (
          <option key={s} value={s}>{TRANSFER_STATUS_META[s].label}</option>
        ))}
      </select>

      <button
        onClick={() => {
          const next = verified ? "SUBMITTED" : "COACH_VERIFIED";
          setVerification(next);
          update({ verification: next });
        }}
        className={`btn-sm ${verified ? "btn-outline" : "btn-dark"}`}
      >
        {verified ? <VerificationBadge level={verification} /> : "Verify"}
      </button>
    </div>
  );
}
