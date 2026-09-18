"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { AthleteView } from "@/lib/athletes";
import type { SportFieldDef } from "@/lib/sports";
import { TRANSFER_STATUSES, TRANSFER_STATUS_META } from "@/lib/constants";

export function PlayerEditor({
  athlete,
  fields,
}: {
  athlete: AthleteView;
  fields: SportFieldDef[];
}) {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    transferStatus: athlete.transferStatus,
    gpa: athlete.gpa?.toString() ?? "",
    major: athlete.major ?? "",
    playerEmail: athlete.playerEmail ?? "",
    playerPhone: athlete.playerPhone ?? "",
    showEmail: athlete.showEmail,
    showPhone: athlete.showPhone,
    filmLink: athlete.filmLinks[0] ?? "",
    metrics: { ...athlete.metrics } as Record<string, string | number>,
  });

  const set = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));
  const setMetric = (k: string, v: string) =>
    setForm((f) => ({ ...f, metrics: { ...f.metrics, [k]: v } }));

  async function save() {
    setSaving(true);
    setSaved(false);
    try {
      await fetch("/api/athletes/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: athlete.id,
          transferStatus: form.transferStatus,
          gpa: form.gpa,
          major: form.major,
          playerEmail: form.playerEmail,
          playerPhone: form.playerPhone,
          showEmail: form.showEmail,
          showPhone: form.showPhone,
          filmLinks: form.filmLink ? [form.filmLink] : [],
          metrics: form.metrics,
        }),
      });
      setSaved(true);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <Card title="Transfer Status">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {TRANSFER_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => set("transferStatus", s)}
              className={`rounded-xl border px-3 py-3 text-left text-sm font-semibold transition-colors ${
                form.transferStatus === s ? "border-ink-900 bg-ink-900 text-white" : "border-chalk-200 bg-white text-ink-700 hover:border-chalk-300"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <span className={`h-1.5 w-1.5 rounded-full ${TRANSFER_STATUS_META[s].dot}`} />
                {TRANSFER_STATUS_META[s].short}
              </span>
            </button>
          ))}
        </div>
      </Card>

      <Card title="Academics">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="GPA">
            <input type="number" step="0.01" className="input" value={form.gpa} onChange={(e) => set("gpa", e.target.value)} />
          </Field>
          <Field label="Major">
            <input className="input" value={form.major} onChange={(e) => set("major", e.target.value)} />
          </Field>
        </div>
      </Card>

      {fields.length > 0 && (
        <Card title="Statistics">
          <div className="grid gap-4 sm:grid-cols-2">
            {fields.map((f) => (
              <Field key={f.key} label={`${f.label}${f.unit ? ` (${f.unit})` : ""}`}>
                <input
                  className="input"
                  value={String(form.metrics[f.key] ?? "")}
                  onChange={(e) => setMetric(f.key, e.target.value)}
                />
              </Field>
            ))}
          </div>
        </Card>
      )}

      <Card title="Film">
        <Field label="Highlight / film link">
          <input className="input" value={form.filmLink} onChange={(e) => set("filmLink", e.target.value)} placeholder="https://youtube.com/…" />
        </Field>
      </Card>

      <Card title="Contact & Privacy">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Email">
            <input type="email" className="input" value={form.playerEmail} onChange={(e) => set("playerEmail", e.target.value)} />
          </Field>
          <Field label="Phone">
            <input className="input" value={form.playerPhone} onChange={(e) => set("playerPhone", e.target.value)} />
          </Field>
        </div>
        <div className="mt-3 flex flex-wrap gap-4">
          <Toggle label="Show email publicly" checked={form.showEmail} onChange={(v) => set("showEmail", v)} />
          <Toggle label="Show phone publicly" checked={form.showPhone} onChange={(v) => set("showPhone", v)} />
        </div>
      </Card>

      <div className="flex items-center gap-3">
        <button onClick={save} disabled={saving} className="btn-primary btn-lg">
          {saving ? "Saving…" : "Save changes"}
        </button>
        <Link href={`/athletes/${athlete.slug}`} className="btn-outline btn-md">View public profile</Link>
        {saved && <span className="text-sm font-semibold text-green-600">✓ Saved</span>}
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card p-5">
      <h3 className="mb-4 font-display text-sm font-bold uppercase tracking-wide text-ink-900">{title}</h3>
      {children}
    </div>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      {children}
    </label>
  );
}
function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 rounded border-chalk-300 text-accent focus:ring-accent" />
      <span className="text-sm font-medium text-ink-800">{label}</span>
    </label>
  );
}
