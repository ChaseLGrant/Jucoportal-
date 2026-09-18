import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, createSession } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    const name = String(body.name ?? "").trim();
    const password = String(body.password ?? "");
    const role = body.role === "COACH" ? "COACH" : "ATHLETE";
    const schoolName = String(body.schoolName ?? "").trim();

    if (!email || !name || password.length < 6) {
      return NextResponse.json(
        { error: "Please provide a name, email and a password of at least 6 characters." },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "An account with that email already exists." }, { status: 409 });
    }

    const user = await prisma.user.create({
      data: { email, name, passwordHash: await hashPassword(password), role },
    });

    if (role === "COACH") {
      let schoolId: string | undefined;
      if (schoolName) {
        const slug = slugify(schoolName);
        const school = await prisma.school.upsert({
          where: { slug },
          update: {},
          create: { slug, name: schoolName },
        });
        schoolId = school.id;
      }
      await prisma.coach.create({
        data: { userId: user.id, schoolId, name, email, title: "Coach" },
      });
    }

    await createSession({ uid: user.id, role: role as "COACH" | "ATHLETE", name, email });
    return NextResponse.json({ ok: true, role });
  } catch {
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
