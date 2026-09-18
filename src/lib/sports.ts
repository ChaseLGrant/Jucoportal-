// ---------------------------------------------------------------------------
// The JUCO Portal — flexible sport configuration.
// This is the source of truth for sport-specific fields. Forms, athlete cards,
// search facets and seed data are all generated from here. New sports / fields
// can be added by appending to this file OR (at runtime) via the admin panel,
// which writes to the SportField table and is merged on top of this config.
// ---------------------------------------------------------------------------

export type FieldType = "number" | "text" | "select";
export type FieldGroup = "athletic" | "performance";

export interface SportFieldDef {
  key: string;
  label: string;
  group: FieldGroup;
  type: FieldType;
  unit?: string;
  options?: string[];
  /** show this metric on the athlete card */
  card?: boolean;
  /** expose a numeric range filter in search; "min" or "max" is the useful bound */
  filter?: "min" | "max";
}

export interface SportDef {
  slug: string;
  name: string;
  gender: "men" | "women" | "coed";
  order: number;
  positions: string[];
  fields: SportFieldDef[];
}

const BASEBALL_SOFTBALL_POS = [
  "P", "RHP", "LHP", "C", "1B", "2B", "3B", "SS", "LF", "CF", "RF", "OF", "UTIL", "DH",
];

const HAND = ["R/R", "L/L", "L/R", "R/L", "S/R", "S/L"];

