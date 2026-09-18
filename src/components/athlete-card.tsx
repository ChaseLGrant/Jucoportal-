import Link from "next/link";
import type { AthleteView } from "@/lib/athletes";
import { cardFields } from "@/lib/sports";
import { formatHeight } from "@/lib/utils";
import { StatusBadge, VerificationBadge } from "./badges";
import { AthleteAvatar } from "./athlete-avatar";

function metricValue(a: AthleteView, key: string, unit?: string) {
  const v = a.metrics[key];
  if (v == null || v === "") return null;
  return unit ? `${v} ${unit}` : String(v);
}

export function AthleteCard({ athlete }: { athlete: AthleteView }) {
  const fields = cardFields(athlete.sportSlug).slice(0, 3);
  const physical = [
    formatHeight(athlete.heightInches),
    athlete.weightLbs ? `${athlete.weightLbs} lbs` : null,
    athlete.handedness,
  ]
    .filter(Boolean)
    .join(" • ");

  return (
    <Link
      href={`/athletes/${athlete.slug}`}
      className="group card flex flex-col overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:border-chalk-300 hover:shadow-cardhover"
    >
      <div className="flex items-start gap-3.5 p-4">
        <AthleteAvatar
          first={athlete.firstName}
          last={athlete.lastName}
          photoUrl={athlete.photoUrl}
          className="h-14 w-14 shrink-0 rounded-xl"
          textClass="text-lg"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate font-display text-[17px] font-extrabold leading-tight tracking-tight text-ink-900">
              {athlete.name}
            </h3>
          </div>
          <p className="mt-0.5 truncate text-[13px] font-semibold text-chalk-500">
            {athlete.positions[0] ?? athlete.sportName}
            {athlete.schoolName ? ` • ${athlete.schoolName}` : ""}
          </p>
          {physical && (
            <p className="mt-0.5 truncate text-xs text-chalk-400">{physical}</p>
          )}
        </div>
      </div>

      {fields.length > 0 && (
        <div className="grid grid-cols-3 gap-px bg-chalk-100">
          {fields.map((f) => {
            const val = metricValue(athlete, f.key, f.unit);
            return (
              <div key={f.key} className="bg-white px-2 py-2.5 text-center">
                <div className="font-display text-[15px] font-extrabold leading-none text-ink-900">
                  {val ?? "—"}
                </div>
                <div className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-chalk-400">
                  {f.label}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex items-center justify-between gap-2 px-4 py-3 text-xs text-chalk-500">
        <span className="font-medium">
          {athlete.gpa ? `${athlete.gpa.toFixed(2)} GPA` : "GPA —"}
        </span>
        <span className="truncate">{athlete.major ?? ""}</span>
      </div>

      <div className="mt-auto flex items-center justify-between gap-2 border-t border-chalk-100 px-4 py-3">
        <div className="flex flex-col gap-1">
          <StatusBadge status={athlete.transferStatus} size="sm" />
          {athlete.transferSemester && athlete.transferYear ? (
            <span className="text-[11px] text-chalk-400">
              Available {athlete.transferSemester} {athlete.transferYear}
              {athlete.eligibilityYears ? ` • ${athlete.eligibilityYears}y elig.` : ""}
            </span>
          ) : null}
        </div>
        <div className="flex flex-col items-end gap-1">
          <VerificationBadge level={athlete.verification} />
          <span className="text-[11px] font-bold text-accent opacity-0 transition-opacity group-hover:opacity-100">
            View →
          </span>
        </div>
      </div>
    </Link>
  );
}
