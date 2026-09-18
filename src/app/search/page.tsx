import type { Metadata } from "next";
import { Suspense } from "react";
import { searchAthletes, getFacets } from "@/lib/athletes";
import { parseSearch } from "@/lib/search-params";
import { sportName } from "@/lib/sports";
import { SearchFilters } from "@/components/search-filters";
import { ResultsSection } from "@/components/results-section";
import { Pagination } from "@/components/pagination";

export const metadata: Metadata = {
  title: "Search JUCO Athletes",
  description:
    "Search the national database of junior-college athletes. Filter by sport, position, academics, performance and transfer status. Free — no account required.",
};

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const { query, filterState } = parseSearch(raw);
  const [result, facets] = await Promise.all([
    searchAthletes(query),
    getFacets(query.sport),
  ]);

  const heading = query.sport ? `${sportName(query.sport)} Athletes` : "Search Athletes";

  return (
    <div className="bg-chalk-50">
      <div className="border-b border-chalk-200 bg-white">
        <div className="container-wide py-8">
          <p className="eyebrow">The Database</p>
          <h1 className="mt-1 font-display text-3xl font-black tracking-tight text-ink-900 sm:text-4xl">
            {heading}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-chalk-500">
            Search available JUCO athletes by position, performance, academics, location
            and transfer status. No account required.
          </p>
        </div>
      </div>

      <div className="container-wide py-8">
        <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
          <aside>
            <Suspense>
              <SearchFilters initial={filterState} facets={facets} />
            </Suspense>
          </aside>
          <div>
            <Suspense>
              <ResultsSection
                athletes={result.athletes}
                total={result.total}
                sort={filterState.sort}
              />
              <Pagination page={result.page} pageSize={result.pageSize} total={result.total} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
