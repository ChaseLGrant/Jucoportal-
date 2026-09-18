import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { SPORTS } from "../src/lib/sports";
import { slugify } from "../src/lib/utils";

const prisma = new PrismaClient();

// ---- deterministic RNG so seed output is reproducible ----
let seed = 20270918;
function rng() {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  return seed / 0x7fffffff;
}
const pick = <T>(arr: T[]): T => arr[Math.floor(rng() * arr.length)];
const rint = (min: number, max: number) => Math.floor(rng() * (max - min + 1)) + min;
const rfloat = (min: number, max: number, dp = 2) =>
  parseFloat((rng() * (max - min) + min).toFixed(dp));
const chance = (p: number) => rng() < p;

// Fictional first/last name pools (generic — combined randomly, not real people)
const FIRST_M = ["Jake", "Marcus", "Diego", "Tyler", "Andre", "Cole", "Xavier", "Noah", "Elijah", "Mason", "Carter", "Owen", "Luis", "Jamal", "Blake", "Hunter", "Isaiah", "Gavin", "Trey", "Devin", "Caleb", "Malik", "Brody", "Kai", "Ryder", "Quinn", "Zane", "Rocco", "Dominic", "Chance"];
const FIRST_F = ["Ava", "Maya", "Sofia", "Emma", "Layla", "Zoe", "Nia", "Camila", "Harper", "Riley", "Jordan", "Sydney", "Bella", "Alexis", "Reese", "Kayla", "Paige", "Morgan", "Taylor", "Elena", "Brooke", "Skylar", "Mackenzie", "Daniela", "Priya", "Aaliyah", "Grace", "Hailey", "Jada", "Lena"];
const LAST = ["Williams", "Johnson", "Rivera", "Nguyen", "Carter", "Brooks", "Delgado", "Hayes", "Coleman", "Patterson", "Ramirez", "Foster", "Bennett", "Torres", "Sanders", "Fuller", "Vance", "Okafor", "Salazar", "Whitfield", "Kowalski", "Mercer", "Abbott", "Dawson", "Harmon", "Castillo", "Reeves", "Novak", "Pierce", "Bautista", "Lindqvist", "Kim", "Osei", "Marchetti", "Donovan", "Alvarez", "Sutton", "Yamada", "Bergstrom", "Ferreira"];

const MAJORS = ["Business Administration", "Kinesiology", "Communications", "Computer Science", "Psychology", "Biology", "Sociology", "Sports Management", "Criminal Justice", "Nursing", "Engineering", "Economics", "Marketing", "Exercise Science", "Political Science", "Undeclared"];

const STATUSES = ["ACTIVELY_SEEKING", "ACTIVELY_SEEKING", "ACTIVELY_SEEKING", "OPEN", "OPEN", "COMMITTED", "RETURNING"];
const VERIFICATIONS = ["SUBMITTED", "SUBMITTED", "COACH_VERIFIED", "COACH_VERIFIED", "COACH_VERIFIED", "PORTAL_VERIFIED"];

