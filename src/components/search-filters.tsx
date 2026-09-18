"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SPORTS, getSport, filterFields } from "@/lib/sports";
import { TRANSFER_STATUSES, TRANSFER_STATUS_META, CLASS_YEARS } from "@/lib/constants";
import { formatHeight } from "@/lib/utils";

export interface FilterState {
  sport: string;
  position: string;
  transferStatus: string;
  transferYear: string;
  classYear: string;
  state: string;
  school: string;
  gpaMin: string;
  eligibilityMin: string;
  major: string;
  heightMin: string;
  verifiedOnly: string;
  sort: string;
  metrics: Record<string, { min?: string; max?: string }>;
}

interface Facets {
  states: string[];
  schools: { slug: string; name: string }[];
  transferYears: number[];
}

export function SearchFilters({
  initial,
  facets,
}: {
  initial: FilterState;
  facets: Facets;
}) {
  const router = useRouter();
  const [f, setF] = useState<FilterState>(initial);
  const [openMobile, setOpenMobile] = useState(false);
  const debounce = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const sportDef = getSport(f.sport);
  const metricDefs = f.sport ? filterFields(f.sport) : [];

  const buildQuery = useCallback((state: FilterState) => {
    const p = new URLSearchParams();
    if (state.sport) p.set("sport", state.sport);
    if (state.position) p.set("position", state.position);
    if (state.transferStatus) p.set("transferStatus", state.transferStatus);
    if (state.transferYear) p.set("transferYear", state.transferYear);
    if (state.classYear) p.set("classYear", state.classYear);
    if (state.state) p.set("state", state.state);
    if (state.school) p.set("school", state.school);
    if (state.gpaMin) p.set("gpaMin", state.gpaMin);
    if (state.eligibilityMin) p.set("eligibilityMin", state.eligibilityMin);
    if (state.major) p.set("major", state.major);
    if (state.heightMin) p.set("heightMin", state.heightMin);
    if (state.verifiedOnly === "1") p.set("verifiedOnly", "1");
    if (state.sort) p.set("sort", state.sort);
    for (const [key, r] of Object.entries(state.metrics)) {
      if (r.min) p.set(`m_${key}_min`, r.min);
      if (r.max) p.set(`m_${key}_max`, r.max);
    }
    return p.toString();
  }, []);

  const push = useCallback(
    (state: FilterState, immediate = true) => {
      const run = () => router.replace(`/search?${buildQuery(state)}`, { scroll: false });
      if (immediate) run();
      else {
        clearTimeout(debounce.current);
        debounce.current = setTimeout(run, 450);
      }
    },
    [router, buildQuery]
  );

  useEffect(() => () => clearTimeout(debounce.current), []);

  function update(patch: Partial<FilterState>, immediate = true) {
    setF((prev) => {
      const next = { ...prev, ...patch };
      // reset position + metrics when sport changes
      if (patch.sport && patch.sport !== prev.sport) {
        next.position = "";
        next.metrics = {};
      }
      push(next, immediate);
      return next;
    });
  }

  function updateMetric(key: string, bound: "min" | "max", value: string) {
    setF((prev) => {
      const metrics = { ...prev.metrics, [key]: { ...prev.metrics[key], [bound]: value } };
      const next = { ...prev, metrics };
      push(next, false);
      return next;
    });
  }

  function reset() {
    const cleared: FilterState = {
      sport: "", position: "", transferStatus: "", transferYear: "", classYear: "",
      state: "", school: "", gpaMin: "", eligibilityMin: "", major: "", heightMin: "",
      verifiedOnly: "", sort: "", metrics: {},
    };
    setF(cleared);
    router.replace("/search", { scroll: false });
  }

  const activeCount =
    Object.entries(f).filter(([k, v]) =>
      k !== "metrics" && k !== "sort" && typeof v === "string" && v !== ""
    ).length + Object.keys(f.metrics).filter((k) => f.metrics[k].min || f.metrics[k].max).length;

  const heights = [64, 66, 68, 70, 72, 74, 76, 78, 80];

  const panel = (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-sm font-bold uppercase tracking-wide text-ink-900">
          Filters {activeCount > 0 && <span className="text-accent">({activeCount})</span>}
        </h2>
        {activeCount > 0 && (
          <button onClick={reset} className="text-xs font-semibold text-chalk-500 hover:text-accent">
            Clear all
          </button>
        )}
      </div>

      <Group label="Sport">
        <select value={f.sport} onChange={(e) => update({ sport: e.target.value })} className="select">
          <option value="">All sports</option>
          {SPORTS.map((s) => (
            <option key={s.slug} value={s.slug}>{s.name}</option>
          ))}
        </select>
      </Group>

      {sportDef && (
        <Group label="Position / Event">
          <select value={f.position} onChange={(e) => update({ position: e.target.value })} className="select">
            <option value="">Any</option>
            {sportDef.positions.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </Group>
      )}

      <Group label="Transfer Status">
        <select value={f.transferStatus} onChange={(e) => update({ transferStatus: e.target.value })} className="select">
          <option value="">Any status</option>
          {TRANSFER_STATUSES.map((s) => (
            <option key={s} value={s}>{TRANSFER_STATUS_META[s].label}</option>
          ))}
        </select>
      </Group>

      <div className="grid grid-cols-2 gap-3">
        <Group label="Transfer Year">
          <select value={f.transferYear} onChange={(e) => update({ transferYear: e.target.value })} className="select">
            <option value="">Any</option>
            {(facets.transferYears.length ? facets.transferYears : [2026, 2027, 2028]).map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </Group>
        <Group label="Class">
          <select value={f.classYear} onChange={(e) => update({ classYear: e.target.value })} className="select">
            <option value="">Any</option>
            {CLASS_YEARS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </Group>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Group label="State">
          <select value={f.state} onChange={(e) => update({ state: e.target.value })} className="select">
            <option value="">All</option>
            {facets.states.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </Group>
        <Group label="Min Eligibility">
          <select value={f.eligibilityMin} onChange={(e) => update({ eligibilityMin: e.target.value })} className="select">
            <option value="">Any</option>
            <option value="1">1+ yr</option>
            <option value="2">2+ yrs</option>
            <option value="3">3+ yrs</option>
          </select>
        </Group>
      </div>

      <Group label="Current JUCO">
        <select value={f.school} onChange={(e) => update({ school: e.target.value })} className="select">
          <option value="">All schools</option>
          {facets.schools.map((s) => (
            <option key={s.slug} value={s.slug}>{s.name}</option>
          ))}
        </select>
      </Group>

      <div className="grid grid-cols-2 gap-3">
        <Group label="Min GPA">
          <select value={f.gpaMin} onChange={(e) => update({ gpaMin: e.target.value })} className="select">
            <option value="">Any</option>
            {["2.0", "2.5", "3.0", "3.25", "3.5", "3.75"].map((g) => (
              <option key={g} value={g}>{g}+</option>
            ))}
          </select>
        </Group>
        <Group label="Min Height">
          <select value={f.heightMin} onChange={(e) => update({ heightMin: e.target.value })} className="select">
            <option value="">Any</option>
            {heights.map((h) => (
              <option key={h} value={h}>{formatHeight(h)}+</option>
            ))}
          </select>
        </Group>
      </div>

      <Group label="Major">
        <input
          value={f.major}
          onChange={(e) => update({ major: e.target.value }, false)}
          placeholder="e.g. Business"
          className="input"
        />
      </Group>

      {metricDefs.length > 0 && (
        <div className="rounded-xl border border-chalk-200 bg-chalk-50 p-3">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-chalk-500">
            {sportDef?.name} metrics
          </p>
          <div className="space-y-2.5">
            {metricDefs.map((m) => (
              <div key={m.key} className="flex items-center gap-2">
                <span className="flex-1 text-xs font-medium text-ink-700">
                  {m.label}
                  {m.unit ? ` (${m.unit})` : ""}
                </span>
                <input
                  type="number"
                  step="any"
                  inputMode="decimal"
                  placeholder={m.filter === "max" ? "max" : "min"}
                  value={f.metrics[m.key]?.[m.filter ?? "min"] ?? ""}
                  onChange={(e) => updateMetric(m.key, m.filter ?? "min", e.target.value)}
                  className="h-9 w-20 rounded-lg border border-chalk-300 px-2 text-sm focus:border-ink-900 focus:outline-none"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-chalk-200 bg-white px-3.5 py-3">
        <input
          type="checkbox"
          checked={f.verifiedOnly === "1"}
          onChange={(e) => update({ verifiedOnly: e.target.checked ? "1" : "" })}
          className="h-4 w-4 rounded border-chalk-300 text-accent focus:ring-accent"
        />
        <span className="text-sm font-semibold text-ink-900">Verified profiles only</span>
      </label>
    </div>
  );

  return (
    <>
      {/* mobile toggle */}
      <div className="mb-4 lg:hidden">
        <button onClick={() => setOpenMobile((v) => !v)} className="btn-outline btn-md w-full">
          {openMobile ? "Hide filters" : `Filters${activeCount ? ` (${activeCount})` : ""}`}
        </button>
      </div>
      <div className={`${openMobile ? "block" : "hidden"} lg:block`}>
        <div className="card p-5 lg:sticky lg:top-20">{panel}</div>
      </div>
    </>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="label">{label}</span>
      {children}
    </div>
  );
}
