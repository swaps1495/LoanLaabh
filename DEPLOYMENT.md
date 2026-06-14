# 🚀 LoanLaabh Production Deployment Guide

Complete checklist for deploying LoanLaabh to production at `https://loanlaabh.com`, `https://www.loanlaabh.com`, and `https://admin.loanlaabh.com`.

---

## 1. Database Setup — Supabase

### 1.1 Run the migrations (in order)
Open **Supabase Dashboard → SQL Editor** and run each in sequence:

1. **`/migration_v3.sql`** — creates `leads`, `lender_criteria`, `lender_foir_slabs`, `matches` tables + seeds 37 real lenders from your Excel
2. **`/migration_v4.sql`** — adds `profiles`, `admins` tables, `user_id` link, single-active-app trigger, full RLS policies, auto-profile creation trigger

Both are accessible at:
- https://www.loanlaabh.com/migration_v3.sql
- https://www.loanlaabh.com/migration_v4.sql

### 1.2 Add yourself as admin
After running migration_v4.sql, add your real admin email:
```sql
insert into public.admins (email, name) values ('your-email@gmail.com', 'Your Name')
  on conflict (email) do nothing;
```

### 1.3 Configure Supabase Auth for Email OTP

Go to **Supabase Dashboard → Authentication → Providers → Email**:
- ✅ **Enable Email provider**
- ✅ **Enable "Confirm email"** (or leave off for faster onboarding)

Go to **Authentication → URL Configuration**:
- **Site URL**: `https://loanlaabh.com`
- **Redirect URLs** (add ALL of these):
  ```
  https://loanlaabh.com/**
  https://www.loanlaabh.com/**
  https://admin.loanlaabh.com/**
  http://localhost:3000/**
  ```

Go to **Authentication → Email Templates → "Magic Link"**:
- Find the template and **replace `{{ .ConfirmationURL }}` with `{{ .Token }}`** so users receive a 6-digit OTP code instead of a magic link.
- Suggested subject: `Your LoanLaabh login code`
- Suggested body:
  ```html
  <h2>Hi there 👋</h2>
  <p>Your LoanLaabh login code is:</p>
  <h1 style="letter-spacing: 8px;">{{ .Token }}</h1>
  <p>This code expires in 10 minutes.</p>
  ```

### 1.4 (Optional but recommended) MSG91 Phone OTP — later
When you're ready to switch from email to phone OTP:
1. Sign up at https://msg91.com
2. Complete DLT registration (mandatory for SMS in India — takes 24-48h first time)
3. In Supabase → Authentication → Providers → **Phone**: enable, choose MSG91, paste your Auth Key + Sender ID + DLT Template
4. Update `/app/app/login/page.js` to use `signInWithOtp({ phone })` instead of `{ email }`

---

## 2. Deploy to Vercel

### 2.1 Connect repo
1. Push your code to GitHub
2. Go to https://vercel.com → "Add New Project" → Import the repo
3. **Framework Preset**: Next.js (auto-detected)
4. **Root Directory**: `./`
5. **Build Command**: `yarn build` (default)
6. **Install Command**: `yarn install` (default)

### 2.2 Environment Variables (Vercel → Settings → Environment Variables)
Add ALL of these:

| Name | Value | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://pnxhjmwxngkvceytfihs.supabase.co` | Public, same as anon |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` (anon key) | Public, OK to expose |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` (service_role) | 🔒 Secret — backend only |
| `ADMIN_PASSWORD` | `Sw@ps9409` | Legacy admin password (optional once OTP is set up) |
| `EMERGENT_LLM_KEY` | `sk-emergent-227310a3c3e407776B` | For GPT-4o lead analysis |
| `LLM_BASE_URL` | `https://integrations.emergentagent.com/llm/v1` | Emergent OpenAI-compatible endpoint |
| `LLM_MODEL` | `gpt-4o` | |
| `NEXT_PUBLIC_BASE_URL` | `https://loanlaabh.com` | Used for redirects |
| `CORS_ORIGINS` | `https://loanlaabh.com,https://www.loanlaabh.com,https://admin.loanlaabh.com` | |

### 2.3 Deploy
Click **"Deploy"** in Vercel. First deploy takes ~2 minutes.

### 2.4 Add custom domains in Vercel
After successful deploy:
1. Vercel Dashboard → your project → **Settings → Domains**
2. Click "Add" and enter `loanlaabh.com` → Vercel will show DNS records
3. Click "Add" again, enter `www.loanlaabh.com`
4. Click "Add" again, enter `admin.loanlaabh.com`
5. Vercel will mark them as "Invalid Configuration" until DNS is set up (next step)

---

