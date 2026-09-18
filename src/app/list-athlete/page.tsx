"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { SPORTS, getSport } from "@/lib/sports";
import { US_STATES, CLASS_YEARS, SEMESTERS, TRANSFER_STATUSES, TRANSFER_STATUS_META } from "@/lib/constants";

const STEPS = ["Basics", "Athletics", "Academics", "Media", "Contact"];

type Data = Record<string, string | boolean | Record<string, string>>;

export default function ListAthletePage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [d, setD] = useState<Data>({
    sport: "baseball",
    transferStatus: "ACTIVELY_SEEKING",
    metrics: {},
    showEmail: true,
    showPhone: false,
    heightFeet: "6",
    heightInches: "0",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sportDef = useMemo(() => getSport(String(d.sport)), [d.sport]);
  const set = (k: string, v: string | boolean) => setD((p) => ({ ...p, [k]: v }));
  const setMetric = (k: string, v: string) =>
    setD((p) => ({ ...p, metrics: { ...(p.metrics as Record<string, string>), [k]: v } }));

  function next() {
    setError("");
    if (step === 0 && (!d.firstName || !d.lastName)) {
      setError("Please enter your first and last name.");
      return;
    }
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }
  const back = () => setStep((s) => Math.max(0, s - 1));

  async function publish() {
    setError("");
    setLoading(true);
    try {
      const feet = parseInt(String(d.heightFeet || "0"), 10);
      const inch = parseInt(String(d.heightInches || "0"), 10);
      const heightInches = feet * 12 + inch;
      const res = await fetch("/api/athletes/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...d, heightInches }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not publish profile.");
        return;
      }
      router.push(`/athletes/${data.slug}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-chalk-50">
      <div className="bg-ink-950 text-white">
        <div className="container-narrow py-10">
          <p className="eyebrow">List Myself</p>
          <h1 className="mt-2 font-display text-3xl font-black tracking-tight sm:text-4xl">
            Create your free profile
          </h1>
          <p className="mt-2 text-white/70">Takes about two minutes. No account required.</p>
        </div>
      </div>

      <div className="container-narrow py-8">
        {/* progress */}
        <div className="mb-8 flex items-center gap-2">
          {STEPS.map((label, i) => (
            <div key={label} className="flex flex-1 items-center gap-2">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`grid h-8 w-8 place-items-center rounded-full text-sm font-bold ${
                    i < step ? "bg-accent text-white" : i === step ? "bg-ink-900 text-white" : "bg-chalk-200 text-chalk-500"
                  }`}
                >
                  {i < step ? "✓" : i + 1}
                </div>
                <span className={`hidden text-[11px] font-semibold sm:block ${i === step ? "text-ink-900" : "text-chalk-400"}`}>
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && <div className={`h-0.5 flex-1 ${i < step ? "bg-accent" : "bg-chalk-200"}`} />}
            </div>
          ))}
        </div>

        <div className="card p-6 sm:p-8">
          {step === 0 && (
            <StepWrap title="Basic Information">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="First name" req>
                  <input className="input" value={str(d.firstName)} onChange={(e) => set("firstName", e.target.value)} />
                </Field>
                <Field label="Last name" req>
                  <input className="input" value={str(d.lastName)} onChange={(e) => set("lastName", e.target.value)} />
                </Field>
                <Field label="Sport" req>
                  <select className="select" value={str(d.sport)} onChange={(e) => { set("sport", e.target.value); set("positions", ""); setD((p)=>({...p,metrics:{}})); }}>
                    {SPORTS.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}
                  </select>
                </Field>
                <Field label="Position / Event">
                  <select className="select" value={str(d.positions)} onChange={(e) => set("positions", e.target.value)}>
                    <option value="">Select…</option>
                    {sportDef?.positions.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </Field>
                <Field label="Current JUCO / School">
                  <input className="input" value={str(d.schoolName)} onChange={(e) => set("schoolName", e.target.value)} placeholder="Palomar College" />
                </Field>
                <Field label="Class">
                  <select className="select" value={str(d.classYear)} onChange={(e) => set("classYear", e.target.value)}>
                    <option value="">Select…</option>
                    {CLASS_YEARS.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="City">
                  <input className="input" value={str(d.city)} onChange={(e) => set("city", e.target.value)} />
                </Field>
                <Field label="State">
                  <select className="select" value={str(d.state)} onChange={(e) => set("state", e.target.value)}>
                    <option value="">Select…</option>
                    {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>
              </div>
            </StepWrap>
          )}

          {step === 1 && (
            <StepWrap title="Athletics" subtitle={`${sportDef?.name} — only the fields that matter for your sport.`}>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Height">
                  <div className="flex gap-2">
                    <select className="select" value={str(d.heightFeet)} onChange={(e) => set("heightFeet", e.target.value)}>
                      {[4, 5, 6, 7].map((f) => <option key={f} value={f}>{f} ft</option>)}
                    </select>
                    <select className="select" value={str(d.heightInches)} onChange={(e) => set("heightInches", e.target.value)}>
                      {Array.from({ length: 12 }, (_, i) => <option key={i} value={i}>{i} in</option>)}
                    </select>
                  </div>
                </Field>
                <Field label="Weight (lbs)">
                  <input type="number" className="input" value={str(d.weightLbs)} onChange={(e) => set("weightLbs", e.target.value)} />
                </Field>
                {(str(d.sport) === "baseball" || str(d.sport) === "softball") && (
                  <Field label="Bats / Throws">
                    <select className="select" value={str(d.handedness)} onChange={(e) => set("handedness", e.target.value)}>
                      <option value="">Select…</option>
                      {["R/R", "L/L", "L/R", "R/L", "S/R", "S/L"].map((h) => <option key={h}>{h}</option>)}
                    </select>
                  </Field>
                )}
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {sportDef?.fields.map((f) => (
                  <Field key={f.key} label={`${f.label}${f.unit ? ` (${f.unit})` : ""}`}>
                    {f.type === "select" ? (
                      <select className="select" value={(d.metrics as Record<string,string>)[f.key] ?? ""} onChange={(e) => setMetric(f.key, e.target.value)}>
                        <option value="">Select…</option>
                        {f.options?.map((o) => <option key={o}>{o}</option>)}
                      </select>
                    ) : (
                      <input
                        type={f.type === "number" ? "number" : "text"}
                        step="any"
                        className="input"
                        value={(d.metrics as Record<string,string>)[f.key] ?? ""}
                        onChange={(e) => setMetric(f.key, e.target.value)}
                      />
                    )}
                  </Field>
                ))}
              </div>
            </StepWrap>
          )}

          {step === 2 && (
            <StepWrap title="Academics">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="GPA">
                  <input type="number" step="0.01" className="input" value={str(d.gpa)} onChange={(e) => set("gpa", e.target.value)} placeholder="3.45" />
                </Field>
                <Field label="Major">
                  <input className="input" value={str(d.major)} onChange={(e) => set("major", e.target.value)} placeholder="Business Administration" />
                </Field>
                <Field label="Credits completed">
                  <input type="number" className="input" value={str(d.creditsCompleted)} onChange={(e) => set("creditsCompleted", e.target.value)} />
                </Field>
                <Field label="Remaining eligibility (years)">
                  <select className="select" value={str(d.eligibilityYears)} onChange={(e) => set("eligibilityYears", e.target.value)}>
                    <option value="">Select…</option>
                    {[1, 2, 3].map((y) => <option key={y} value={y}>{y} year(s)</option>)}
                  </select>
                </Field>
                <Field label="Transfer semester">
                  <select className="select" value={str(d.transferSemester)} onChange={(e) => set("transferSemester", e.target.value)}>
                    <option value="">Select…</option>
                    {SEMESTERS.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </Field>
                <Field label="Transfer year">
                  <select className="select" value={str(d.transferYear)} onChange={(e) => set("transferYear", e.target.value)}>
                    <option value="">Select…</option>
                    {[2026, 2027, 2028, 2029].map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                </Field>
              </div>
            </StepWrap>
          )}

          {step === 3 && (
            <StepWrap title="Media" subtitle="Add a photo and film. You can paste any public image or video link.">
              <div className="grid gap-4">
                <Field label="Profile image URL">
                  <input className="input" value={str(d.photoUrl)} onChange={(e) => set("photoUrl", e.target.value)} placeholder="https://…" />
                </Field>
                <Field label="Film / highlight link (YouTube or Hudl)">
                  <input className="input" value={str(d.filmLink)} onChange={(e) => set("filmLink", e.target.value)} placeholder="https://youtube.com/…" />
                </Field>
                <Field label="Short bio (optional)">
                  <textarea rows={3} className="input h-auto py-2" value={str(d.bio)} onChange={(e) => set("bio", e.target.value)} />
                </Field>
              </div>
            </StepWrap>
          )}

          {step === 4 && (
            <StepWrap title="Contact & Status" subtitle="You control exactly what's public.">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Transfer status">
                  <select className="select" value={str(d.transferStatus)} onChange={(e) => set("transferStatus", e.target.value)}>
                    {TRANSFER_STATUSES.map((s) => <option key={s} value={s}>{TRANSFER_STATUS_META[s].label}</option>)}
                  </select>
                </Field>
                <div className="hidden sm:block" />
                <Field label="Your email">
                  <input type="email" className="input" value={str(d.playerEmail)} onChange={(e) => set("playerEmail", e.target.value)} />
                </Field>
                <Field label="Your phone">
                  <input className="input" value={str(d.playerPhone)} onChange={(e) => set("playerPhone", e.target.value)} />
                </Field>
              </div>
              <div className="mt-3 flex flex-wrap gap-4">
                <Toggle label="Show my email publicly" checked={!!d.showEmail} onChange={(v) => set("showEmail", v)} />
                <Toggle label="Show my phone publicly" checked={!!d.showPhone} onChange={(v) => set("showPhone", v)} />
              </div>

              <div className="mt-6 border-t border-chalk-100 pt-5">
                <p className="label">Current JUCO coach</p>
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field label="Coach name">
                    <input className="input" value={str(d.coachName)} onChange={(e) => set("coachName", e.target.value)} />
                  </Field>
                  <Field label="Coach email">
                    <input type="email" className="input" value={str(d.coachEmail)} onChange={(e) => set("coachEmail", e.target.value)} />
                  </Field>
                  <Field label="Coach phone">
                    <input className="input" value={str(d.coachPhone)} onChange={(e) => set("coachPhone", e.target.value)} />
                  </Field>
                </div>
              </div>
            </StepWrap>
          )}

          {error && <p className="mt-5 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

          <div className="mt-8 flex items-center justify-between">
            <button onClick={back} disabled={step === 0} className="btn-ghost btn-md disabled:opacity-0">
              ← Back
            </button>
            {step < STEPS.length - 1 ? (
              <button onClick={next} className="btn-dark btn-lg">Continue →</button>
            ) : (
              <button onClick={publish} disabled={loading} className="btn-primary btn-lg">
                {loading ? "Publishing…" : "Publish Profile"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function StepWrap({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="animate-fade-in">
      <h2 className="font-display text-xl font-extrabold tracking-tight text-ink-900">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-chalk-500">{subtitle}</p>}
      <div className="mt-5">{children}</div>
    </div>
  );
}

function Field({ label, req, children }: { label: string; req?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="label">
        {label} {req && <span className="text-accent">*</span>}
      </span>
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
