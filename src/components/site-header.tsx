"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./logo";
import { cn } from "@/lib/utils";
import type { SessionPayload } from "@/lib/auth";

const NAV = [
  { href: "/search", label: "Search Players" },
  { href: "/list-athlete", label: "List an Athlete" },
  { href: "/upload-roster", label: "Upload Roster" },
];

export function SiteHeader({ session }: { session: SessionPayload | null }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const dashHref =
    session?.role === "ADMIN"
      ? "/admin"
      : session?.role === "COACH"
      ? "/dashboard/coach"
      : "/dashboard/athlete";

  return (
    <header className="sticky top-0 z-50 border-b border-chalk-200 bg-white/85 backdrop-blur-md">
      <div className="container-wide flex h-16 items-center justify-between gap-4">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-semibold text-ink-700 transition-colors hover:bg-chalk-100 hover:text-ink-900",
                pathname === item.href && "text-ink-900"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {session ? (
            <>
              <Link href={dashHref} className="btn-ghost btn-md">
                Dashboard
              </Link>
              <form action="/api/auth/logout" method="post">
                <button type="submit" className="btn-outline btn-md">
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-ghost btn-md">
                Log in
              </Link>
              <Link href="/search" className="btn-dark btn-md">
                Find Players
              </Link>
            </>
          )}
        </div>

        <button
          className="grid h-10 w-10 place-items-center rounded-lg text-ink-900 hover:bg-chalk-100 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.2">
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <div className="border-t border-chalk-200 bg-white md:hidden">
          <div className="container-wide flex flex-col gap-1 py-3">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-semibold text-ink-800 hover:bg-chalk-100"
              >
                {item.label}
              </Link>
            ))}
            <div className="my-2 h-px bg-chalk-200" />
            {session ? (
              <>
                <Link href={dashHref} onClick={() => setOpen(false)} className="btn-outline btn-md">
                  Dashboard
                </Link>
                <form action="/api/auth/logout" method="post" className="mt-2">
                  <button type="submit" className="btn-ghost btn-md w-full">
                    Sign out
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)} className="btn-outline btn-md">
                  Log in
                </Link>
                <Link href="/search" onClick={() => setOpen(false)} className="btn-dark btn-md mt-2">
                  Find Players
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
