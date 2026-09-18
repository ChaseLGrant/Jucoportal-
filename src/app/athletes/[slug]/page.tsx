import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getAthleteBySlug } from "@/lib/athletes";
import { getSport } from "@/lib/sports";
import { formatHeight, youtubeEmbed, absoluteUrl } from "@/lib/utils";
import { StatusBadge, VerificationBadge } from "@/components/badges";
import { AthleteAvatar } from "@/components/athlete-avatar";
import { ContactReveal } from "@/components/contact-reveal";
import { ReportButton } from "@/components/report-button";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const a = await getAthleteBySlug(slug);
  if (!a) return { title: "Athlete not found" };
  const pos = a.positions[0] ?? a.sportName;
  const desc = `${a.name} — ${pos}${a.schoolName ? ` at ${a.schoolName}` : ""}. ${a.sportName} JUCO transfer, available ${a.transferSemester ?? ""} ${a.transferYear ?? ""}. View stats, academics, film and contact info on The JUCO Portal.`;
  return {
    title: `${a.name} — ${pos}, ${a.sportName}`,
    description: desc,
    openGraph: { title: `${a.name} — ${pos}`, description: desc, type: "profile" },
    alternates: { canonical: absoluteUrl(`/athletes/${a.slug}`) },
  };
}

export default async function AthleteProfile({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const a = await getAthleteBySlug(slug, true);
  if (!a) notFound();

  const sport = getSport(a.sportSlug);
  const athleticFields = (sport?.fields ?? []).filter((f) => f.group === "athletic");
  const perfFields = (sport?.fields ?? []).filter((f) => f.group === "performance");

  const metric = (key: string) => {
    const v = a.metrics[key];
    return v == null || v === "" ? null : String(v);
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: a.name,
    jobTitle: `${a.positions[0] ?? ""} — ${a.sportName} Athlete`.trim(),
    affiliation: a.schoolName ? { "@type": "CollegeOrUniversity", name: a.schoolName } : undefined,
    address: a.city || a.state ? { "@type": "PostalAddress", addressLocality: a.city, addressRegion: a.state } : undefined,
    url: absoluteUrl(`/athletes/${a.slug}`),
  };

  return (
    <div className="bg-chalk-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* breadcrumb */}
      <div className="border-b border-chalk-200 bg-white">
        <div className="container-wide flex items-center gap-2 py-3 text-xs text-chalk-400">
          <Link href="/search" className="hover:text-accent">Search</Link>
          <span>/</span>
          <Link href={`/${a.sportSlug}`} className="hover:text-accent">{a.sportName}</Link>
          <span>/</span>
          <span className="text-ink-700">{a.name}</span>
        </div>
      </div>

      {/* HEADER */}
      <div className="bg-ink-950 text-white">
        <div className="container-wide py-8 sm:py-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <AthleteAvatar
              first={a.firstName}
              last={a.lastName}
              photoUrl={a.photoUrl}
              className="h-28 w-28 shrink-0 rounded-2xl ring-4 ring-white/10 sm:h-32 sm:w-32"
              textClass="text-4xl"
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-accent px-2 py-0.5 text-xs font-bold uppercase tracking-wide">
                  {a.positions.join(" / ") || a.sportName}
                </span>
                <VerificationBadge level={a.verification} />
              </div>
              <h1 className="mt-2 font-display text-4xl font-black tracking-tight sm:text-5xl">
                {a.name}
              </h1>
              <p className="mt-1 text-white/70">
                {a.schoolName}
                {a.city ? ` • ${a.city}` : ""}
                {a.state ? `, ${a.state}` : ""}
              </p>
              <div className="mt-4">
                <StatusBadge status={a.transferStatus} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 sm:flex sm:flex-col sm:items-end sm:gap-1">
              <HeaderStat value={formatHeight(a.heightInches)} label="Height" />
              <HeaderStat value={a.weightLbs ? `${a.weightLbs}` : "—"} label="Weight" />
              <HeaderStat value={a.eligibilityYears ? `${a.eligibilityYears}y` : "—"} label="Elig." />
            </div>
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className="container-wide py-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="space-y-6">
            <Section title="Athletic Information">
              <Grid>
                <Info label="Position" value={a.positions.join(", ") || "—"} />
                <Info label="Height" value={formatHeight(a.heightInches)} />
                <Info label="Weight" value={a.weightLbs ? `${a.weightLbs} lbs` : "—"} />
                <Info label="Class" value={a.classYear ?? "—"} />
                {a.handedness && <Info label="Handedness" value={a.handedness} />}
                {athleticFields.map((f) =>
                  metric(f.key) ? <Info key={f.key} label={f.label} value={`${metric(f.key)}${f.unit ? ` ${f.unit}` : ""}`} /> : null
                )}
              </Grid>
            </Section>

            {perfFields.some((f) => metric(f.key)) && (
              <Section title="Performance">
                <Grid>
                  {perfFields.map((f) =>
                    metric(f.key) ? (
                      <Info key={f.key} label={f.label} value={`${metric(f.key)}${f.unit ? ` ${f.unit}` : ""}`} highlight />
                    ) : null
                  )}
                </Grid>
              </Section>
            )}

            <Section title="Academics">
              <Grid>
                <Info label="GPA" value={a.gpa ? a.gpa.toFixed(2) : "—"} highlight />
                <Info label="Major" value={a.major ?? "—"} />
                <Info label="Credits Completed" value={a.creditsCompleted ? `${a.creditsCompleted}` : "—"} />
                <Info label="Expected Transfer" value={a.expectedGraduation ?? "—"} />
                {a.academicInterests && <Info label="Academic Interests" value={a.academicInterests} />}
              </Grid>
            </Section>

            <Section title="Eligibility">
              <Grid>
                <Info label="Remaining Eligibility" value={a.eligibilityYears ? `${a.eligibilityYears} year(s)` : "—"} highlight />
                <Info label="Transfer Semester" value={a.transferSemester && a.transferYear ? `${a.transferSemester} ${a.transferYear}` : "—"} />
                <Info label="Transfer Status" value={<StatusBadge status={a.transferStatus} size="sm" />} />
              </Grid>
            </Section>

            {a.filmLinks.length > 0 && (
              <Section title="Film & Highlights">
                <div className="space-y-4">
                  {a.filmLinks.map((url, i) => {
                    const embed = youtubeEmbed(url);
                    return embed ? (
                      <div key={i} className="aspect-video overflow-hidden rounded-xl bg-black">
                        <iframe
                          src={embed}
                          title={`Film ${i + 1}`}
                          className="h-full w-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    ) : (
                      <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="btn-outline btn-md">
                        ▶ Watch film / highlights
                      </a>
                    );
                  })}
                </div>
              </Section>
            )}

            {a.bio && (
              <Section title="About">
                <p className="text-sm leading-relaxed text-ink-700">{a.bio}</p>
              </Section>
            )}
          </div>

          {/* SIDEBAR — contact */}
          <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
            <div className="card p-5">
              <p className="eyebrow">Contact Player</p>
              <h3 className="mt-1 font-display text-lg font-bold text-ink-900">{a.name}</h3>
              <div className="mt-3">
                {a.showEmail || a.showPhone ? (
                  <ContactReveal
                    email={a.showEmail ? a.playerEmail : null}
                    phone={a.showPhone ? a.playerPhone : null}
                    label="Email Player"
                    accent
                  />
                ) : (
                  <p className="rounded-lg bg-chalk-50 px-3 py-2.5 text-sm text-chalk-500">
                    This athlete has kept personal contact private. Reach out via their JUCO coach below.
                  </p>
                )}
              </div>
            </div>

            <div className="card border-accent/30 p-5">
              <p className="eyebrow">Current JUCO Coach</p>
              <h3 className="mt-1 font-display text-lg font-bold text-ink-900">{a.coachName ?? "Coaching Staff"}</h3>
              <p className="text-sm text-chalk-500">
                {a.coachTitle}
                {a.schoolName ? ` • ${a.schoolName}` : ""}
              </p>
              <div className="mt-3">
                <ContactReveal email={a.coachEmail} phone={a.coachPhone} label="Email Coach" />
              </div>
            </div>

            <div className="flex items-center justify-between px-1">
              <span className="text-xs text-chalk-400">{a.views} profile views</span>
              <ReportButton athleteId={a.id} />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function HeaderStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center sm:text-right">
      <div className="font-display text-xl font-black text-white">{value}</div>
      <div className="text-[10px] font-semibold uppercase tracking-wide text-white/40">{label}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="card p-5 sm:p-6">
      <h2 className="mb-4 font-display text-sm font-bold uppercase tracking-wide text-ink-900">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3">{children}</div>;
}

function Info({
  label,
  value,
  highlight,
}: {
  label: string;
  value: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-wide text-chalk-400">{label}</div>
      <div className={`mt-0.5 font-semibold ${highlight ? "font-display text-lg font-extrabold text-ink-900" : "text-sm text-ink-800"}`}>
        {value}
      </div>
    </div>
  );
}
