import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { SPORTS } from "@/lib/sports";
import { AdminPanel } from "@/components/admin-panel";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "ADMIN") redirect(session.role === "COACH" ? "/dashboard/coach" : "/dashboard/athlete");

  const [
    totalAthletes, published, pending, verified, portalVerified,
    schools, coaches, verifiedCoaches, openReports, uploadsCount,
    recentAthletes, reports, coachList, sportRows, uploads, byStatus,
  ] = await Promise.all([
    prisma.athlete.count(),
    prisma.athlete.count({ where: { published: true } }),
    prisma.athlete.count({ where: { approved: false } }),
    prisma.athlete.count({ where: { verification: { in: ["COACH_VERIFIED", "PORTAL_VERIFIED"] } } }),
    prisma.athlete.count({ where: { verification: "PORTAL_VERIFIED" } }),
    prisma.school.count(),
    prisma.coach.count(),
    prisma.coach.count({ where: { verified: true } }),
    prisma.report.count({ where: { status: "open" } }),
    prisma.rosterUpload.count(),
    prisma.athlete.findMany({
      take: 50, orderBy: { createdAt: "desc" },
      include: { sport: true, school: true },
    }),
    prisma.report.findMany({
      where: { status: "open" }, take: 50, orderBy: { createdAt: "desc" },
      include: { athlete: { select: { slug: true, firstName: true, lastName: true } } },
    }),
    prisma.coach.findMany({ take: 50, include: { school: true }, orderBy: { name: "asc" } }),
    prisma.sport.findMany({ include: { _count: { select: { fields: true, athletes: true } } }, orderBy: { order: "asc" } }),
    prisma.rosterUpload.findMany({ take: 30, orderBy: { createdAt: "desc" }, include: { coach: true } }),
    prisma.athlete.groupBy({ by: ["transferStatus"], _count: true }),
  ]);

  const bySport = await Promise.all(
    SPORTS.map(async (s) => ({
      name: s.name,
      count: await prisma.athlete.count({ where: { sport: { slug: s.slug } } }),
    }))
  );

  const data = {
    stats: { totalAthletes, published, pending, verified, portalVerified, schools, coaches, verifiedCoaches, openReports, uploadsCount },
    byStatus: byStatus.map((s) => ({ status: s.transferStatus, count: s._count })),
    bySport,
    athletes: recentAthletes.map((a) => ({
      id: a.id, slug: a.slug, name: `${a.firstName} ${a.lastName}`,
      sportName: a.sport.name, schoolName: a.school?.name ?? a.schoolName ?? "—",
      verification: a.verification, transferStatus: a.transferStatus,
      approved: a.approved, published: a.published,
    })),
    reports: reports.map((r) => ({
      id: r.id, reason: r.reason, details: r.details ?? "",
      athleteName: `${r.athlete.firstName} ${r.athlete.lastName}`, athleteSlug: r.athlete.slug,
      createdAt: r.createdAt.toISOString(),
    })),
    coaches: coachList.map((c) => ({
      id: c.id, name: c.name, email: c.email,
      school: c.school?.name ?? "—", verified: c.verified,
    })),
    sports: sportRows.map((s) => ({
      id: s.id, name: s.name, slug: s.slug, active: s.active,
      fields: s._count.fields, athletes: s._count.athletes,
    })),
    uploads: uploads.map((u) => ({
      id: u.id, filename: u.filename, coach: u.coach.name,
      rowsTotal: u.rowsTotal, rowsReady: u.rowsReady, rowsError: u.rowsError,
      createdAt: u.createdAt.toISOString(),
    })),
  };

  return <AdminPanel data={data} adminName={session.name} />;
}
