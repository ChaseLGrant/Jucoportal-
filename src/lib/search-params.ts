import type { SearchParams } from "./athletes";
import type { FilterState } from "@/components/search-filters";

type Raw = Record<string, string | string[] | undefined>;

function str(v: string | string[] | undefined): string {
  return Array.isArray(v) ? v[0] ?? "" : v ?? "";
}
function num(v: string | string[] | undefined): number | undefined {
  const s = str(v);
  if (!s) return undefined;
  const n = parseFloat(s);
  return isNaN(n) ? undefined : n;
}

export function parseSearch(raw: Raw): {
  query: SearchParams;
  filterState: FilterState;
} {
  const metrics: Record<string, { min?: number; max?: number }> = {};
  const uiMetrics: Record<string, { min?: string; max?: string }> = {};

  for (const [key, value] of Object.entries(raw)) {
    const m = key.match(/^m_(.+)_(min|max)$/);
    if (m) {
      const [, field, bound] = m;
      const n = num(value);
      if (n != null) {
        metrics[field] = { ...metrics[field], [bound]: n };
        uiMetrics[field] = { ...uiMetrics[field], [bound]: str(value) };
      }
    }
  }

  const query: SearchParams = {
    sport: str(raw.sport) || undefined,
    position: str(raw.position) || undefined,
    school: str(raw.school) || undefined,
    state: str(raw.state) || undefined,
    transferYear: num(raw.transferYear),
    classYear: str(raw.classYear) || undefined,
    transferStatus: str(raw.transferStatus) || undefined,
    eligibilityMin: num(raw.eligibilityMin),
    gpaMin: num(raw.gpaMin),
    major: str(raw.major) || undefined,
    heightMin: num(raw.heightMin),
    verifiedOnly: str(raw.verifiedOnly) === "1",
    q: str(raw.q) || undefined,
    sort: str(raw.sort) || undefined,
    metrics: Object.keys(metrics).length ? metrics : undefined,
    page: num(raw.page) ?? 1,
  };

  const filterState: FilterState = {
    sport: str(raw.sport),
    position: str(raw.position),
    transferStatus: str(raw.transferStatus),
    transferYear: str(raw.transferYear),
    classYear: str(raw.classYear),
    state: str(raw.state),
    school: str(raw.school),
    gpaMin: str(raw.gpaMin),
    eligibilityMin: str(raw.eligibilityMin),
    major: str(raw.major),
    heightMin: str(raw.heightMin),
    verifiedOnly: str(raw.verifiedOnly),
    sort: str(raw.sort),
    metrics: uiMetrics,
  };

  return { query, filterState };
}
