# 📋 Job Tracker

A personal job application tracker built with Vite + React + Supabase, deployable on Vercel.

---

## 🗄️ 1. Set up Supabase

### Create the table

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Open the **SQL Editor** and run:

```sql
CREATE TABLE job_applications (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name     TEXT NOT NULL,
  company_website  TEXT,
  source           TEXT CHECK (source IN ('LinkedIn', 'Infojobs')),
  location         TEXT,
  job_title        TEXT NOT NULL,
  job_link         TEXT,
  application_date DATE,
  status           TEXT CHECK (status IN (
    'Discarded',
    'No Reply',
    'Applied',
    'Contacted',
    'Waiting 2nd interview'
  )),
  notes            TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (since this is personal use, allow all for anon)
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for anon"
  ON job_applications
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);
```

3. Go to **Project Settings → API** and copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon/public key** → `VITE_SUPABASE_ANON_KEY`

---
## 💻 2. Run locally

```bash
# Clone / download this project
cd job-tracker

# Install dependencies
npm install

# Create your env file
cp .env.example .env

# Fill in your Supabase credentials in .env
# VITE_SUPABASE_URL=https://xxxx.supabase.co
# VITE_SUPABASE_ANON_KEY=eyJhbGc...

# Start dev server
npm run dev
```

App will be at `http://localhost:5173`

---

## 🚀 3. Deploy to Vercel

### Option A — Via Vercel CLI
```bash
npm install -g vercel
vercel
# Follow the prompts
```

### Option B — Via GitHub (recommended)
1. Push this project to a GitHub repository
2. Go to [vercel.com](https://vercel.com) → **New Project** → import your repo
3. In **Environment Variables**, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Click **Deploy** — done!

---

## ✨ Features

- **Dashboard** with filterable, searchable job cards
- **Status badges** — Discarded, No Reply, Applied, Contacted, Waiting 2nd interview
- **Filter** by status, search by title/company/location, sort by date/status/company
- **Add/Edit** applications via a slide-in panel
- **Links** to company website and job posting on every card
- Full **CRUD** backed by Supabase

## 🔒 Security note

This app uses the `anon` key with a permissive RLS policy — fine for personal, private use. If you ever share the URL, consider adding Supabase Auth to protect your data.