export const SPORTS: SportDef[] = [
  {
    slug: "baseball",
    name: "Baseball",
    gender: "men",
    order: 1,
    positions: BASEBALL_SOFTBALL_POS,
    fields: [
      { key: "batsThrows", label: "Bats/Throws", group: "athletic", type: "select", options: HAND },
      { key: "fbVelo", label: "Fastball Velocity", group: "performance", type: "number", unit: "MPH", card: true, filter: "min" },
      { key: "exitVelo", label: "Exit Velocity", group: "performance", type: "number", unit: "MPH", filter: "min" },
      { key: "sixtyTime", label: "60-Yard Dash", group: "performance", type: "number", unit: "sec", filter: "max" },
      { key: "popTime", label: "Pop Time", group: "performance", type: "number", unit: "sec", filter: "max" },
      { key: "era", label: "ERA", group: "performance", type: "number", card: true, filter: "max" },
      { key: "whip", label: "WHIP", group: "performance", type: "number", filter: "max" },
      { key: "inningsPitched", label: "Innings Pitched", group: "performance", type: "number", unit: "IP" },
      { key: "strikeouts", label: "Strikeouts", group: "performance", type: "number", unit: "K", card: true },
      { key: "avg", label: "Batting Avg", group: "performance", type: "number", card: true, filter: "min" },
      { key: "obp", label: "OBP", group: "performance", type: "number", filter: "min" },
      { key: "slg", label: "SLG", group: "performance", type: "number", filter: "min" },
      { key: "ops", label: "OPS", group: "performance", type: "number", filter: "min" },
    ],
  },
  {
    slug: "softball",
    name: "Softball",
    gender: "women",
    order: 2,
    positions: BASEBALL_SOFTBALL_POS,
    fields: [
      { key: "batsThrows", label: "Bats/Throws", group: "athletic", type: "select", options: HAND },
      { key: "pitchVelo", label: "Pitch Velocity", group: "performance", type: "number", unit: "MPH", card: true, filter: "min" },
      { key: "exitVelo", label: "Exit Velocity", group: "performance", type: "number", unit: "MPH", filter: "min" },
      { key: "homeToFirst", label: "Home to First", group: "performance", type: "number", unit: "sec", filter: "max" },
      { key: "era", label: "ERA", group: "performance", type: "number", card: true, filter: "max" },
      { key: "whip", label: "WHIP", group: "performance", type: "number", filter: "max" },
      { key: "strikeouts", label: "Strikeouts", group: "performance", type: "number", unit: "K", card: true },
      { key: "avg", label: "Batting Avg", group: "performance", type: "number", card: true, filter: "min" },
      { key: "obp", label: "OBP", group: "performance", type: "number", filter: "min" },
      { key: "slg", label: "SLG", group: "performance", type: "number", filter: "min" },
    ],
  },
  {
    slug: "mens-soccer",
    name: "Men's Soccer",
    gender: "men",
    order: 3,
    positions: ["GK", "CB", "FB", "RB", "LB", "CDM", "CM", "CAM", "RW", "LW", "ST", "F"],
    fields: [
      { key: "minutes", label: "Minutes Played", group: "performance", type: "number", unit: "min" },
      { key: "starts", label: "Starts", group: "performance", type: "number" },
      { key: "goals", label: "Goals", group: "performance", type: "number", card: true },
      { key: "assists", label: "Assists", group: "performance", type: "number", card: true },
      { key: "saves", label: "Saves", group: "performance", type: "number" },
      { key: "cleanSheets", label: "Clean Sheets", group: "performance", type: "number" },
      { key: "honors", label: "Honors", group: "performance", type: "text" },
    ],
  },
  {
    slug: "womens-soccer",
    name: "Women's Soccer",
    gender: "women",
    order: 4,
    positions: ["GK", "CB", "FB", "RB", "LB", "CDM", "CM", "CAM", "RW", "LW", "ST", "F"],
    fields: [
      { key: "minutes", label: "Minutes Played", group: "performance", type: "number", unit: "min" },
      { key: "starts", label: "Starts", group: "performance", type: "number" },
      { key: "goals", label: "Goals", group: "performance", type: "number", card: true },
      { key: "assists", label: "Assists", group: "performance", type: "number", card: true },
      { key: "saves", label: "Saves", group: "performance", type: "number" },
      { key: "cleanSheets", label: "Clean Sheets", group: "performance", type: "number" },
      { key: "honors", label: "Honors", group: "performance", type: "text" },
    ],
  },
  {
    slug: "mens-basketball",
    name: "Men's Basketball",
    gender: "men",
    order: 5,
    positions: ["PG", "SG", "SF", "PF", "C", "G", "F"],
    fields: [
      { key: "wingspan", label: "Wingspan", group: "athletic", type: "text" },
      { key: "ppg", label: "Points / Game", group: "performance", type: "number", card: true, filter: "min" },
      { key: "rpg", label: "Rebounds / Game", group: "performance", type: "number", card: true, filter: "min" },
      { key: "apg", label: "Assists / Game", group: "performance", type: "number", card: true, filter: "min" },
      { key: "spg", label: "Steals / Game", group: "performance", type: "number", filter: "min" },
      { key: "bpg", label: "Blocks / Game", group: "performance", type: "number", filter: "min" },
      { key: "fgPct", label: "FG %", group: "performance", type: "number", filter: "min" },
      { key: "threePct", label: "3PT %", group: "performance", type: "number", filter: "min" },
      { key: "ftPct", label: "FT %", group: "performance", type: "number", filter: "min" },
    ],
  },
  {
    slug: "womens-basketball",
    name: "Women's Basketball",
    gender: "women",
    order: 6,
    positions: ["PG", "SG", "SF", "PF", "C", "G", "F"],
    fields: [
      { key: "wingspan", label: "Wingspan", group: "athletic", type: "text" },
      { key: "ppg", label: "Points / Game", group: "performance", type: "number", card: true, filter: "min" },
      { key: "rpg", label: "Rebounds / Game", group: "performance", type: "number", card: true, filter: "min" },
      { key: "apg", label: "Assists / Game", group: "performance", type: "number", card: true, filter: "min" },
      { key: "spg", label: "Steals / Game", group: "performance", type: "number", filter: "min" },
      { key: "bpg", label: "Blocks / Game", group: "performance", type: "number", filter: "min" },
      { key: "fgPct", label: "FG %", group: "performance", type: "number", filter: "min" },
      { key: "threePct", label: "3PT %", group: "performance", type: "number", filter: "min" },
    ],
  },
  {
    slug: "womens-volleyball",
    name: "Women's Volleyball",
    gender: "women",
    order: 7,
    positions: ["OH", "MB", "S", "OPP", "L", "DS"],
    fields: [
      { key: "approachTouch", label: "Approach Touch", group: "athletic", type: "text" },
      { key: "blockTouch", label: "Block Touch", group: "athletic", type: "text" },
      { key: "killsPerSet", label: "Kills / Set", group: "performance", type: "number", card: true, filter: "min" },
      { key: "hittingPct", label: "Hitting %", group: "performance", type: "number", card: true, filter: "min" },
      { key: "blocksPerSet", label: "Blocks / Set", group: "performance", type: "number", filter: "min" },
      { key: "digsPerSet", label: "Digs / Set", group: "performance", type: "number", filter: "min" },
      { key: "assistsPerSet", label: "Assists / Set", group: "performance", type: "number", filter: "min" },
      { key: "aces", label: "Aces", group: "performance", type: "number" },
    ],
  },
  {
    slug: "football",
    name: "Football",
    gender: "men",
    order: 8,
    positions: ["QB", "RB", "WR", "TE", "OL", "DL", "LB", "CB", "S", "K", "P", "ATH"],
    fields: [
      { key: "fortyTime", label: "40-Yard Dash", group: "performance", type: "number", unit: "sec", card: true, filter: "max" },
      { key: "bench", label: "Bench Press", group: "athletic", type: "number", unit: "reps" },
      { key: "vertical", label: "Vertical Jump", group: "athletic", type: "number", unit: "in", filter: "min" },
      { key: "passYards", label: "Passing Yards", group: "performance", type: "number" },
      { key: "rushYards", label: "Rushing Yards", group: "performance", type: "number" },
      { key: "recYards", label: "Receiving Yards", group: "performance", type: "number" },
      { key: "touchdowns", label: "Touchdowns", group: "performance", type: "number", card: true },
      { key: "tackles", label: "Tackles", group: "performance", type: "number", card: true },
      { key: "sacks", label: "Sacks", group: "performance", type: "number" },
      { key: "interceptions", label: "Interceptions", group: "performance", type: "number" },
    ],
  },
  {
    slug: "mens-golf",
    name: "Men's Golf",
    gender: "men",
    order: 9,
    positions: ["Golfer"],
    fields: [
      { key: "scoringAvg", label: "Scoring Average", group: "performance", type: "number", card: true, filter: "max" },
      { key: "handicap", label: "Handicap", group: "performance", type: "number", card: true, filter: "max" },
      { key: "lowRound", label: "Low Round", group: "performance", type: "number", filter: "max" },
      { key: "topFinishes", label: "Top-10 Finishes", group: "performance", type: "number" },
      { key: "resultsLink", label: "Results / Profile Link", group: "performance", type: "text" },
    ],
  },
  {
    slug: "womens-golf",
    name: "Women's Golf",
    gender: "women",
    order: 10,
    positions: ["Golfer"],
    fields: [
      { key: "scoringAvg", label: "Scoring Average", group: "performance", type: "number", card: true, filter: "max" },
      { key: "handicap", label: "Handicap", group: "performance", type: "number", card: true, filter: "max" },
      { key: "lowRound", label: "Low Round", group: "performance", type: "number", filter: "max" },
      { key: "topFinishes", label: "Top-10 Finishes", group: "performance", type: "number" },
      { key: "resultsLink", label: "Results / Profile Link", group: "performance", type: "text" },
    ],
  },
  {
    slug: "mens-track-field",
    name: "Men's Track & Field",
    gender: "men",
    order: 11,
    positions: ["100m", "200m", "400m", "800m", "1500m", "5000m", "110mH", "400mH", "Long Jump", "High Jump", "Triple Jump", "Pole Vault", "Shot Put", "Discus", "Javelin", "Decathlon"],
    fields: [
      { key: "primaryEvent", label: "Primary Event", group: "athletic", type: "text", card: true },
      { key: "personalRecord", label: "Personal Record", group: "performance", type: "text", card: true },
      { key: "meetResult", label: "Best Meet Result", group: "performance", type: "text" },
      { key: "windReading", label: "Wind Reading", group: "performance", type: "text" },
    ],
  },
  {
    slug: "womens-track-field",
    name: "Women's Track & Field",
    gender: "women",
    order: 12,
    positions: ["100m", "200m", "400m", "800m", "1500m", "5000m", "100mH", "400mH", "Long Jump", "High Jump", "Triple Jump", "Pole Vault", "Shot Put", "Discus", "Javelin", "Heptathlon"],
    fields: [
      { key: "primaryEvent", label: "Primary Event", group: "athletic", type: "text", card: true },
      { key: "personalRecord", label: "Personal Record", group: "performance", type: "text", card: true },
      { key: "meetResult", label: "Best Meet Result", group: "performance", type: "text" },
      { key: "windReading", label: "Wind Reading", group: "performance", type: "text" },
    ],
  },
  {
    slug: "mens-cross-country",
    name: "Men's Cross Country",
    gender: "men",
    order: 13,
    positions: ["Distance"],
    fields: [
      { key: "pr8k", label: "8K PR", group: "performance", type: "text", card: true },
      { key: "pr5k", label: "5K PR", group: "performance", type: "text", card: true },
      { key: "bestFinish", label: "Best Finish", group: "performance", type: "text" },
    ],
  },
  {
    slug: "womens-cross-country",
    name: "Women's Cross Country",
    gender: "women",
    order: 14,
    positions: ["Distance"],
    fields: [
      { key: "pr6k", label: "6K PR", group: "performance", type: "text", card: true },
      { key: "pr5k", label: "5K PR", group: "performance", type: "text", card: true },
      { key: "bestFinish", label: "Best Finish", group: "performance", type: "text" },
    ],
  },
  {
    slug: "mens-swimming",
    name: "Men's Swimming",
    gender: "men",
    order: 15,
    positions: ["Freestyle", "Backstroke", "Breaststroke", "Butterfly", "IM", "Distance", "Sprint"],
    fields: [
      { key: "primaryEvent", label: "Primary Event", group: "athletic", type: "text", card: true },
      { key: "bestTime", label: "Best Time", group: "performance", type: "text", card: true },
      { key: "courseType", label: "Course Type", group: "performance", type: "select", options: ["SCY", "SCM", "LCM"] },
      { key: "secondEvent", label: "Second Event", group: "performance", type: "text" },
    ],
  },
  {
    slug: "womens-swimming",
    name: "Women's Swimming",
    gender: "women",
    order: 16,
    positions: ["Freestyle", "Backstroke", "Breaststroke", "Butterfly", "IM", "Distance", "Sprint"],
    fields: [
      { key: "primaryEvent", label: "Primary Event", group: "athletic", type: "text", card: true },
      { key: "bestTime", label: "Best Time", group: "performance", type: "text", card: true },
      { key: "courseType", label: "Course Type", group: "performance", type: "select", options: ["SCY", "SCM", "LCM"] },
      { key: "secondEvent", label: "Second Event", group: "performance", type: "text" },
    ],
  },
  {
    slug: "wrestling",
    name: "Wrestling",
    gender: "men",
    order: 17,
    positions: ["125", "133", "141", "149", "157", "165", "174", "184", "197", "285"],
    fields: [
      { key: "weightClass", label: "Weight Class", group: "athletic", type: "text", card: true },
      { key: "record", label: "Record (W-L)", group: "performance", type: "text", card: true },
      { key: "pins", label: "Pins", group: "performance", type: "number" },
      { key: "placement", label: "Best Placement", group: "performance", type: "text" },
    ],
  },
  {
    slug: "tennis",
    name: "Tennis",
    gender: "coed",
    order: 18,
    positions: ["Singles", "Doubles"],
    fields: [
      { key: "utr", label: "UTR Rating", group: "performance", type: "number", card: true, filter: "min" },
      { key: "singlesRecord", label: "Singles Record", group: "performance", type: "text", card: true },
      { key: "doublesRecord", label: "Doubles Record", group: "performance", type: "text" },
      { key: "handedness", label: "Handedness", group: "athletic", type: "select", options: ["Right", "Left"] },
    ],
  },
];

export const SPORTS_BY_SLUG: Record<string, SportDef> = Object.fromEntries(
  SPORTS.map((s) => [s.slug, s])
);

export function getSport(slug: string): SportDef | undefined {
  return SPORTS_BY_SLUG[slug];
}

export function sportName(slug: string): string {
  return SPORTS_BY_SLUG[slug]?.name ?? slug;
}

export function cardFields(slug: string): SportFieldDef[] {
  return (SPORTS_BY_SLUG[slug]?.fields ?? []).filter((f) => f.card);
}

export function filterFields(slug: string): SportFieldDef[] {
  return (SPORTS_BY_SLUG[slug]?.fields ?? []).filter((f) => f.filter);
}