## 3. DNS Setup at Hostinger

Log into **Hostinger → hPanel → Domains → loanlaabh.com → DNS / Nameservers**.

### 3.1 Required DNS records

| Type | Name / Host | Value / Points to | TTL |
|---|---|---|---|
| **A** | `@` (or blank) | `76.76.21.21` | 3600 |
| **CNAME** | `www` | `cname.vercel-dns.com` | 3600 |
| **CNAME** | `admin` | `cname.vercel-dns.com` | 3600 |

> ⚠️ Vercel may show slightly different values in their dashboard — **always use what Vercel shows you** for your specific project (above is the standard default).

### 3.2 Remove conflicting records
Delete any existing A or CNAME records for `@`, `www`, or `admin` that don't match the above (e.g., parking page records, old hosting records).

### 3.3 Wait for propagation
- Usually **15 min - 2 hours**
- Check status: https://dnschecker.org/#A/loanlaabh.com
- Vercel will auto-issue SSL certificates once DNS resolves

---

## 4. Post-deploy verification

### Checklist
- [ ] Visit `https://loanlaabh.com` → landing page loads with HTTPS
- [ ] Visit `https://www.loanlaabh.com` → same landing page
- [ ] Visit `https://admin.loanlaabh.com` → redirects to `/admin` login (multi-domain middleware working)
- [ ] Click "Check Eligibility" → redirects to `/login`
- [ ] Enter your email → receive 6-digit OTP → verify → land on `/eligibility`
- [ ] Complete the 7-step form → see pre-qualification result with eligible amount
- [ ] Go to `/dashboard` → see your application with progress tracker
- [ ] Try submitting another application → see "You already have an ongoing application" block
- [ ] Sign out, sign in with your admin email on `/admin` → see all leads, with AI scoring, with status dropdown, with CSV export
- [ ] Visit `/admin/lenders` → see all 37 lenders, can edit / toggle active

---

## 5. Customization checklist (before going live)

| Task | Where | Action |
|---|---|---|
| WhatsApp number | `/app/app/page.js`, `/app/app/dashboard/page.js`, `/app/app/eligibility/page.js` | Search for `919999999999` and replace with your real WhatsApp business number |
| Logo | `/app/app/page.js` (and elsewhere) | Replace the "L" placeholder with your real logo |
| Footer disclaimer | `/app/app/page.js` (footer section) | Update with your actual business address, license details, RBI/SEBI registration if applicable |
| FAQ | `/app/app/page.js` (FAQS constant) | Replace with real customer questions |
| Hero image | `/app/app/page.js` | Replace the Unsplash placeholder with your branded image |

---

## 6. Security hardening (recommended)

- [x] RLS enabled on all tables (already done in migration_v4)
- [ ] Rotate `ADMIN_PASSWORD` or remove legacy login entirely once email OTP works for all admins
- [ ] Add rate limiting to `/api/leads` (e.g., Vercel Edge Middleware or Upstash) to prevent spam
- [ ] Enable Supabase **email verification** if not already on
- [ ] Set up **Vercel Analytics** and **Sentry** for monitoring
- [ ] In Supabase → Authentication → **Rate Limits**, configure OTP email send rate

---

## 7. Troubleshooting

| Problem | Solution |
|---|---|
| "Invalid login credentials" on email OTP | Make sure you changed the Magic Link email template to use `{{ .Token }}` (Supabase → Auth → Email Templates) |
| Admin gets "Unauthorized" after OTP login | Run `insert into public.admins (email, name) values ('your-email', 'You');` in Supabase SQL Editor |
| `admin.loanlaabh.com` shows landing page instead of admin | DNS not propagated yet OR middleware not deployed — wait or redeploy |
| "Supabase not configured" | Env vars missing — check Vercel → Settings → Environment Variables → "All environments" |
| Pre-qualification result shows "no AI analysis" | `EMERGENT_LLM_KEY` not set OR `LLM_BASE_URL` wrong — verify the env vars |
| RLS errors blocking inserts from backend | Backend uses service_role key which bypasses RLS — if you see this, check `SUPABASE_SERVICE_ROLE_KEY` is set correctly |

---

## 8. Useful URLs

- **Production**: https://loanlaabh.com
- **Admin**: https://admin.loanlaabh.com
- **Supabase Dashboard**: https://supabase.com/dashboard/project/pnxhjmwxngkvceytfihs
- **Vercel Dashboard**: (yours, once deployed)
- **Migration files** (publicly served):
  - https://www.loanlaabh.com/migration_v3.sql
  - https://www.loanlaabh.com/migration_v4.sql

---

Built with 🚀 by your AI coder. Questions? Update this doc as you learn what works for your team.