// Real junior-college institution names (institutions, not people) for realism.
const SCHOOLS = [
  { name: "Palomar College", city: "San Marcos", state: "CA", conference: "PCAC" },
  { name: "Chipola College", city: "Marianna", state: "FL", conference: "Panhandle" },
  { name: "San Jacinto College", city: "Pasadena", state: "TX", conference: "NTJCAC" },
  { name: "Iowa Western CC", city: "Council Bluffs", state: "IA", conference: "ICCAC" },
  { name: "Wallace State CC", city: "Hanceville", state: "AL", conference: "ACCC" },
  { name: "Mesa Community College", city: "Mesa", state: "AZ", conference: "ACCAC" },
  { name: "Weatherford College", city: "Weatherford", state: "TX", conference: "NTJCAC" },
  { name: "Cowley College", city: "Arkansas City", state: "KS", conference: "KJCCC" },
  { name: "Eastern Florida State", city: "Melbourne", state: "FL", conference: "Southern" },
  { name: "Northeast Oklahoma A&M", city: "Miami", state: "OK", conference: "OCAC" },
  { name: "Salt Lake CC", city: "Salt Lake City", state: "UT", conference: "SWAC" },
  { name: "Yavapai College", city: "Prescott", state: "AZ", conference: "ACCAC" },
  { name: "Snow College", city: "Ephraim", state: "UT", conference: "SWAC" },
  { name: "McLennan CC", city: "Waco", state: "TX", conference: "NTJCAC" },
  { name: "Hutchinson CC", city: "Hutchinson", state: "KS", conference: "KJCCC" },
  { name: "College of Southern Nevada", city: "Henderson", state: "NV", conference: "SWAC" },
  { name: "Seminole State College", city: "Seminole", state: "OK", conference: "OCAC" },
  { name: "Butler CC", city: "El Dorado", state: "KS", conference: "KJCCC" },
  { name: "Tyler Junior College", city: "Tyler", state: "TX", conference: "NTJCAC" },
  { name: "Miami Dade College", city: "Miami", state: "FL", conference: "Southern" },
  { name: "Monroe College", city: "Bronx", state: "NY", conference: "Region XV" },
  { name: "Paradise Valley CC", city: "Phoenix", state: "AZ", conference: "ACCAC" },
  { name: "Georgia Highlands College", city: "Rome", state: "GA", conference: "GCAA" },
  { name: "Central Arizona College", city: "Coolidge", state: "AZ", conference: "ACCAC" },
];

const COACH_TITLES = ["Head Coach", "Assistant Coach", "Recruiting Coordinator", "Associate Head Coach"];

function heightForSport(slug: string): number {
  // returns inches
  if (slug.includes("basketball")) return rint(72, 84);
  if (slug === "womens-volleyball") return rint(68, 78);
  if (slug === "football") return rint(69, 78);
  if (slug.includes("soccer")) return rint(64, 74);
  return rint(64, 76);
}

function weightForHeight(inches: number, sport: string): number {
  let base = (inches - 60) * 5 + 120;
  if (sport === "football") base += rint(20, 90);
  if (sport.includes("basketball")) base += rint(-5, 25);
  return Math.round(base + rint(-10, 15));
}

