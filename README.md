# 🧳 Carry-On — teacher materials PWA

Subject → Education system (British / IB / American) → Grades 6–12 → Skills → **PPT / Worksheet** folders.
Writing branches into Fiction, Non-fiction and Analytical Essay. Each teacher signs up with email + password and sees only their own files.

**Stack:** Vite (vanilla JS) + vite-plugin-pwa · Supabase (Auth, Postgres, Storage) · GitHub · Vercel.
**Time needed:** about 30 minutes. All services have free tiers.

---
## Step 1 — Create the Supabase project
1. Go to https://supabase.com → sign in → **New project**.
2. Choose a name, a strong database password (save it) and the region closest to your teachers. Wait until it finishes provisioning.

## Step 2 — Create the database and file storage
1. In Supabase open **SQL Editor → New query**.
2. Paste the whole content of `supabase/schema.sql` and click **Run**. It should say "Success".
3. Check: **Table Editor** shows `subjects` and `materials`; **Storage** shows a private bucket called `materials`.

## Step 3 — Copy your API keys
In Supabase: **Project Settings → API** (or the "Connect" button). Copy:
- **Project URL**
- **anon / publishable key** (safe to expose in the browser because Row Level Security protects the data).
Never use or commit the `service_role` / secret key.

## Step 4 — Run it locally (optional but recommended)
```bash
npm install
cp .env.example .env        # then paste your URL and key into .env
npm run dev                 # opens http://localhost:5173
```
Create an account, add a subject, upload a file. In Supabase **Table Editor → materials** you should see the row, and the file under **Storage → materials**.

## Step 5 — Push to GitHub
1. Create an empty repo on https://github.com/new (no README).
2. In this folder:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR-USER/carry-on.git
git push -u origin main
```
`.env` is git-ignored, so your keys are not uploaded.

## Step 6 — Deploy on Vercel
1. https://vercel.com → **Add New → Project** → import your GitHub repo.
2. Framework preset: **Vite** (auto-detected). Build command `npm run build`, output `dist`.
3. Open **Environment Variables** and add:
   - `VITE_SUPABASE_URL` = your Project URL
   - `VITE_SUPABASE_ANON_KEY` = your anon/publishable key
4. Click **Deploy**. You get a URL like `https://carry-on-xyz.vercel.app`. Every future `git push` redeploys automatically.

## Step 7 — Tell Supabase your live URL (important for login emails)
Supabase → **Authentication → URL Configuration**:
- **Site URL:** your Vercel URL
- **Redirect URLs:** add `https://your-app.vercel.app/**` and `http://localhost:5173/**`
Without this, confirmation emails link to localhost.

## Step 8 — Configure sign-up for real teachers
Supabase → **Authentication**:
- **Providers → Email:** enabled. Keep **Confirm email** on so only real addresses sign up.
- **SMTP Settings:** Supabase's built-in mailer is limited to a few emails per hour and is meant for testing. Before inviting teachers, add a custom SMTP provider (Resend, Brevo, Postmark, etc.).
- Optional: Google sign-in under **Providers** (needs a Google Cloud OAuth client) — the app would need a small button added.

## Step 9 — Test and install
1. Open the Vercel URL, create an account, confirm the email, sign in.
2. Add a subject → British → Grade 9 → Writing → Fiction → upload a PPT.
3. Sign up a second account and check it **cannot** see the first teacher's data.
4. Install: Chrome/Edge → install icon in the address bar; Android → menu → *Install app*; iPhone Safari → Share → *Add to Home Screen*.

---
## Good to know
- **Offline:** the app shell loads offline. Folders and files need a connection; viewing cached files and queueing uploads offline are not built yet.
- **Limits (free plan):** about 1 GB storage and 50 MB per file. Raise the per-file limit in Storage settings on a paid plan.
- **Costs:** usage is not shared between teachers — all files count against your single Supabase project.
- **Backups:** the free plan has no automatic project backups; export important data or upgrade.
- **Troubleshooting:** blank page → check the two env vars in Vercel and redeploy; "new row violates row-level security" → re-run `schema.sql`; confirmation email not arriving → set up SMTP (Step 8).

## Not included yet
Renaming/deleting subjects, search, sharing between teachers, offline upload queue.
