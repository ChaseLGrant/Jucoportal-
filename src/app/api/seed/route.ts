import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { seedDatabase } from "../../../../prisma/seed";

// Allow up to 60s on platforms that support it (Vercel).
export const maxDuration = 60;
export const dynamic = "force-dynamic";

async function handle(req: Request) {
  const secret = process.env.SEED_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "Seeding is disabled. Set the SEED_SECRET environment variable to enable it." },
      { status: 403 }
    );
  }
  const token = new URL(req.url).searchParams.get("token");
  if (token !== secret) {
    return NextResponse.json({ error: "Invalid or missing token." }, { status: 401 });
  }

  try {
    const result = await seedDatabase(prisma);
    return NextResponse.json({
      ok: true,
      message: "Database seeded with fresh demo data.",
      ...result,
      logins: {
        admin: "admin@jucoportal.com",
        coach: "coach@jucoportal.com",
        athlete: "athlete@jucoportal.com",
        password: "password123",
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Seeding failed. Check server logs." }, { status: 500 });
  }
}

export async function GET(req: Request) {
  return handle(req);
}
export async function POST(req: Request) {
  return handle(req);
}
