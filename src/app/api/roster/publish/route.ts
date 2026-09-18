import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getSport } from "@/lib/sports";
import { slugify, parseHeight } from "@/lib/utils";

function normalizeStatus(raw?: string): string {
  const s = (raw ?? "").toLowerCase();
  if (s.includes("commit")) return "COMMITTED";
  if (s.includes("return")) return "RETURNING";
  if (s.includes("open")) return "OPEN";
  return "ACTIVELY_SEEKING";
}

function splitName(full: string): { first: string; last: string } {
  const parts = full.trim().split(/\s+/);
  if (parts.length === 1) return { first: parts[0], last: "" };
  // handle "Last, First"
  if (full.includes(",")) {
    const [last, first] = full.split(",").map((p) => p.trim());
    return { first: first ?? "", last: last ?? "" };
  }
  return { first: parts[0], last: parts.slice(1).join(" ") };
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "COACH") {
    return NextResponse.json({ error: "You must be signed in as a coach." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const sportSlug = String(body.sport ?? "");
    const mapping: Record<string, string> = body.mapping ?? {};
    const rows: Record<string, string>[] = body.rows ?? [];
    const filename = String(body.filename ?? "roster");

    const sportDef = getSport(sportSlug);
    const sport = await prisma.sport.findUnique({ where: { slug: sportSlug } });
    if (!sportDef || !sport) {
      return NextResponse.json({ error: "Please choose a valid sport." }, { status: 400 });
    }

    const coach = await prisma.coach.findUnique({
      where: { userId: session.uid },
      include: { school: true },
    });
    if (!coach) return NextResponse.json({ error: "Coach profile not found." }, { status: 400 });

    // invert mapping: targetKey -> header
    const byTarget: Record<string, string> = {};
    for (const [header, target] of Object.entries(mapping)) {
      if (target) byTarget[target] = header;
    }
    const val = (row: Record<string, string>, target: string): string => {
      const h = byTarget[target];
      return h != null ? String(row[h] ?? "").trim() : "";
    };

    const upload = await prisma.rosterUpload.create({
      data: {
        coachId: coach.id,
        filename,
        status: "published",
        rowsTotal: rows.length,
        mapping: JSON.stringify(mapping),
      },
    });

    let created = 0;
    let skipped = 0;
    const usedSlugs = new Set<string>();

    for (const row of rows) {
      let first = val(row, "firstName");
      let last = val(row, "lastName");
      const full = val(row, "fullName");
      if ((!first && !last) && full) {
        const s = splitName(full);
        first = s.first;
        last = s.last;
      }
      if (!first && !last) {
        skipped++;
        continue;
      }

      const metrics: Record<string, string | number> = {};
      for (const f of sportDef.fields) {
        const v = val(row, `metric:${f.key}`);
        if (v) metrics[f.key] = f.type === "number" ? Number(v) : v;
      }

      const schoolName = val(row, "schoolName") || coach.school?.name || null;
      const heightStr = val(row, "heightInches");
      const gpaStr = val(row, "gpa");
      const weightStr = val(row, "weightLbs");
      const transferYearStr = val(row, "transferYear");
      const eligStr = val(row, "eligibilityYears");

      let base = slugify(`${first}-${last}`) || "athlete";
      let slug = base;
      let n = 1;
      while (usedSlugs.has(slug) || (await prisma.athlete.findUnique({ where: { slug } }))) {
        slug = `${base}-${++n}`;
      }
      usedSlugs.add(slug);

      await prisma.athlete.create({
        data: {
          slug,
          firstName: first || last,
          lastName: last,
          sportId: sport.id,
          schoolId: coach.schoolId ?? undefined,
          schoolName,
          positions: val(row, "positions") || null,
          classYear: val(row, "classYear") || null,
          transferYear: transferYearStr ? parseInt(transferYearStr, 10) || null : null,
          transferSemester: val(row, "transferSemester") || null,
          transferStatus: normalizeStatus(val(row, "transferStatus")),
          eligibilityYears: eligStr ? parseInt(eligStr, 10) || null : null,
          heightInches: parseHeight(heightStr),
          weightLbs: weightStr ? parseInt(weightStr, 10) || null : null,
          handedness: val(row, "handedness") || null,
          city: val(row, "city") || coach.school?.city || null,
          state: val(row, "state") || coach.school?.state || null,
          gpa: gpaStr ? parseFloat(gpaStr) || null : null,
          major: val(row, "major") || null,
          creditsCompleted: val(row, "creditsCompleted") ? parseInt(val(row, "creditsCompleted"), 10) || null : null,
          metrics: JSON.stringify(metrics),
          playerEmail: val(row, "playerEmail") || null,
          playerPhone: val(row, "playerPhone") || null,
          showEmail: false,
          showPhone: false,
          coachName: coach.name,
          coachTitle: coach.title,
          coachEmail: coach.email,
          coachPhone: coach.phone,
          verification: "COACH_VERIFIED",
          published: true,
          approved: true,
          uploadId: upload.id,
        },
      });
      created++;
    }

    await prisma.rosterUpload.update({
      where: { id: upload.id },
      data: { rowsReady: created, rowsError: skipped },
    });

    return NextResponse.json({ ok: true, created, skipped, uploadId: upload.id });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Could not publish roster." }, { status: 500 });
  }
}
