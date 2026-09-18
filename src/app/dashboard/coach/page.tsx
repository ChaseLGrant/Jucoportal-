import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { CoachRoster, type RosterAthlete } from "@/components/coach-roster";

export const dynamic = "force-dynamic";

export default async function CoachDashboard() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "COACH") redirect(session.role === "ADMIN" ? "/admin" : "/dashboard/athlete");

  const coach = await prisma.coach.findUnique({
    where: { userId: session.uid },
    include: { school: true, uploads: { select: { id: true } } },
  });
  if (!coach) redirect("/");

  const uploadIds = coach.uploads.map((u) => u.id);
  const athletesRaw = await prisma.athlete.findMany({
    where: { uploadId: { in: uploadIds } },
    include: { sport: true },
    orderBy: { lastName: "asc" },
  });

  const athletes: RosterAthlete[] = athletesRaw.map((a) => ({
    id: a.id,
    slug: a.slug,
    name: `${a.firstName} ${a.lastName}`,
    sportName: a.sport.name,
    position: a.positions?.split(",")[0]?.trim() ?? "",
    transferStatus: a.transferStatus,
    verification: a.verification,
    gpa: a.gpa,
  }));

  const count = (s: string) => athletes.filter((a) => a.transferStatus === s).length;

  return (
    <div className="bg-chalk-50 min-h-[calc(100vh-4rem)]">
      <div className="bg-ink-950 text-white">
        <div className="container-wide py-8">
          <p className="eyebrow">Coach Dashboard</p>
          <h1 className="mt-1 font-display text-3xl font-black tracking-tight">
            {coach.name}
          </h1>
          <p className="mt-1 text-white/60">
            {coach.title}{coach.school ? ` • ${coach.school.name}` : ""}
          </p>
        </div>
      </div>

      <div className="container-wide -mt-6 pb-12">
        <div className="grid gap-4 sm:grid-cols-4">
          <BigStat value={athletes.length} label="Athletes" tone="dark" />
          <BigStat value={count("ACTIVELY_SEEKING")} label="Actively Seeking" tone="green" />
          <BigStat value={count("OPEN")} label="Open to Opportunities" tone="amber" />
          <BigStat value={count("COMMITTED")} label="Committed" tone="blue" />
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/list-athlete" className="btn-dark btn-md">+ Add Athlete</Link>
          <Link href="/upload-roster" className="btn-primary btn-md">Upload Roster</Link>
        </div>

        <div className="mt-6">
          <CoachRoster athletes={athletes} />
        </div>
      </div>
    </div>
  );
}

function BigStat({
  value,
  label,
  tone,
}: {
  value: number;
  label: string;
  tone: "dark" | "green" | "amber" | "blue";
}) {
  const colors = {
    dark: "text-ink-900",
    green: "text-green-600",
    amber: "text-amber-600",
    blue: "text-blue-600",
  }[tone];
  return (
    <div className="card px-5 py-4">
      <div className={`font-display text-3xl font-black ${colors}`}>{value}</div>
      <div className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-chalk-400">{label}</div>
    </div>
  );
}
