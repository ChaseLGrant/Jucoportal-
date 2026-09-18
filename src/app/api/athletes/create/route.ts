import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSport } from "@/lib/sports";
import { slugify } from "@/lib/utils";
import { getSession } from "@/lib/auth";

async function uniqueSlug(base: string) {
  let slug = base || "athlete";
  let n = 1;
  while (await prisma.athlete.findUnique({ where: { slug } })) {
    slug = `${base}-${++n}`;
  }
  return slug;
}

export async function POST(req: Request) {
  try {
    const b = await req.json();
    const firstName = String(b.firstName ?? "").trim();
    const lastName = String(b.lastName ?? "").trim();
    const sportSlug = String(b.sport ?? "").trim();

    if (!firstName || !lastName || !sportSlug) {
      return NextResponse.json({ error: "First name, last name and sport are required." }, { status: 400 });
    }
    const sportDef = getSport(sportSlug);
    const sport = await prisma.sport.findUnique({ where: { slug: sportSlug } });
    if (!sportDef || !sport) {
      return NextResponse.json({ error: "Unknown sport." }, { status: 400 });
    }

    // collect only metric keys that belong to this sport
    const metrics: Record<string, string | number> = {};
    const incoming = b.metrics ?? {};
    for (const f of sportDef.fields) {
      const v = incoming[f.key];
      if (v !== undefined && v !== null && v !== "") {
        metrics[f.key] = f.type === "number" ? Number(v) : String(v);
      }
    }

    // resolve school by name (optional)
    let schoolId: string | undefined;
    const schoolName = String(b.schoolName ?? "").trim();
    if (schoolName) {
      const slug = slugify(schoolName);
      const school = await prisma.school.upsert({
        where: { slug },
        update: {},
        create: {
          slug,
          name: schoolName,
          state: b.state ? String(b.state) : undefined,
          city: b.city ? String(b.city) : undefined,
        },
      });
      schoolId = school.id;
    }

    const session = await getSession();
    const slug = await uniqueSlug(slugify(`${firstName}-${lastName}`));

    const filmLinks = Array.isArray(b.filmLinks)
      ? b.filmLinks.filter(Boolean)
      : b.filmLink
      ? [String(b.filmLink)]
      : [];

    const athlete = await prisma.athlete.create({
      data: {
        slug,
        firstName,
        lastName,
        sportId: sport.id,
        schoolId,
        schoolName: schoolName || null,
        positions: b.positions ? String(b.positions) : null,
        classYear: b.classYear ? String(b.classYear) : null,
        transferYear: b.transferYear ? Number(b.transferYear) : null,
        transferSemester: b.transferSemester ? String(b.transferSemester) : null,
        transferStatus: b.transferStatus ? String(b.transferStatus) : "ACTIVELY_SEEKING",
        eligibilityYears: b.eligibilityYears ? Number(b.eligibilityYears) : null,
        heightInches: b.heightInches ? Number(b.heightInches) : null,
        weightLbs: b.weightLbs ? Number(b.weightLbs) : null,
        handedness: b.handedness ? String(b.handedness) : null,
        city: b.city ? String(b.city) : null,
        state: b.state ? String(b.state) : null,
        gpa: b.gpa ? Number(b.gpa) : null,
        major: b.major ? String(b.major) : null,
        creditsCompleted: b.creditsCompleted ? Number(b.creditsCompleted) : null,
        expectedGraduation: b.expectedGraduation ? String(b.expectedGraduation) : null,
        academicInterests: b.academicInterests ? String(b.academicInterests) : null,
        metrics: JSON.stringify(metrics),
        photoUrl: b.photoUrl ? String(b.photoUrl) : null,
        filmLinks: JSON.stringify(filmLinks),
        bio: b.bio ? String(b.bio) : null,
        playerEmail: b.playerEmail ? String(b.playerEmail) : null,
        playerPhone: b.playerPhone ? String(b.playerPhone) : null,
        showEmail: !!b.showEmail,
        showPhone: !!b.showPhone,
        coachName: b.coachName ? String(b.coachName) : null,
        coachTitle: b.coachTitle ? String(b.coachTitle) : null,
        coachEmail: b.coachEmail ? String(b.coachEmail) : null,
        coachPhone: b.coachPhone ? String(b.coachPhone) : null,
        verification: "SUBMITTED",
        published: true,
        approved: true,
        claimedById: session?.role === "ATHLETE" ? session.uid : undefined,
      },
    });

    return NextResponse.json({ ok: true, slug: athlete.slug });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Could not create profile." }, { status: 500 });
  }
}
