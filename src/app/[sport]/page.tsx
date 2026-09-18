import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getSport, SPORTS, sportName } from "@/lib/sports";
import { searchAthletes } from "@/lib/athletes";
import { prisma } from "@/lib/db";
import { AthleteCard } from "@/components/athlete-card";
import { absoluteUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return SPORTS.map((s) => ({ sport: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sport: string }>;
}): Promise<Metadata> {
  const { sport } = await params;
  const def = getSport(sport);
  if (!def) return { title: "Sport not found" };
  const name = def.name;
  return {
    title: `${name} JUCO Transfers — Available Junior College ${name} Players`,
    description: `Browse available ${name} junior-college athletes on The JUCO Portal. Search JUCO ${name} transfers by position, stats, academics and transfer year. Free, no account required.`,
    alternates: { canonical: absoluteUrl(`/${sport}`) },
    openGraph: {
      title: `${name} JUCO Transfers`,
      description: `Available junior-college ${name} athletes, searchable and free.`,
    },
  };
}

export default async function SportLandingPage({
  params,
}: {
  params: Promise<{ sport: string }>;
}) {
  const { sport } = await params;
  const def = getSport(sport);
  if (!def) notFound();

  const [result, total, seeking] = await Promise.all([
    searchAthletes({ sport, pageSize: 12, sort: "recent" }),
    prisma.athlete.count({ where: { published: true, sport: { slug: sport } } }),
    prisma.athlete.count({ where: { published: true, sport: { slug: sport }, transferStatus: "ACTIVELY_SEEKING" } }),
  ]);

  const name = def.name;
  const others = SPORTS.filter((s) => s.slug !== sport).slice(0, 8);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${name} JUCO Transfers`,
    description: `Available junior-college ${name} athletes on The JUCO Portal.`,
    url: absoluteUrl(`/${sport}`),
  };

  return (
    <div className="bg-chalk-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="bg-ink-950 text-white">
        <div className="container-wide py-14">
          <p className="eyebrow">JUCO {name}</p>
          <h1 className="mt-2 max-w-3xl font-display text-4xl font-black tracking-tight sm:text-5xl">
            Available {name} JUCO Transfers
          </h1>
          <p className="mt-3 max-w-2xl text-white/70">
            The national database of junior-college {name.toLowerCase()} athletes. {total} listed,{" "}
            {seeking} actively seeking four-year opportunities right now. Search by position,
            performance and academics — completely free.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={`/search?sport=${sport}`} className="btn-primary btn-lg">
              Search all {name} athletes
            </Link>
            <Link href={`/search?sport=${sport}&transferStatus=ACTIVELY_SEEKING`} className="btn-lg border border-white/20 bg-white/5 text-white hover:bg-white/10">
              Actively seeking ({seeking})
            </Link>
          </div>
        </div>
      </section>

      <div className="container-wide py-10">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-2xl font-extrabold tracking-tight text-ink-900">
            Latest {name} athletes
          </h2>
          <Link href={`/search?sport=${sport}`} className="text-sm font-semibold text-accent hover:underline">
            View all {total} →
          </Link>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {result.athletes.map((a) => (
            <AthleteCard key={a.id} athlete={a} />
          ))}
        </div>

        {/* SEO copy */}
        <div className="mt-12 max-w-3xl">
          <h2 className="font-display text-xl font-bold text-ink-900">
            Find JUCO {name.toLowerCase()} transfers
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-chalk-500">
            The JUCO Portal is the fastest way for four-year college coaches to discover available
            junior-college {name.toLowerCase()} players. Every profile includes verified performance
            metrics, academics, remaining eligibility, film and direct contact information for the
            athlete and their current JUCO coach. Filter by position, transfer year, GPA and state to
            find exactly the {name.toLowerCase()} recruit your program needs — no account, no paywall.
          </p>
        </div>

        {/* other sports */}
        <div className="mt-12 border-t border-chalk-200 pt-8">
          <p className="label">Explore other sports</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {others.map((s) => (
              <Link
                key={s.slug}
                href={`/${s.slug}`}
                className="rounded-full border border-chalk-200 bg-white px-3.5 py-1.5 text-sm font-semibold text-ink-700 hover:border-ink-900 hover:text-ink-900"
              >
                {sportName(s.slug)}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
