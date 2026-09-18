"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { AthleteView } from "@/lib/athletes";
import { cardFields } from "@/lib/sports";
import { formatHeight } from "@/lib/utils";
import { AthleteCard } from "./athlete-card";
import { AthleteAvatar } from "./athlete-avatar";
import { StatusBadge, VerificationBadge } from "./badges";

export function ResultsSection({
  athletes,
  total,
  sort,
}: {
  athletes: AthleteView[];
  total: number;
  sort: string;
}) {
  const [view, setView] = useState<"grid" | "list">("grid");
  const router = useRouter();
  const params = useSearchParams();

  function setSort(value: string) {
    const p = new URLSearchParams(params.toString());
    if (value) p.set("sort", value);
    else p.delete("sort");
    router.replace(`/search?${p.toString()}`, { scroll: false });
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-chalk-500">
          <span className="font-bold text-ink-900">{total}</span> athlete{total === 1 ? "" : "s"} found
        </p>
        <div className="flex items-center gap-2">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="select h-9 w-auto py-0 text-[13px]"
          >
            <option value="">Most relevant</option>
            <option value="recent">Newest</option>
            <option value="name">Name (A–Z)</option>
            <option value="gpa">Highest GPA</option>
          </select>
          <div className="flex overflow-hidden rounded-lg border border-chalk-200">
            <ToggleBtn active={view === "grid"} onClick={() => setView("grid")} label="Grid">
              <path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" />
            </ToggleBtn>
            <ToggleBtn active={view === "list"} onClick={() => setView("list")} label="List">
              <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
            </ToggleBtn>
          </div>
        </div>
      </div>

      {athletes.length === 0 ? (
        <div className="card grid place-items-center px-6 py-20 text-center">
          <p className="font-display text-lg font-bold text-ink-900">No athletes match those filters.</p>
          <p className="mt-1 max-w-sm text-sm text-chalk-500">
            Try widening your search — remove a metric filter or broaden the transfer status.
          </p>
        </div>
      ) : view === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {athletes.map((a) => (
            <AthleteCard key={a.id} athlete={a} />
          ))}
        </div>
      ) : (
        <div className="card divide-y divide-chalk-100 overflow-hidden">
          {athletes.map((a) => (
            <AthleteRow key={a.id} athlete={a} />
          ))}
        </div>
      )}
    </div>
  );
}

function ToggleBtn({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={`${label} view`}
      className={`grid h-9 w-9 place-items-center ${active ? "bg-ink-900 text-white" : "bg-white text-chalk-400 hover:text-ink-900"}`}
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        {children}
      </svg>
    </button>
  );
}

function AthleteRow({ athlete }: { athlete: AthleteView }) {
  const fields = cardFields(athlete.sportSlug).slice(0, 3);
  return (
    <Link
      href={`/athletes/${athlete.slug}`}
      className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-chalk-50"
    >
      <AthleteAvatar
        first={athlete.firstName}
        last={athlete.lastName}
        photoUrl={athlete.photoUrl}
        className="h-11 w-11 shrink-0 rounded-lg"
        textClass="text-sm"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate font-bold text-ink-900">{athlete.name}</span>
          <VerificationBadge level={athlete.verification} />
        </div>
        <p className="truncate text-xs text-chalk-500">
          {athlete.positions[0] ?? athlete.sportName}
          {athlete.schoolName ? ` • ${athlete.schoolName}` : ""} • {formatHeight(athlete.heightInches)}
        </p>
      </div>
      <div className="hidden items-center gap-6 md:flex">
        {fields.map((fd) => (
          <div key={fd.key} className="w-16 text-center">
            <div className="text-sm font-bold text-ink-900">
              {athlete.metrics[fd.key] != null ? String(athlete.metrics[fd.key]) : "—"}
            </div>
            <div className="text-[10px] uppercase text-chalk-400">{fd.label}</div>
          </div>
        ))}
        <div className="w-14 text-center">
          <div className="text-sm font-bold text-ink-900">{athlete.gpa?.toFixed(2) ?? "—"}</div>
          <div className="text-[10px] uppercase text-chalk-400">GPA</div>
        </div>
      </div>
      <StatusBadge status={athlete.transferStatus} size="sm" className="shrink-0" />
    </Link>
  );
}
