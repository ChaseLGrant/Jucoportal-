import { prisma } from "./db";
import { safeJson } from "./utils";
import { getSport, filterFields } from "./sports";
import type { Prisma } from "@prisma/client";

export interface AthleteView {
  id: string;
  slug: string;
  firstName: string;
  lastName: string;
  name: string;
  sportSlug: string;
  sportName: string;
  schoolName: string | null;
  schoolSlug: string | null;
  positions: string[];
  classYear: string | null;
  transferYear: number | null;
  transferSemester: string | null;
  transferStatus: string;
  eligibilityYears: number | null;
  heightInches: number | null;
  weightLbs: number | null;
  handedness: string | null;
  city: string | null;
  state: string | null;
  gpa: number | null;
  major: string | null;
  creditsCompleted: number | null;
  expectedGraduation: string | null;
  academicInterests: string | null;
  metrics: Record<string, string | number>;
  photoUrl: string | null;
  filmLinks: string[];
  bio: string | null;
  playerEmail: string | null;
  playerPhone: string | null;
  showEmail: boolean;
  showPhone: boolean;
  coachName: string | null;
  coachTitle: string | null;
  coachEmail: string | null;
  coachPhone: string | null;
  verification: string;
  views: number;
}

type AthleteWithRelations = Prisma.AthleteGetPayload<{
  include: { sport: true; school: true };
}>;

export function serializeAthlete(a: AthleteWithRelations): AthleteView {
  return {
    id: a.id,
    slug: a.slug,
    firstName: a.firstName,
    lastName: a.lastName,
    name: `${a.firstName} ${a.lastName}`,
    sportSlug: a.sport.slug,
    sportName: a.sport.name,
    schoolName: a.school?.name ?? a.schoolName ?? null,
    schoolSlug: a.school?.slug ?? null,
    positions: a.positions ? a.positions.split(",").map((p) => p.trim()).filter(Boolean) : [],
    classYear: a.classYear,
    transferYear: a.transferYear,
    transferSemester: a.transferSemester,
    transferStatus: a.transferStatus,
    eligibilityYears: a.eligibilityYears,
    heightInches: a.heightInches,
    weightLbs: a.weightLbs,
    handedness: a.handedness,
    city: a.city,
    state: a.state,
    gpa: a.gpa,
    major: a.major,
    creditsCompleted: a.creditsCompleted,
    expectedGraduation: a.expectedGraduation,
    academicInterests: a.academicInterests,
    metrics: safeJson<Record<string, string | number>>(a.metrics, {}),
    photoUrl: a.photoUrl,
    filmLinks: safeJson<string[]>(a.filmLinks, []),
    bio: a.bio,
    playerEmail: a.playerEmail,
    playerPhone: a.playerPhone,
    showEmail: a.showEmail,
    showPhone: a.showPhone,
    coachName: a.coachName,
    coachTitle: a.coachTitle,
    coachEmail: a.coachEmail,
    coachPhone: a.coachPhone,
    verification: a.verification,
    views: a.views,
  };
}

export async function getAthleteBySlug(slug: string, incrementViews = false) {
  const a = await prisma.athlete.findUnique({
    where: { slug },
    include: { sport: true, school: true },
  });
  if (!a || !a.published) return null;
  if (incrementViews) {
    await prisma.athlete.update({ where: { id: a.id }, data: { views: { increment: 1 } } });
  }
  return serializeAthlete(a);
}

