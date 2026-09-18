"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function Pagination({
  page,
  pageSize,
  total,
}: {
  page: number;
  pageSize: number;
  total: number;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const pages = Math.ceil(total / pageSize);
  if (pages <= 1) return null;

  function go(p: number) {
    const next = new URLSearchParams(params.toString());
    next.set("page", String(p));
    router.push(`/search?${next.toString()}`);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const nums: number[] = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(pages, start + 4);
  for (let i = start; i <= end; i++) nums.push(i);

  return (
    <div className="mt-8 flex items-center justify-center gap-1.5">
      <button
        disabled={page <= 1}
        onClick={() => go(page - 1)}
        className="btn-outline btn-sm disabled:opacity-40"
      >
        ← Prev
      </button>
      {start > 1 && (
        <>
          <PageBtn n={1} active={page === 1} onClick={() => go(1)} />
          {start > 2 && <span className="px-1 text-chalk-400">…</span>}
        </>
      )}
      {nums.map((n) => (
        <PageBtn key={n} n={n} active={n === page} onClick={() => go(n)} />
      ))}
      {end < pages && (
        <>
          {end < pages - 1 && <span className="px-1 text-chalk-400">…</span>}
          <PageBtn n={pages} active={page === pages} onClick={() => go(pages)} />
        </>
      )}
      <button
        disabled={page >= pages}
        onClick={() => go(page + 1)}
        className="btn-outline btn-sm disabled:opacity-40"
      >
        Next →
      </button>
    </div>
  );
}

function PageBtn({ n, active, onClick }: { n: number; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`h-8 min-w-8 rounded-lg px-2 text-sm font-semibold ${
        active ? "bg-ink-900 text-white" : "text-ink-700 hover:bg-chalk-100"
      }`}
    >
      {n}
    </button>
  );
}