function metricsForSport(slug: string): Record<string, string | number> {
  const m: Record<string, string | number> = {};
  const HAND = ["R/R", "L/L", "L/R", "S/R"];
  switch (slug) {
    case "baseball": {
      const pitcher = chance(0.4);
      m.batsThrows = pick(HAND);
      if (pitcher) {
        m.fbVelo = rint(84, 96);
        m.era = rfloat(1.8, 5.2);
        m.whip = rfloat(0.9, 1.7);
        m.inningsPitched = rint(20, 85);
        m.strikeouts = rint(25, 105);
      } else {
        m.exitVelo = rint(88, 104);
        m.sixtyTime = rfloat(6.3, 7.4, 2);
        m.avg = rfloat(0.24, 0.41, 3);
        m.obp = rfloat(0.31, 0.47, 3);
        m.slg = rfloat(0.35, 0.69, 3);
        m.ops = parseFloat(((m.obp as number) + (m.slg as number)).toFixed(3));
        m.strikeouts = rint(15, 45);
      }
      break;
    }
    case "softball": {
      const pitcher = chance(0.4);
      m.batsThrows = pick(HAND);
      if (pitcher) {
        m.pitchVelo = rint(58, 70);
        m.era = rfloat(1.4, 4.6);
        m.whip = rfloat(0.9, 1.6);
        m.strikeouts = rint(40, 180);
      } else {
        m.exitVelo = rint(66, 80);
        m.homeToFirst = rfloat(2.7, 3.4);
        m.avg = rfloat(0.27, 0.44, 3);
        m.obp = rfloat(0.34, 0.5, 3);
        m.slg = rfloat(0.38, 0.72, 3);
      }
      break;
    }
    case "mens-soccer":
    case "womens-soccer": {
      const gk = chance(0.15);
      m.minutes = rint(400, 1700);
      m.starts = rint(4, 20);
      if (gk) {
        m.saves = rint(30, 95);
        m.cleanSheets = rint(2, 11);
      } else {
        m.goals = rint(0, 18);
        m.assists = rint(0, 14);
      }
      if (chance(0.4)) m.honors = pick(["All-Conference", "All-Region", "Team Captain", "Conf. Player of Week"]);
      break;
    }
    case "mens-basketball":
    case "womens-basketball": {
      m.ppg = rfloat(4, 24, 1);
      m.rpg = rfloat(2, 12, 1);
      m.apg = rfloat(0.8, 8, 1);
      m.spg = rfloat(0.3, 3, 1);
      m.bpg = rfloat(0.1, 2.6, 1);
      m.fgPct = rfloat(38, 58, 1);
      m.threePct = rfloat(26, 44, 1);
      m.ftPct = rfloat(60, 90, 1);
      break;
    }
    case "womens-volleyball": {
      m.approachTouch = `${rint(9, 10)}'${rint(0, 11)}"`;
      m.killsPerSet = rfloat(1.5, 4.6, 1);
      m.hittingPct = rfloat(0.18, 0.42, 3);
      m.blocksPerSet = rfloat(0.4, 1.9, 1);
      m.digsPerSet = rfloat(1.5, 5.5, 1);
      break;
    }
    case "football": {
      m.fortyTime = rfloat(4.42, 5.3);
      m.vertical = rint(26, 40);
      m.bench = rint(10, 30);
      if (chance(0.5)) {
        m.touchdowns = rint(1, 18);
        if (chance(0.5)) m.rushYards = rint(300, 1400);
        else m.recYards = rint(250, 1200);
      } else {
        m.tackles = rint(20, 110);
        m.sacks = rint(0, 12);
        m.interceptions = rint(0, 6);
      }
      break;
    }
    case "mens-golf":
    case "womens-golf": {
      m.scoringAvg = rfloat(70.5, 79.5, 1);
      m.handicap = rfloat(0, 6, 1);
      m.lowRound = rint(66, 74);
      m.topFinishes = rint(0, 8);
      break;
    }
    case "mens-track-field":
    case "womens-track-field": {
      const ev = pick(["100m", "200m", "400m", "800m", "Long Jump", "High Jump", "Shot Put"]);
      m.primaryEvent = ev;
      m.personalRecord = ev.includes("m")
        ? `${rint(10, 52)}.${rint(10, 99)}`
        : `${rfloat(1.7, 7.6)} m`;
      if (chance(0.5)) m.meetResult = pick(["Conf. Champion", "2nd Region", "Nationals Qualifier", "5th Conf."]);
      break;
    }
    case "mens-cross-country": {
      m.pr8k = `${rint(24, 27)}:${rint(10, 59)}`;
      m.pr5k = `${rint(14, 16)}:${rint(10, 59)}`;
      break;
    }
    case "womens-cross-country": {
      m.pr6k = `${rint(20, 23)}:${rint(10, 59)}`;
      m.pr5k = `${rint(17, 19)}:${rint(10, 59)}`;
      break;
    }
    case "mens-swimming":
    case "womens-swimming": {
      const ev = pick(["50 Free", "100 Free", "100 Back", "200 IM", "100 Fly", "500 Free"]);
      m.primaryEvent = ev;
      m.bestTime = `${rint(0, 4)}:${rint(10, 59)}.${rint(10, 99)}`;
      m.courseType = pick(["SCY", "LCM"]);
      break;
    }
    case "wrestling": {
      const wc = pick(["125", "133", "141", "149", "157", "165", "174", "184", "197", "285"]);
      m.weightClass = wc;
      m.record = `${rint(12, 35)}-${rint(2, 14)}`;
      m.pins = rint(2, 18);
      break;
    }
    case "tennis": {
      m.utr = rfloat(7, 13, 1);
      m.singlesRecord = `${rint(8, 24)}-${rint(2, 12)}`;
      m.doublesRecord = `${rint(6, 20)}-${rint(2, 10)}`;
      m.handedness = pick(["Right", "Left"]);
      break;
    }
  }
  return m;
}

