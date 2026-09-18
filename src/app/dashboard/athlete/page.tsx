import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { serializeAthlete } from "@/lib/athletes";
import { getSport } from "@/lib/sports";
import { PlayerEditor } from "@/components/player-editor";
import { StatusBadge } from "@/components/badges";

export const dynamic = "force-dynamic";

function completeness(a: ReturnType<typeof serializeAthlete>): number {
  const checks = [
    !!a.positions.length, !!a.heightInches, !!a.weightLbs, !!a.gpa, !!a.major,
    !!a.transferYear, !!a.eligibilityYears, a.filmLinks.length > 0,
    Object.keys(a.metrics).length > 0, !!a.playerEmail, !!a.photoUrl, !!a.city,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

export default async function AthleteDashboard() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "ATHLETE") redirect(session.role === "ADMIN" ? "/admin" : "/dashboard/coach");

  const record = await prisma.athlete.findFirst({
    where: { claimedById: session.uid },
    include: { sport: true, school: true },
  });

  if (!record) {
    return (
      <div className="container-narrow py-16 text-center">
        <h1 className="font-display text-2xl font-black text-ink-900">You don&apos;t have a profile yet</h1>
        <p className="mx-auto mt-2 max-w-md text-chalk-500">
          Create your free profile so four-year college coaches can find you. It takes about two minutes.
        </p>
        <Link href="/list-athlete" className="btn-primary btn-lg mt-6 inline-flex">Create my profile</Link>
      </div>
    );
  }

  const athlete = serializeAthlete(record);
  const pct = completeness(athlete);
  const fields = getSport(athlete.sportSlug)?.fields ?? [];

  return (
    <div className="bg-chalk-50 min-h-[calc(100vh-4rem)]">
      <div className="bg-ink-950 text-white">
        <div className="container-wide py-8">
          <p className="eyebrow">My Profile</p>
          <h1 className="mt-1 font-display text-3xl font-black tracking-tight">{athlete.name}</h1>
          <p className="mt-1 text-white/60">
            {athlete.positions[0] ?? athlete.sportName} • {athlete.sportName}
            {athlete.schoolName ? ` • ${athlete.schoolName}` : ""}
          </p>
        </div>
      </div>

      <div className="container-wide -mt-6 pb-12">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="card px-5 py-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-chalk-400">Profile completeness</span>
              <span className="font-display text-lg font-black text-ink-900">{pct}%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-chalk-100">
              <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${pct}%` }} />
            </div>
          </div>
          <div className="card px-5 py-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-chalk-400">Transfer status</div>
            <div className="mt-2"><StatusBadge status={athlete.transferStatus} /></div>
          </div>
          <div className="card px-5 py-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-chalk-400">Profile views</div>
            <div className="mt-1 font-display text-3xl font-black text-ink-900">{athlete.views}</div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_300px]">
          <PlayerEditor athlete={athlete} fields={fields} />
          <aside className="lg:sticky lg:top-20 lg:self-start">
            <div className="card p-5">
              <h3 className="font-display text-sm font-bold uppercase tracking-wide text-ink-900">Tips</h3>
              <ul className="mt-3 space-y-2.5 text-sm text-chalk-600">
                <Tip done={athlete.filmLinks.length > 0}>Add film — profiles with film get 3× the views</Tip>
                <Tip done={Object.keys(athlete.metrics).length > 0}>Fill in your key stats</Tip>
                <Tip done={!!athlete.gpa}>Add your GPA</Tip>
                <Tip done={!!athlete.photoUrl}>Add a profile photo</Tip>
                <Tip done={athlete.transferStatus === "ACTIVELY_SEEKING"}>Set status to Actively Seeking</Tip>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Tip({ done, children }: { done: boolean; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <span className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full text-[10px] ${done ? "bg-green-100 text-green-600" : "bg-chalk-200 text-chalk-400"}`}>
        {done ? "✓" : ""}
      </span>
      <span className={done ? "text-chalk-400 line-through" : ""}>{children}</span>
    </li>
  );
}
