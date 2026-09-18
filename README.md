# The JUCO Portal

**The free national database connecting junior-college athletes with four-year programs.**

A polished, production-ready MVP. College coaches search available JUCO athletes in seconds,
JUCO coaches upload an entire roster in minutes, and individual athletes create a profile in
about two minutes. No friction. No paywalls. No social-network features.

> **Philosophy:** *Find the next level. No complicated recruiting profiles. Just find players.*

---

## ✨ What's built

| Area | Status |
|---|---|
| **Homepage** — hero, in-page search module, three user pathways, live board | ✅ |
| **Athlete search** — no login required, universal + **sport-specific metric** filters, grid & list views, pagination | ✅ |
| **Athlete profiles** — public recruiting page, stats, academics, eligibility, film embeds, coach/player contact, structured data | ✅ |
| **Athlete self-upload** — 5-step wizard, only shows fields relevant to the sport, privacy controls | ✅ |
| **Coach bulk roster upload** — CSV **and** XLSX, **intelligent column mapping**, "25 ready / 3 missing" preview, one-click publish | ✅ |
| **Coach dashboard** — roster stats, inline status changes, one-click verify | ✅ |
| **Player dashboard** — profile completeness, views, edit stats/film/contact | ✅ |
| **Verification** — Athlete Submitted → Coach Verified → JUCO Portal Verified | ✅ |
| **Admin panel** — analytics, profile moderation, verify athletes/coaches, resolve reports, manage sports, view uploads | ✅ |
| **SEO** — indexable `/baseball`, `/womens-golf`… sport pages, `/schools/*`, `/athletes/*`, sitemap, robots, JSON-LD | ✅ |
| **Reporting & privacy** — "report incorrect info", athlete-controlled contact visibility, contact-reveal to reduce scraping | ✅ |
| **Seed data** — 439 clearly-fictional demo athletes across 18 sports & 24 JUCO programs | ✅ |
| **Mobile-first** — responsive across every page | ✅ |

## 🏗 Tech stack

- **Next.js 15** (App Router) + **TypeScript**
- **Tailwind CSS** — athletic, minimal, premium design system
- **Prisma ORM** + **SQLite** — zero-config so it runs instantly; schema is written to be **Postgres/Supabase-compatible**
- **jose** JWT session (httpOnly cookie) + **bcrypt** — role-based (Admin / Coach / Athlete)
- **SheetJS (xlsx)** + **PapaParse** — in-browser roster parsing (CSV/XLSX)

## 🚀 Run it

```bash
npm install
npm run db:reset      # creates the SQLite DB and seeds 439 demo athletes
npm run dev           # http://localhost:3000
```

`npm run db:reset` = `prisma db push` + seed. Use `npm run db:seed` to re-seed without dropping.

### Demo logins (password: `password123`)

| Role | Email | Try |
|---|---|---|
| Admin | `admin@jucoportal.com` | `/admin` — analytics, moderation, verification |
| JUCO Coach | `coach@jucoportal.com` | `/dashboard/coach` (26-athlete roster) & `/upload-roster` |
| Athlete | `athlete@jucoportal.com` | `/dashboard/athlete` — edit a claimed profile |

**Search needs no account** — go straight to `/search`.

### Try the roster upload
Sign in as the coach, open `/upload-roster`, and drop any CSV/XLSX. Column headers like
`Player`, `POS`, `AVG`, `GPA` are auto-mapped to the right fields.

## 🧩 Data model (flexible by design)

`User · Sport · SportField · School · Coach · Athlete · RosterUpload · Report`

Universal athlete fields are real columns (fast filtering). **Sport-specific metrics** live in a
flexible JSON column keyed by field definitions in [`src/lib/sports.ts`](src/lib/sports.ts) — the
single source of truth that drives forms, athlete cards, search facets, and seed data. **Add a new
sport or performance field by appending to that file** (also mirrored into the `SportField` table
for admin visibility) — no rebuild of the app required.

## 🐘 Moving to Supabase / Postgres later

1. In `prisma/schema.prisma`, change `datasource db { provider = "postgresql" }`.
2. Set `DATABASE_URL` to your Supabase connection string.
3. `npx prisma migrate dev` (the string-based "enums" promote cleanly to native Postgres enums).
4. Object storage for athlete photos: swap the profile-image URL field for a Supabase Storage upload.

The schema, entities and API boundaries were designed so this is a drop-in change.

## 📁 Structure

```
src/
  app/                 # routes (App Router)
    page.tsx           # homepage
    search/            # the database
    athletes/[slug]/   # public athlete profile
    [sport]/           # SEO sport landing pages
    schools/[slug]/    # school pages
    list-athlete/      # athlete self-upload wizard
    upload-roster/     # coach bulk upload
    dashboard/         # coach + athlete dashboards
    admin/             # admin panel
    api/               # auth, athletes, roster, report, admin
  components/          # UI (cards, badges, filters, uploader, panels)
  lib/                 # db, auth, sports config, search, roster mapping, utils
prisma/
  schema.prisma        # data model
  seed.ts              # 439 fictional demo athletes
```

## ⚠️ Note on demo data

All athletes in the seeded database are **fictional sample data** generated for demonstration —
random name combinations with synthetic stats. They do not represent real people. School names are
real institutions (used only as affiliations).