async function main() {
  console.log("🌱 Seeding The JUCO Portal...");

  // wipe
  await prisma.report.deleteMany();
  await prisma.athlete.deleteMany();
  await prisma.rosterUpload.deleteMany();
  await prisma.coach.deleteMany();
  await prisma.sportField.deleteMany();
  await prisma.school.deleteMany();
  await prisma.sport.deleteMany();
  await prisma.user.deleteMany();

  // sports + fields
  const sportRecords: Record<string, string> = {};
  for (const s of SPORTS) {
    const created = await prisma.sport.create({
      data: {
        slug: s.slug,
        name: s.name,
        gender: s.gender,
        order: s.order,
        fields: {
          create: s.fields.map((f, i) => ({
            key: f.key,
            label: f.label,
            group: f.group,
            type: f.type,
            unit: f.unit ?? null,
            options: f.options ? JSON.stringify(f.options) : null,
            order: i,
          })),
        },
      },
    });
    sportRecords[s.slug] = created.id;
  }
  console.log(`  ✓ ${SPORTS.length} sports + fields`);

  // schools
  const schoolIds: { id: string; slug: string; state: string; city: string }[] = [];
  for (const sc of SCHOOLS) {
    const slug = slugify(sc.name);
    const created = await prisma.school.create({
      data: { slug, name: sc.name, city: sc.city, state: sc.state, conference: sc.conference },
    });
    schoolIds.push({ id: created.id, slug, state: sc.state, city: sc.city });
  }
  console.log(`  ✓ ${SCHOOLS.length} schools`);

  // admin + demo coach + demo athlete users
  const pwHash = await bcrypt.hash("password123", 10);
  await prisma.user.create({
    data: { email: "admin@jucoportal.com", passwordHash: pwHash, name: "Portal Admin", role: "ADMIN" },
  });

  const demoSchool = schoolIds[0];
  const coachUser = await prisma.user.create({
    data: { email: "coach@jucoportal.com", passwordHash: pwHash, name: "Coach Dan Rivera", role: "COACH" },
  });
  const demoCoach = await prisma.coach.create({
    data: {
      userId: coachUser.id,
      schoolId: demoSchool.id,
      name: "Coach Dan Rivera",
      title: "Head Baseball Coach",
      email: "coach@jucoportal.com",
      phone: "(760) 555-0142",
      verified: true,
    },
  });

  const athleteUser = await prisma.user.create({
    data: { email: "athlete@jucoportal.com", passwordHash: pwHash, name: "Jordan Athlete", role: "ATHLETE" },
  });

  // athletes — distribute counts across sports
  const perSport: Record<string, number> = {
    baseball: 45, softball: 34, "mens-soccer": 30, "womens-soccer": 30,
    "mens-basketball": 32, "womens-basketball": 30, "womens-volleyball": 28,
    football: 40, "mens-golf": 20, "womens-golf": 18,
    "mens-track-field": 22, "womens-track-field": 22, "mens-cross-country": 12,
    "womens-cross-country": 12, "mens-swimming": 14, "womens-swimming": 14,
    wrestling: 18, tennis: 18,
  };

  const usedSlugs = new Set<string>();
  let count = 0;

  for (const sport of SPORTS) {
    const n = perSport[sport.slug] ?? 15;
    for (let i = 0; i < n; i++) {
      const female = sport.gender === "women" || (sport.gender === "coed" && chance(0.5));
      const first = female ? pick(FIRST_F) : pick(FIRST_M);
      const last = pick(LAST);
      let baseSlug = slugify(`${first}-${last}`);
      let slug = baseSlug;
      let suffix = 1;
      while (usedSlugs.has(slug)) slug = `${baseSlug}-${++suffix}`;
      usedSlugs.add(slug);

      const school = pick(schoolIds);
      const inches = heightForSport(sport.slug);
      const status = pick(STATUSES);
      const verification = pick(VERIFICATIONS);
      const classYear = pick(["Freshman", "Sophomore"]);
      const transferYear = pick([2026, 2027, 2027, 2028]);
      const positions = pick(sport.positions);
      const showEmail = chance(0.55);
      const showPhone = chance(0.3);

      await prisma.athlete.create({
        data: {
          slug,
          firstName: first,
          lastName: last,
          sportId: sportRecords[sport.slug],
          schoolId: school.id,
          schoolName: SCHOOLS.find((s) => slugify(s.name) === school.slug)?.name,
          positions,
          classYear,
          transferYear,
          transferSemester: pick(["Fall", "Spring"]),
          transferStatus: status,
          eligibilityYears: classYear === "Freshman" ? rint(2, 3) : rint(1, 2),
          heightInches: inches,
          weightLbs: weightForHeight(inches, sport.slug),
          handedness: sport.slug === "baseball" || sport.slug === "softball" ? pick(["R/R", "L/L", "L/R", "S/R"]) : null,
          city: school.city,
          state: school.state,
          gpa: rfloat(2.4, 4.0),
          major: pick(MAJORS),
          creditsCompleted: rint(24, 62),
          expectedGraduation: `${pick(["Fall", "Spring"])} ${transferYear}`,
          metrics: JSON.stringify(metricsForSport(sport.slug)),
          photoUrl: null,
          filmLinks: chance(0.6) ? JSON.stringify(["https://www.youtube.com/watch?v=dQw4w9WgXcQ"]) : "[]",
          bio: null,
          playerEmail: `${slug}@example.com`,
          playerPhone: `(${rint(200, 989)}) 555-${rint(1000, 9999)}`,
          showEmail,
          showPhone,
          coachName: `Coach ${pick(LAST)}`,
          coachTitle: pick(COACH_TITLES),
          coachEmail: `${sport.slug.split("-")[0]}coach@${school.slug.replace(/-/g, "")}.edu`,
          coachPhone: `(${rint(200, 989)}) 555-${rint(1000, 9999)}`,
          verification,
          published: true,
          approved: true,
          views: rint(0, 480),
          uploadId: sport.slug === "baseball" && i < 8 ? undefined : undefined,
        },
      });
      count++;
    }
    console.log(`  ✓ ${sport.name}: ${n} athletes`);
  }

  // attach the demo coach's school athletes to a roster upload so the
  // coach dashboard is populated out of the box
  const roster = await prisma.rosterUpload.create({
    data: { coachId: demoCoach.id, filename: "palomar_roster.csv", status: "published" },
  });
  const mine = await prisma.athlete.updateMany({
    where: { schoolId: demoSchool.id },
    data: { uploadId: roster.id, coachName: demoCoach.name, coachEmail: demoCoach.email, coachTitle: "Head Coach" },
  });
  await prisma.rosterUpload.update({
    where: { id: roster.id },
    data: { rowsTotal: mine.count, rowsReady: mine.count },
  });
  console.log(`  ✓ ${mine.count} athletes assigned to demo coach roster`);

  // claim one athlete for the demo athlete account so the player dashboard is populated
  const claimTarget = await prisma.athlete.findFirst({ orderBy: { createdAt: "asc" } });
  if (claimTarget) {
    await prisma.athlete.update({
      where: { id: claimTarget.id },
      data: { claimedById: athleteUser.id, playerEmail: "athlete@jucoportal.com", showEmail: true },
    });
    console.log(`  ✓ demo athlete claimed profile: ${claimTarget.slug}`);
  }

  console.log(`\n✅ Done. ${count} demo athletes across ${SPORTS.length} sports.`);
  console.log("   Demo logins (password: password123):");
  console.log("     admin@jucoportal.com   (admin panel)");
  console.log("     coach@jucoportal.com   (coach dashboard + roster upload)");
  console.log("     athlete@jucoportal.com (athlete dashboard)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
