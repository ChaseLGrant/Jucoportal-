"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { SPORTS } from "@/lib/sports";
import { getRosterTargets, suggestMapping } from "@/lib/roster";

type Row = Record<string, string>;

export function RosterUploader({ defaultSport }: { defaultSport?: string }) {
  const [sport, setSport] = useState(defaultSport ?? "baseball");
  const [step, setStep] = useState<"upload" | "map" | "done">("upload");
  const [filename, setFilename] = useState("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<Row[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ created: number; skipped: number } | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const targets = useMemo(() => getRosterTargets(sport), [sport]);

  const nameTargets = new Set(["fullName", "firstName", "lastName"]);
  const readyCount = useMemo(() => {
    const byTarget: Record<string, string> = {};
    for (const [h, t] of Object.entries(mapping)) if (t) byTarget[t] = h;
    return rows.filter((r) => {
      const full = byTarget.fullName ? r[byTarget.fullName] : "";
      const first = byTarget.firstName ? r[byTarget.firstName] : "";
      const last = byTarget.lastName ? r[byTarget.lastName] : "";
      return Boolean((full && full.trim()) || (first && first.trim()) || (last && last.trim()));
    }).length;
  }, [rows, mapping]);

  const hasNameMapping = Object.values(mapping).some((t) => nameTargets.has(t));

  async function handleFile(file: File) {
    setError("");
    setFilename(file.name);
    try {
      let parsedRows: Row[] = [];
      let cols: string[] = [];
      if (file.name.toLowerCase().endsWith(".csv")) {
        const text = await file.text();
        const res = Papa.parse<Row>(text, { header: true, skipEmptyLines: true });
        parsedRows = (res.data as Row[]).filter((r) => Object.values(r).some((v) => v));
        cols = res.meta.fields ?? [];
      } else {
        const buf = await file.arrayBuffer();
        const wb = XLSX.read(buf, { type: "array" });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json<Row>(sheet, { defval: "", raw: false });
        parsedRows = json.filter((r) => Object.values(r).some((v) => v));
        cols = parsedRows.length ? Object.keys(parsedRows[0]) : [];
      }

      if (!parsedRows.length) {
        setError("We couldn't find any rows in that file. Make sure the first row has column headers.");
        return;
      }
      setHeaders(cols);
      setRows(parsedRows);
      setMapping(suggestMapping(cols, sport));
      setStep("map");
    } catch {
      setError("Could not read that file. Please upload a .csv or .xlsx spreadsheet.");
    }
  }

  async function publish() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/roster/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sport, mapping, rows, filename }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Publish failed.");
        return;
      }
      setResult({ created: data.created, skipped: data.skipped });
      setStep("done");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setStep("upload");
    setRows([]);
    setHeaders([]);
    setMapping({});
    setResult(null);
    setFilename("");
  }

  // ---------------- UPLOAD ----------------
  if (step === "upload") {
    return (
      <div className="card p-6 sm:p-8">
        <div className="mb-5 max-w-xs">
          <span className="label">Sport for this roster</span>
          <select value={sport} onChange={(e) => setSport(e.target.value)} className="select">
            {SPORTS.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}
          </select>
        </div>

        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
          }}
          onClick={() => inputRef.current?.click()}
          className={`grid cursor-pointer place-items-center rounded-2xl border-2 border-dashed px-6 py-14 text-center transition-colors ${
            dragOver ? "border-accent bg-accent-soft" : "border-chalk-300 bg-chalk-50 hover:border-ink-400"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-ink-900 text-white">
            <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 16V4M6 10l6-6 6 6M4 20h16" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="mt-4 font-display text-lg font-bold text-ink-900">
            Drop your roster spreadsheet here
          </p>
          <p className="mt-1 text-sm text-chalk-500">
            CSV or XLSX — upload whatever roster you already use. We map the columns for you.
          </p>
          <span className="btn-dark btn-md mt-4">Choose file</span>
        </div>
        {error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
      </div>
    );
  }

  // ---------------- DONE ----------------
  if (step === "done" && result) {
    return (
      <div className="card p-8 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-green-50 text-green-600">
          <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2 className="mt-4 font-display text-2xl font-black text-ink-900">
          {result.created} athletes published
        </h2>
        <p className="mt-1 text-chalk-500">
          They're now live and searchable by four-year programs.
          {result.skipped > 0 && ` ${result.skipped} rows were skipped (no name).`}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/dashboard/coach" className="btn-dark btn-md">Go to my roster</Link>
          <button onClick={reset} className="btn-outline btn-md">Upload another</button>
        </div>
      </div>
    );
  }

  // ---------------- MAP ----------------
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryStat value={rows.length} label="Athletes found" />
        <SummaryStat value={readyCount} label="Ready to publish" tone="green" />
        <SummaryStat value={rows.length - readyCount} label="Missing a name" tone={rows.length - readyCount > 0 ? "amber" : undefined} />
      </div>

      <div className="card overflow-hidden">
        <div className="border-b border-chalk-200 px-5 py-3">
          <h3 className="font-display text-sm font-bold uppercase tracking-wide text-ink-900">
            Map your columns
          </h3>
          <p className="mt-0.5 text-xs text-chalk-500">
            We auto-matched what we could. Adjust any column below.
          </p>
        </div>
        <div className="divide-y divide-chalk-100">
          {headers.map((h) => {
            const sample = rows.find((r) => r[h])?.[h] ?? "";
            return (
              <div key={h} className="flex flex-col gap-2 px-5 py-3 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold text-ink-900">{h}</div>
                  <div className="truncate text-xs text-chalk-400">e.g. {String(sample) || "—"}</div>
                </div>
                <div className="text-chalk-300 hidden sm:block">→</div>
                <select
                  value={mapping[h] ?? ""}
                  onChange={(e) => setMapping((m) => ({ ...m, [h]: e.target.value }))}
                  className="select sm:w-64"
                >
                  <option value="">— Ignore this column —</option>
                  <TargetOptions targets={targets} />
                </select>
              </div>
            );
          })}
        </div>
      </div>

      {!hasNameMapping && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
          Map at least one column to <strong>Athlete Name</strong> (or First / Last) to publish.
        </p>
      )}
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      <div className="flex items-center justify-between">
        <button onClick={reset} className="btn-ghost btn-md">← Start over</button>
        <button
          onClick={publish}
          disabled={loading || !hasNameMapping || readyCount === 0}
          className="btn-primary btn-lg"
        >
          {loading ? "Publishing…" : `Publish ${readyCount} athletes`}
        </button>
      </div>
    </div>
  );
}

function TargetOptions({ targets }: { targets: ReturnType<typeof getRosterTargets> }) {
  const groups: Record<string, string> = {
    identity: "Identity", athletic: "Athletic", academic: "Academics",
    transfer: "Transfer", contact: "Contact", metric: "Sport Metrics",
  };
  const order = ["identity", "athletic", "academic", "transfer", "contact", "metric"];
  return (
    <>
      {order.map((g) => {
        const items = targets.filter((t) => t.group === g);
        if (!items.length) return null;
        return (
          <optgroup key={g} label={groups[g]}>
            {items.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
          </optgroup>
        );
      })}
    </>
  );
}

function SummaryStat({ value, label, tone }: { value: number; label: string; tone?: "green" | "amber" }) {
  const color = tone === "green" ? "text-green-600" : tone === "amber" ? "text-amber-600" : "text-ink-900";
  return (
    <div className="card px-4 py-3">
      <div className={`font-display text-2xl font-black ${color}`}>{value}</div>
      <div className="text-xs font-semibold uppercase tracking-wide text-chalk-400">{label}</div>
    </div>
  );
}