export interface SearchParams {
  sport?: string;
  position?: string;
  school?: string; // slug
  state?: string;
  transferYear?: number;
  classYear?: string;
  transferStatus?: string;
  eligibilityMin?: number;
  gpaMin?: number;
  major?: string;
  heightMin?: number;
  weightMin?: number;
  handedness?: string;
  verifiedOnly?: boolean;
  q?: string;
  metrics?: Record<string, { min?: number; max?: number }>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

export interface SearchResult {
  athletes: AthleteView[];
  total: number;
  page: number;
  pageSize: number;
}

export async function searchAthletes(params: SearchParams): Promise<SearchResult> {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(60, params.pageSize ?? 24);

  const where: Prisma.AthleteWhereInput = {
    published: true,
    approved: true,
  };

  if (params.sport) where.sport = { slug: params.sport };
  if (params.school) where.school = { slug: params.school };
  if (params.state) where.state = params.state;
  if (params.transferYear) where.transferYear = params.transferYear;
  if (params.classYear) where.classYear = params.classYear;
  if (params.transferStatus) where.transferStatus = params.transferStatus;
  if (params.verifiedOnly) where.verification = { in: ["COACH_VERIFIED", "PORTAL_VERIFIED"] };
  if (params.eligibilityMin) where.eligibilityYears = { gte: params.eligibilityMin };
  if (params.gpaMin) where.gpa = { gte: params.gpaMin };
  if (params.heightMin) where.heightInches = { gte: params.heightMin };
  if (params.weightMin) where.weightLbs = { gte: params.weightMin };
  if (params.handedness) where.handedness = { contains: params.handedness, mode: "insensitive" };
  if (params.major) where.major = { contains: params.major, mode: "insensitive" };
  if (params.position) where.positions = { contains: params.position, mode: "insensitive" };
  if (params.q) {
    where.OR = [
      { firstName: { contains: params.q, mode: "insensitive" } },
      { lastName: { contains: params.q, mode: "insensitive" } },
      { schoolName: { contains: params.q, mode: "insensitive" } },
    ];
  }

  let orderBy: Prisma.AthleteOrderByWithRelationInput = { updatedAt: "desc" };
  if (params.sort === "name") orderBy = { lastName: "asc" };
  if (params.sort === "gpa") orderBy = { gpa: "desc" };
  if (params.sort === "recent") orderBy = { createdAt: "desc" };

  // Universal filters run in SQL. Metric range filters (stored in JSON) are
  // applied in-memory — fine at MVP scale, and portable across DB engines.
  const metricFilters = params.metrics ?? {};
  const hasMetricFilters = Object.keys(metricFilters).length > 0;

  const all = await prisma.athlete.findMany({
    where,
    orderBy,
    include: { sport: true, school: true },
  });

  let views = all.map(serializeAthlete);

  if (hasMetricFilters && params.sport) {
    const defs = filterFields(params.sport);
    views = views.filter((a) => {
      for (const [key, range] of Object.entries(metricFilters)) {
        const def = defs.find((d) => d.key === key);
        if (!def) continue;
        const raw = a.metrics[key];
        const val = typeof raw === "number" ? raw : parseFloat(String(raw));
        if (isNaN(val)) return false;
        if (range.min != null && val < range.min) return false;
        if (range.max != null && val > range.max) return false;
      }
      return true;
    });
  }

  const total = views.length;
  const start = (page - 1) * pageSize;
  const paged = views.slice(start, start + pageSize);

  return { athletes: paged, total, page, pageSize };
}

/** Facet counts for building filter UIs (states / schools present in data). */
export async function getFacets(sportSlug?: string) {
  const sportId = sportSlug ? (await prisma.sport.findUnique({ where: { slug: sportSlug } }))?.id : undefined;
  const baseWhere: Prisma.AthleteWhereInput = { published: true, approved: true };
  if (sportId) baseWhere.sportId = sportId;

  const [schools, states, years] = await Promise.all([
    prisma.athlete.findMany({
      where: baseWhere,
      distinct: ["schoolId"],
      select: { school: { select: { slug: true, name: true } } },
    }),
    prisma.athlete.findMany({
      where: baseWhere,
      distinct: ["state"],
      select: { state: true },
    }),
    prisma.athlete.findMany({
      where: baseWhere,
      distinct: ["transferYear"],
      select: { transferYear: true },
    }),
  ]);

  return {
    schools: schools
      .map((s) => s.school)
      .filter((s): s is { slug: string; name: string } => !!s)
      .sort((a, b) => a.name.localeCompare(b.name)),
    states: states.map((s) => s.state).filter((s): s is string => !!s).sort(),
    transferYears: years.map((y) => y.transferYear).filter((y): y is number => !!y).sort(),
  };
}

export function metricFilterDefs(sportSlug?: string) {
  if (!sportSlug) return [];
  const sport = getSport(sportSlug);
  if (!sport) return [];
  return filterFields(sportSlug);
}
