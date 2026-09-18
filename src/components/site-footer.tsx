import Link from "next/link";
import { Logo } from "./logo";
import { SPORTS } from "@/lib/sports";

export function SiteFooter() {
  const featured = SPORTS.slice(0, 8);
  return (
    <footer className="mt-20 border-t border-chalk-200 bg-white">
      <div className="container-wide py-12">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-chalk-500">
              The free national database connecting junior-college athletes with
              four-year programs. Find the next level.
            </p>
          </div>

          <FooterCol title="Browse">
            <FooterLink href="/search">Search Players</FooterLink>
            <FooterLink href="/list-athlete">List an Athlete</FooterLink>
            <FooterLink href="/upload-roster">Upload a Roster</FooterLink>
            <FooterLink href="/login">Coach / Athlete Login</FooterLink>
          </FooterCol>

          <FooterCol title="Sports">
            {featured.map((s) => (
              <FooterLink key={s.slug} href={`/${s.slug}`}>
                {s.name}
              </FooterLink>
            ))}
          </FooterCol>

          <FooterCol title="Platform">
            <FooterLink href="/search">For College Coaches</FooterLink>
            <FooterLink href="/upload-roster">For JUCO Coaches</FooterLink>
            <FooterLink href="/list-athlete">For Athletes</FooterLink>
            <FooterLink href="/admin">Admin</FooterLink>
          </FooterCol>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-chalk-200 pt-6 text-xs text-chalk-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} The JUCO Portal. Completely free at launch.</p>
          <p className="rounded-full bg-chalk-100 px-3 py-1 font-medium text-chalk-500">
            Demo environment — all athletes shown are fictional sample data.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="mb-3 text-[11px] font-bold uppercase tracking-[0.1em] text-ink-900">
        {title}
      </h4>
      <ul className="space-y-2">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-sm text-chalk-500 transition-colors hover:text-accent">
        {children}
      </Link>
    </li>
  );
}
