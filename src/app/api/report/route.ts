import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { athleteId, reason, details } = await req.json();
    if (!athleteId || !reason) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    const athlete = await prisma.athlete.findUnique({ where: { id: athleteId } });
    if (!athlete) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.report.create({
      data: { athleteId, reason: String(reason).slice(0, 120), details: String(details ?? "").slice(0, 1000) },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
