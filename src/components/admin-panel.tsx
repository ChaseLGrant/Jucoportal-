"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { StatusBadge, VerificationBadge } from "./badges";
import { TRANSFER_STATUS_META } from "@/lib/constants";

interface AdminData {
  stats: Record<string, number>;
  byStatus: { status: string; count: number }[];
  bySport: { name: string; count: number }[];
  athletes: { id: string; slug: string; name: string; sportName: string; schoolName: string; verification: string; transferStatus: string; approved: boolean; published: boolean }[];
  reports: { id: string; reason: string; details: string; athleteName: string; athleteSlug: string; createdAt: string }[];
  coaches: { id: string; name: string; email: string; school: string; verified: boolean }[];
  sports: { id: string; name: string; slug: string; active: boolean; fields: number; athletes: number }[];
  uploads: { id: string; filename: string; coach: string; rowsTotal: number; rowsReady: number; rowsError: number; createdAt: string }[];
}

const TABS = ["Overview", "Profiles", "Reports", "Coaches", "Sports", "Uploads"] as const;
type Tab = (typeof TABS)[number];

export function AdminPanel({ data, adminName }: { data: AdminData; adminName: string }) {
  const [tab, setTab] = useState<Tab>("Overview");
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function act(entity: string, id: string, action: string, value?: unknown) {
    setBusy(id + action);
    try {
      await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entity, id, action, value }),
      });
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  const s = data.stats;

  return (
    <div className="bg-chalk-50 min-h-[calc(100vh-4rem)]">
      <div className="bg-ink-950 text-white">
        <div className="container-wide py-8">
          <p className="eyebrow">Admin</p>
          <h1 className="mt-1 font-display text-3xl font-black tracking-tight">Portal Control Center</h1>
          <p className="mt-1 text-white/60">Signed in as {adminName}</p>
        </div>
      </div>

      <div className="container-wide py-6">
        <div className="mb-6 flex gap-1 overflow-x-auto border-b border-chalk-200">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
                tab === t ? "border-accent text-ink-900" : "border-transparent text-chalk-400 hover:text-ink-700"
              }`}
            >
              {t}
              {t === "Reports" && s.openReports > 0 && (
                <span className="ml-1.5 rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-600">{s.openReports}</span>
              )}
            </button>
          ))}
        </div>

        {tab === "Overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              <Metric value={s.totalAthletes} label="Total Athletes" />
              <Metric value={s.published} label="Published" />
              <Metric value={s.pending} label="Pending Approval" tone={s.pending ? "amber" : undefined} />
              <Metric value={s.verified} label="Verified" tone="green" />
              <Metric value={s.portalVerified} label="Portal Verified" />
              <Metric value={s.schools} label="Schools" />
              <Metric value={s.coaches} label="Coaches" />
              <Metric value={s.verifiedCoaches} label="Verified Coaches" />
              <Metric value={s.openReports} label="Open Reports" tone={s.openReports ? "red" : undefined} />
              <Metric value={s.uploadsCount} label="Roster Uploads" />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <Panel title="Athletes by status">
                <div className="space-y-2">
                  {data.byStatus.map((row) => {
                    const meta = TRANSFER_STATUS_META[row.status as keyof typeof TRANSFER_STATUS_META];
                    const pct = Math.round((row.count / s.totalAthletes) * 100);
                    return (
                      <div key={row.status}>
                        <div className="flex justify-between text-sm">
                          <span className="font-medium text-ink-700">{meta?.label ?? row.status}</span>
                          <span className="text-chalk-500">{row.count}</span>
                        </div>
                        <div className="mt-1 h-2 overflow-hidden rounded-full bg-chalk-100">
                          <div className={`h-full rounded-full ${meta?.dot ?? "bg-ink-500"}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Panel>
              <Panel title="Athletes by sport">
                <div className="max-h-72 space-y-1.5 overflow-y-auto scroll-thin pr-1">
                  {data.bySport.filter((x) => x.count > 0).sort((a, b) => b.count - a.count).map((row) => (
                    <div key={row.name} className="flex items-center justify-between text-sm">
                      <span className="text-ink-700">{row.name}</span>
                      <span className="font-semibold text-ink-900">{row.count}</span>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>
          </div>
        )}

        {tab === "Profiles" && (
          <Panel title={`Recent profiles (${data.athletes.length})`}>
            <div className="divide-y divide-chalk-100">
              {data.athletes.map((a) => (
                <div key={a.id} className="flex flex-wrap items-center gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <Link href={`/athletes/${a.slug}`} className="font-bold text-ink-900 hover:text-accent">{a.name}</Link>
                    <p className="text-xs text-chalk-500">{a.sportName} • {a.schoolName}</p>
                  </div>
                  <StatusBadge status={a.transferStatus} size="sm" />
                  <VerificationBadge level={a.verification} />
                  {a.verification !== "PORTAL_VERIFIED" ? (
                    <button onClick={() => act("athlete", a.id, "verify", "PORTAL_VERIFIED")} disabled={busy === a.id + "verify"} className="btn-outline btn-sm">
                      Portal Verify
                    </button>
                  ) : (
                    <button onClick={() => act("athlete", a.id, "verify", "SUBMITTED")} className="btn-ghost btn-sm">Unverify</button>
                  )}
                  <button
                    onClick={() => { if (confirm(`Remove ${a.name}? This cannot be undone.`)) act("athlete", a.id, "delete"); }}
                    className="btn-sm text-red-500 hover:bg-red-50"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </Panel>
        )}

        {tab === "Reports" && (
          <Panel title={`Open reports (${data.reports.length})`}>
            {data.reports.length === 0 ? (
              <p className="py-8 text-center text-sm text-chalk-500">No open reports. 🎉</p>
            ) : (
              <div className="divide-y divide-chalk-100">
                {data.reports.map((r) => (
                  <div key={r.id} className="flex flex-wrap items-start gap-3 py-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Link href={`/athletes/${r.athleteSlug}`} className="font-bold text-ink-900 hover:text-accent">{r.athleteName}</Link>
                        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">{r.reason}</span>
                      </div>
                      {r.details && <p className="mt-1 text-sm text-chalk-500">{r.details}</p>}
                    </div>
                    <button onClick={() => act("report", r.id, "resolve")} className="btn-dark btn-sm">Resolve</button>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        )}

        {tab === "Coaches" && (
          <Panel title={`Coaches (${data.coaches.length})`}>
            <div className="divide-y divide-chalk-100">
              {data.coaches.map((c) => (
                <div key={c.id} className="flex flex-wrap items-center gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-ink-900">{c.name}</span>
                    <p className="text-xs text-chalk-500">{c.email} • {c.school}</p>
                  </div>
                  {c.verified ? (
                    <>
                      <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">Verified ✓</span>
                      <button onClick={() => act("coach", c.id, "verify", false)} className="btn-ghost btn-sm">Revoke</button>
                    </>
                  ) : (
                    <button onClick={() => act("coach", c.id, "verify", true)} className="btn-dark btn-sm">Verify coach</button>
                  )}
                </div>
              ))}
            </div>
          </Panel>
        )}

        {tab === "Sports" && (
          <Panel title="Sports & fields">
            <p className="mb-3 text-sm text-chalk-500">
              The database uses a flexible field architecture — each sport carries its own performance
              fields. New sports and fields are defined in <code className="rounded bg-chalk-100 px-1">lib/sports.ts</code> and stored per-sport.
            </p>
            <div className="divide-y divide-chalk-100">
              {data.sports.map((sp) => (
                <div key={sp.id} className="flex flex-wrap items-center gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-ink-900">{sp.name}</span>
                    <p className="text-xs text-chalk-500">{sp.fields} sport-specific fields • {sp.athletes} athletes</p>
                  </div>
                  <button
                    onClick={() => act("sport", sp.id, "active", !sp.active)}
                    className={`btn-sm ${sp.active ? "btn-outline" : "btn-dark"}`}
                  >
                    {sp.active ? "Active" : "Inactive"}
                  </button>
                </div>
              ))}
            </div>
          </Panel>
        )}

        {tab === "Uploads" && (
          <Panel title={`Roster uploads (${data.uploads.length})`}>
            {data.uploads.length === 0 ? (
              <p className="py-8 text-center text-sm text-chalk-500">No uploads yet.</p>
            ) : (
              <div className="divide-y divide-chalk-100">
                {data.uploads.map((u) => (
                  <div key={u.id} className="flex flex-wrap items-center gap-3 py-3">
                    <div className="min-w-0 flex-1">
                      <span className="font-bold text-ink-900">{u.filename}</span>
                      <p className="text-xs text-chalk-500">
                        by {u.coach} • {new Date(u.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-sm text-chalk-500">
                      {u.rowsReady}/{u.rowsTotal} published
                      {u.rowsError ? ` • ${u.rowsError} skipped` : ""}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        )}
      </div>
    </div>
  );
}

function Metric({ value, label, tone }: { value: number; label: string; tone?: "green" | "amber" | "red" }) {
  const c = tone === "green" ? "text-green-600" : tone === "amber" ? "text-amber-600" : tone === "red" ? "text-red-600" : "text-ink-900";
  return (
    <div className="card px-4 py-3">
      <div className={`font-display text-2xl font-black ${c}`}>{value}</div>
      <div className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-chalk-400">{label}</div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card p-5">
      <h2 className="mb-4 font-display text-sm font-bold uppercase tracking-wide text-ink-900">{title}</h2>
      {children}
    </div>
  );
}
