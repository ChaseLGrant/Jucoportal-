# Deploying The JUCO Portal (beginner-friendly)

You'll put the app online with two free services:

- **Supabase** — the database (stores athletes, coaches, etc.)
- **Vercel** — the hosting (runs the website, gives you a public URL)

Your code is already on GitHub, so this is mostly clicking buttons. Budget ~20 minutes.

---

## Step 1 — Create the database (Supabase)

1. Go to **https://supabase.com** → **Start your project** → sign in with GitHub.
2. Click **New project**. Pick a name (e.g. `juco-portal`), set a **database password** (save it somewhere), choose a region near your users, and create it. Wait ~2 minutes.
3. In the project, go to **Project Settings** (gear icon) → **Database**.
4. Under **Connection string**, choose **URI**. It looks like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.abcdxyz.supabase.co:5432/postgres
   ```
5. Copy it and replace `[YOUR-PASSWORD]` with the password from step 2. **Keep this handy** — it's your `DATABASE_URL`.

> If deploys later show "too many connections", come back and use the **Connection pooling** string (port `6543`) and add `?pgbouncer=true` to the end. Not needed to start.

---

## Step 2 — Prepare a few secret values

You'll need three more values besides the database URL:

- **AUTH_SECRET** — a long random string (protects logins). Generate one:
  - Mac/Linux terminal: `openssl rand -base64 32`
  - Or use any random-string generator and paste 40+ characters.
- **SEED_SECRET** — another random string (protects the "load demo data" button). Make up ~20 characters.
- **NEXT_PUBLIC_SITE_URL** — leave as `https://your-app.vercel.app` for now; you'll update it after Step 3.

---

## Step 3 — Deploy the website (Vercel)

1. Go to **https://vercel.com** → **Sign up** with GitHub.
2. Click **Add New… → Project**, then **Import** the repository **`ChaseLGrant/Jucoportal-`**.
3. Vercel auto-detects Next.js — don't change the build settings.
4. **Set the production branch:** after import, go to **Settings → Git → Production Branch** and set it to `claude/intelligent-babbage-wleqw9` (that's where your code is). *(Or ask Claude to move the code to `main`.)*
5. Open **Settings → Environment Variables** and add these four (Environment: **Production**):

   | Name | Value |
   |---|---|
   | `DATABASE_URL` | the Supabase URI from Step 1 |
   | `AUTH_SECRET` | your random string |
   | `SEED_SECRET` | your other random string |
   | `NEXT_PUBLIC_SITE_URL` | `https://your-app.vercel.app` (update after first deploy) |

6. Click **Deploy**. The build automatically creates all database tables (it runs `prisma migrate deploy`). Wait for "Congratulations".
7. Copy your live URL (e.g. `https://juco-portal-xyz.vercel.app`). Go back to **Environment Variables**, update `NEXT_PUBLIC_SITE_URL` to that URL, and **redeploy** (Deployments → ⋯ → Redeploy).

---

## Step 4 — Load the demo athletes (one time)

Visit this URL in your browser, replacing both parts:

```
https://YOUR-APP.vercel.app/api/seed?token=YOUR-SEED-SECRET
```

You should see `"ok": true` and `"athletes": 439`. Your database now has demo data.

> ⚠️ This **wipes and reloads** demo data every time it's run. Once you have real athletes, **delete the `SEED_SECRET` variable in Vercel** so nobody can reset your database.

---

## Step 5 — Try it live

- Open your Vercel URL — search should show hundreds of athletes.
- Log in (top right) with the demo accounts (password `password123`):
  - `admin@jucoportal.com` → `/admin`
  - `coach@jucoportal.com` → coach dashboard + roster upload
  - `athlete@jucoportal.com` → athlete dashboard

**Change the demo passwords** (or reseed with your own accounts) before sharing publicly.

---

## Optional — Custom domain

In Vercel: **Settings → Domains → Add**. Buy a domain (e.g. from Namecheap or Vercel), follow the DNS instructions, then update `NEXT_PUBLIC_SITE_URL` to your domain and redeploy.

---

## Updating the site later

Every time new code is pushed to your production branch on GitHub, Vercel redeploys automatically. Just ask Claude to make changes and push.

## Troubleshooting

- **Build fails on "migrate deploy"** → `DATABASE_URL` is wrong or the password wasn't substituted. Fix it in Vercel env vars and redeploy.
- **"Too many connections"** → switch `DATABASE_URL` to the Supabase pooler string (port 6543) with `?pgbouncer=true`.
- **Seed URL returns 401** → the `token` doesn't match your `SEED_SECRET`.
- **Seed URL returns 403** → `SEED_SECRET` isn't set in Vercel.
