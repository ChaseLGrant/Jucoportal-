import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { TRANSFER_STATUSES, VERIFICATION_LEVELS } from "@/lib/constants";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin only." }, { status: 403 });
  }

  const { entity, id, action, value } = await req.json();

  try {
    if (entity === "athlete") {
      if (action === "verify" && (VERIFICATION_LEVELS as readonly string[]).includes(value)) {
        await prisma.athlete.update({ where: { id }, data: { verification: value } });
      } else if (action === "status" && (TRANSFER_STATUSES as readonly string[]).includes(value)) {
        await prisma.athlete.update({ where: { id }, data: { transferStatus: value } });
      } else if (action === "approve") {
        await prisma.athlete.update({ where: { id }, data: { approved: value !== false } });
      } else if (action === "publish") {
        await prisma.athlete.update({ where: { id }, data: { published: value !== false } });
      } else if (action === "delete") {
        await prisma.athlete.delete({ where: { id } });
      } else {
        return NextResponse.json({ error: "Unknown action." }, { status: 400 });
      }
    } else if (entity === "coach") {
      if (action === "verify") {
        await prisma.coach.update({ where: { id }, data: { verified: value !== false } });
      }
    } else if (entity === "report") {
      if (action === "resolve") {
        await prisma.report.update({ where: { id }, data: { status: "resolved" } });
      } else if (action === "delete") {
        await prisma.report.delete({ where: { id } });
      }
    } else if (entity === "sport") {
      if (action === "active") {
        await prisma.sport.update({ where: { id }, data: { active: value !== false } });
      }
    } else {
      return NextResponse.json({ error: "Unknown entity." }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Action failed." }, { status: 500 });
  }
}
