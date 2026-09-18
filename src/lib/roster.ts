import { getSport } from "./sports";

export interface RosterTarget {
  key: string;
  label: string;
  aliases: string[];
  required?: boolean;
  group: "identity" | "athletic" | "academic" | "transfer" | "contact" | "metric";
}

// Universal mapping targets. Sport-specific metric targets are appended per sport.
export const UNIVERSAL_TARGETS: RosterTarget[] = [
  { key: "fullName", label: "Athlete Name (full)", aliases: ["name", "player", "athlete", "playername", "fullname"], group: "identity" },
  { key: "firstName", label: "First Name", aliases: ["first", "firstname", "fname", "given"], group: "identity" },
  { key: "lastName", label: "Last Name", aliases: ["last", "lastname", "lname", "surname", "family"], group: "identity" },
  { key: "positions", label: "Position", aliases: ["pos", "position", "positions", "event"], group: "athletic" },
  { key: "classYear", label: "Class (Fr/So)", aliases: ["class", "year", "classyear", "yr", "grade"], group: "athletic" },
  { key: "heightInches", label: "Height", aliases: ["ht", "height"], group: "athletic" },
  { key: "weightLbs", label: "Weight", aliases: ["wt", "weight", "lbs"], group: "athletic" },
  { key: "handedness", label: "Bats/Throws / Hand", aliases: ["b/t", "bt", "batsthrows", "hand", "handedness", "throws"], group: "athletic" },
  { key: "gpa", label: "GPA", aliases: ["gpa", "grades", "gradepoint"], group: "academic" },
  { key: "major", label: "Major", aliases: ["major", "degree", "study"], group: "academic" },
  { key: "creditsCompleted", label: "Credits", aliases: ["credits", "creditscompleted", "hrs", "hours"], group: "academic" },
  { key: "transferYear", label: "Transfer Year", aliases: ["transferyear", "availableyear", "gradyear", "avail"], group: "transfer" },
  { key: "transferSemester", label: "Transfer Semester", aliases: ["semester", "term", "transfersemester"], group: "transfer" },
  { key: "eligibilityYears", label: "Eligibility (yrs)", aliases: ["eligibility", "eligible", "yearsleft", "elig"], group: "transfer" },
  { key: "transferStatus", label: "Transfer Status", aliases: ["status", "transferstatus", "availability"], group: "transfer" },
  { key: "state", label: "State", aliases: ["state", "st", "region"], group: "identity" },
  { key: "city", label: "City", aliases: ["city", "hometown", "town"], group: "identity" },
  { key: "schoolName", label: "Current JUCO", aliases: ["school", "college", "juco", "team", "currentschool"], group: "identity" },
  { key: "playerEmail", label: "Player Email", aliases: ["email", "playeremail", "e-mail", "mail"], group: "contact" },
  { key: "playerPhone", label: "Player Phone", aliases: ["phone", "cell", "mobile", "playerphone", "tel"], group: "contact" },
];

export function getRosterTargets(sportSlug?: string): RosterTarget[] {
  const sport = sportSlug ? getSport(sportSlug) : undefined;
  const metricTargets: RosterTarget[] =
    sport?.fields.map((f) => ({
      key: `metric:${f.key}`,
      label: f.label,
      aliases: [f.key.toLowerCase(), f.label.toLowerCase().replace(/[^a-z0-9]/g, "")],
      group: "metric" as const,
    })) ?? [];
  return [...UNIVERSAL_TARGETS, ...metricTargets];
}

function norm(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/** Suggest a header -> target key mapping using alias + fuzzy matching. */
export function suggestMapping(headers: string[], sportSlug?: string): Record<string, string> {
  const targets = getRosterTargets(sportSlug);
  const used = new Set<string>();
  const mapping: Record<string, string> = {};

  for (const header of headers) {
    const h = norm(header);
    let best = "";
    // exact alias or key match first
    for (const t of targets) {
      if (used.has(t.key)) continue;
      const keys = [norm(t.key.replace("metric:", "")), ...t.aliases.map(norm)];
      if (keys.includes(h)) {
        best = t.key;
        break;
      }
    }
    // partial contains match
    if (!best) {
      for (const t of targets) {
        if (used.has(t.key)) continue;
        const keys = [norm(t.key.replace("metric:", "")), ...t.aliases.map(norm)];
        if (keys.some((k) => k.length >= 3 && (h.includes(k) || k.includes(h)))) {
          best = t.key;
          break;
        }
      }
    }
    if (best) {
      mapping[header] = best;
      used.add(best);
    } else {
      mapping[header] = "";
    }
  }
  return mapping;
}

export const REQUIRED_HINT = "Each athlete needs at least a name (full name, or first + last).";
