import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getSport } from "@/lib/sports";
import { TRANSFER_STATUSES, VERIFICATION_LEVELS } from "@/lib/constants";
import { safeJson } from "@/lib/utils";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const b = await req.json();
  const id = String(b.id ?? "");
  if (!id) return NextResponse.json({ error: "Missing athlete id." }, { status: 400 });

  const athlete = await prisma.athlete.findUnique({
    where: { id },
    include: { upload: true, sport: true },
  });
  if (!athlete) return NextResponse.json({ error: "Not found." }, { status: 404 });

  // permission check
  let allowed = false;
  if (session.role === "ADMIN") allowed = true;
  else if (session.role === "COACH") {
    const coach = await prisma.coach.findUnique({ where: { userId: session.uid } });
    allowed = !!coach && athlete.upload?.coachId === coach.id;
  } else if (session.role === "ATHLETE") {
    allowed = athlete.claimedById === session.uid;
  }
  if (!allowed) return NextResponse.json({ error: "You can't edit this athlete." }, { status: 403 });

  const data: Record<string, unknown> = {};

  if (typeof b.transferStatus === "string" && (TRANSFER_STATUSES as readonly string[]).includes(b.transferStatus)) {
    data.transferStatus = b.transferStatus;
  }
  // only admins / coaches may change verification (athletes can't self-verify)
  if (typeof b.verification === "string" && (VERIFICATION_LEVELS as readonly string[]).includes(b.verification) && session.role !== "ATHLETE") {
    data.verification = b.verification;
  }

  const strFields = ["positions", "classYear", "transferSemester", "major", "expectedGraduation", "bio", "playerEmail", "playerPhone", "coachName", "coachTitle", "coachEmail", "coachPhone", "photoUrl", "academicInterests", "handedness"];
  for (const f of strFields) if (typeof b[f] === "string") data[f] = b[f];

  const numFields = ["transferYear", "eligibilityYears", "heightInches", "weightLbs", "creditsCompleted"];
  for (const f of numFields) if (b[f] !== undefined && b[f] !== "") data[f] = Number(b[f]);
  if (b.gpa !== undefined && b.gpa !== "") data.gpa = Number(b.gpa);

  if (typeof b.showEmail === "boolean") data.showEmail = b.showEmail;
  if (typeof b.showPhone === "boolean") data.showPhone = b.showPhone;

  if (Array.isArray(b.filmLinks)) data.filmLinks = JSON.stringify(b.filmLinks.filter(Boolean));

  // merge metrics for this sport
  if (b.metrics && typeof b.metrics === "object") {
    const sportDef = getSport(athlete.sport.slug);
    const current = safeJson<Record<string, string | number>>(athlete.metrics, {});
    for (const f of sportDef?.fields ?? []) {
      if (b.metrics[f.key] !== undefined) {
        const v = b.metrics[f.key];
        if (v === "" || v == null) delete current[f.key];
        else current[f.key] = f.type === "number" ? Number(v) : String(v);
      }
    }
    data.metrics = JSON.stringify(current);
  }

  await prisma.athlete.update({ where: { id }, data });
  return NextResponse.json({ ok: true });
}
