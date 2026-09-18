import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { serializeAthlete } from "@/lib/athletes";
import { AthleteCard } from "@/components/athlete-card";
import { absoluteUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const school = await prisma.school.findUnique({ where: { slug } });
  if (!school) return { title: "School not found" };
  return {
    title: `${school.name} — JUCO Transfer Athletes`,
    description: `Available junior-college transfer athletes from ${school.name}${school.state ? `, ${school.state}` : ""}. View rosters, stats and contact info on The JUCO Portal.`,
    alternates: { canonical: absoluteUrl(`/schools/${slug}`) },
  };
}

export default async function SchoolPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const school = await prisma.school.findUnique({
    where: { slug },
    include: {
      athletes: {
        where: { published: true, approved: true },
        include: { sport: true, school: true },
        orderBy: { updatedAt: "desc" },
      },
    },
  });
  if (!school) notFound();

  const athletes = school.athletes.map(serializeAthlete);
  const bySport = new Map<string, number>();
  for (const a of athletes) bySport.set(a.sportName, (bySport.get(a.sportName) ?? 0) + 1);

  return (
    <div className="bg-chalk-50">
      <section className="bg-ink-950 text-white">
        <div className="container-wide py-12">
          <p className="eyebrow">JUCO Program</p>
          <h1 className="mt-2 font-display text-4xl font-black tracking-tight sm:text-5xl">
            {school.name}
          </h1>
          <p className="mt-2 text-white/70">
            {[school.city, school.state].filter(Boolean).join(", ")}
            {school.conference ? ` • ${school.conference}` : ""} • {athletes.length} athletes listed
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {[...bySport.entries()].map(([sportLabel, count]) => (
              <span key={sportLabel} className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-sm text-white/80">
                {sportLabel} · {count}
              </span>
            ))}
          </div>
        </div>
      </section>

      <div className="container-wide py-10">
        {athletes.length === 0 ? (
          <p className="text-chalk-500">No athletes listed for this program yet.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {athletes.map((a) => (
              <AthleteCard key={a.id} athlete={a} />
            ))}
          </div>
        )}
        <div className="mt-10">
          <Link href="/search" className="btn-outline btn-md">← Back to search</Link>
        </div>
      </div>
    </div>
  );
}
