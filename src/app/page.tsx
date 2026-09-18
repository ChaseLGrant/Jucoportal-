import Link from "next/link";
import { prisma } from "@/lib/db";
import { searchAthletes } from "@/lib/athletes";
import { SPORTS } from "@/lib/sports";
import { HeroSearch } from "@/components/hero-search";
import { AthleteCard } from "@/components/athlete-card";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [athleteCount, seekingCount, schoolCount, verifiedCount, featured] =
    await Promise.all([
      prisma.athlete.count({ where: { published: true } }),
      prisma.athlete.count({ where: { published: true, transferStatus: "ACTIVELY_SEEKING" } }),
      prisma.school.count(),
      prisma.athlete.count({ where: { verification: { in: ["COACH_VERIFIED", "PORTAL_VERIFIED"] } } }),
      searchAthletes({ transferStatus: "ACTIVELY_SEEKING", pageSize: 6, sort: "recent" }),
    ]);

  return (
    <>
      {/* ---------------- HERO ---------------- */}
      <section className="relative overflow-hidden bg-ink-950 text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.5]"
          style={{
            backgroundImage:
              "radial-gradient(60% 60% at 15% 0%, rgba(255,90,31,0.22), transparent 60%), radial-gradient(50% 50% at 100% 20%, rgba(37,99,235,0.18), transparent 55%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
        <div className="container-wide relative py-16 sm:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-[12px] font-semibold text-white/80">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              The National JUCO Transfer Database — 100% Free
            </span>
            <h1 className="mt-6 font-display text-5xl font-black uppercase leading-[0.95] tracking-tight sm:text-7xl">
              The <span className="text-accent">JUCO</span> Portal
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg font-medium text-white/80 sm:text-xl">
              The National Database for Junior College Athletes.
            </p>
            <p className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-white/55">
              Find available JUCO athletes. Search by sport, position, academics,
              performance and transfer status. Completely free.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href="/search" className="btn-primary btn-lg">
                Find Players
              </Link>
              <Link
                href="/list-athlete"
                className="btn-lg border border-white/20 bg-white/5 text-white hover:bg-white/10"
              >
                List an Athlete
              </Link>
              <Link
                href="/upload-roster"
                className="btn-lg text-white/70 hover:text-white"
              >
                Upload a Roster →
              </Link>
            </div>
          </div>

          <div className="mx-auto mt-12 max-w-3xl">
            <HeroSearch />
          </div>

          <div className="mx-auto mt-10 grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4">
            <Stat value={`${athleteCount}+`} label="Athletes Listed" />
            <Stat value={`${seekingCount}`} label="Actively Seeking" />
            <Stat value={`${SPORTS.length}`} label="Sports" />
            <Stat value={`${schoolCount}`} label="JUCO Programs" />
          </div>
        </div>
      </section>

      {/* ---------------- PATHWAYS ---------------- */}
      <section className="container-wide -mt-8 grid gap-5 sm:grid-cols-3">
        <Pathway
          eyebrow="College Coaches"
          title="Find the player you need."
          body="Search available JUCO athletes by position, performance, academics, location and transfer status."
          cta="Search Players"
          href="/search"
          tone="dark"
        />
        <Pathway
          eyebrow="JUCO Coaches"
          title="Put your roster in front of four-year programs."
          body="Upload a spreadsheet. We’ll create the profiles automatically — no accounts to build."
          cta="Upload Roster"
          href="/upload-roster"
          tone="accent"
        />
        <Pathway
          eyebrow="JUCO Athletes"
          title="Make yourself discoverable."
          body="Create a free profile with exactly the information college coaches actually need. Two minutes."
          cta="List Myself"
          href="/list-athlete"
          tone="light"
        />
      </section>

      {/* ---------------- FEATURED ATHLETES ---------------- */}
      <section className="container-wide mt-20">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Live Board</p>
            <h2 className="mt-1 font-display text-3xl font-extrabold tracking-tight text-ink-900">
              Actively seeking right now
            </h2>
          </div>
          <Link href="/search" className="btn-outline btn-md hidden sm:inline-flex">
            View all {athleteCount}
          </Link>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.athletes.map((a) => (
            <AthleteCard key={a.id} athlete={a} />
          ))}
        </div>
      </section>

      {/* ---------------- SPORTS GRID ---------------- */}
      <section className="container-wide mt-20">
        <p className="eyebrow">Browse the database</p>
        <h2 className="mt-1 font-display text-3xl font-extrabold tracking-tight text-ink-900">
          Every sport. One database.
        </h2>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {SPORTS.map((s) => (
            <Link
              key={s.slug}
              href={`/${s.slug}`}
              className="group flex items-center justify-between rounded-xl border border-chalk-200 bg-white px-4 py-3.5 shadow-card transition-all hover:-translate-y-0.5 hover:border-ink-900 hover:shadow-cardhover"
            >
              <span className="text-sm font-bold text-ink-900">{s.name}</span>
              <span className="text-chalk-300 transition-colors group-hover:text-accent">→</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------------- HOW IT WORKS ---------------- */}
      <section className="container-wide mt-20">
        <div className="rounded-3xl bg-ink-900 p-8 text-white sm:p-12">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-accent">
            No friction. No complicated profiles.
          </p>
          <h2 className="mt-2 max-w-2xl font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            The fastest way in America to discover JUCO athletes.
          </h2>
          <div className="mt-8 grid gap-8 sm:grid-cols-3">
            <Step n="01" title="Search instantly" body="No login required. Filter by sport, position, academics and transfer status." />
            <Step n="02" title="View real profiles" body="Verified metrics, film, academics and direct coach contact information." />
            <Step n="03" title="Make contact" body="Email the athlete or their JUCO coach directly. We connect — we don’t trap." />
          </div>
        </div>
      </section>

      <div className="h-8" />
    </>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-center">
      <div className="font-display text-2xl font-black text-white">{value}</div>
      <div className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-white/50">
        {label}
      </div>
    </div>
  );
}

function Pathway({
  eyebrow,
  title,
  body,
  cta,
  href,
  tone,
}: {
  eyebrow: string;
  title: string;
  body: string;
  cta: string;
  href: string;
  tone: "dark" | "accent" | "light";
}) {
  const tones = {
    dark: "bg-ink-900 text-white border-ink-900",
    accent: "bg-accent text-white border-accent",
    light: "bg-white text-ink-900 border-chalk-200",
  }[tone];
  const btn =
    tone === "light"
      ? "btn-dark btn-md w-full"
      : "btn-md w-full bg-white text-ink-900 hover:bg-chalk-100";
  const eyebrowClass = tone === "light" ? "text-accent" : "text-white/70";
  const bodyClass = tone === "light" ? "text-chalk-500" : "text-white/75";
  return (
    <div className={`flex flex-col rounded-2xl border p-6 shadow-card ${tones}`}>
      <p className={`text-[11px] font-bold uppercase tracking-[0.12em] ${eyebrowClass}`}>
        {eyebrow}
      </p>
      <h3 className="mt-2 font-display text-xl font-extrabold leading-snug tracking-tight">
        {title}
      </h3>
      <p className={`mt-2 flex-1 text-sm leading-relaxed ${bodyClass}`}>{body}</p>
      <Link href={href} className={`mt-5 ${btn}`}>
        {cta}
      </Link>
    </div>
  );
}

function Step({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div>
      <div className="font-display text-3xl font-black text-accent">{n}</div>
      <h4 className="mt-2 text-lg font-bold">{title}</h4>
      <p className="mt-1.5 text-sm leading-relaxed text-white/65">{body}</p>
    </div>
  );
}
