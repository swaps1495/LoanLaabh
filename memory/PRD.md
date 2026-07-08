# LoanLaabh — Product Requirements Document

## Product
AI-powered loan eligibility & lender matching platform (DSA partner model, India).
- Brand: LoanLaabh | AI Engine: FinMatrix AI™ | Tagline: "Apply Smarter. Borrow Better."
- Live: loanlaabh.com (Vercel) + admin.loanlaabh.com

## Tech Stack
- Next.js 14 (App Router) + Tailwind + shadcn/ui, Plus Jakarta Sans font
- Supabase (PostgreSQL + Email OTP Auth), OpenAI GPT-4o (Emergent key), Vercel hosting

## Core Features (built)
1. 7-step eligibility form (/eligibility): Basic, Residence, Employment, Income/FOIR, Loan, Credit, Consent
2. Rule-based lender screening (lib/matching.js) using real Excel lender data (CIBIL, FOIR slabs, city tiers)
3. GPT-4o AI lead analysis (lib/ai.js): lead_score, approval_probability, risk flags
4. Email OTP auth (Supabase), user dashboard (1 active application max), admin dashboard + lender management
5. Customer result page shows NO lender names (generic "Lender Match #N" cards; names shared by advisor)

## Branding v2.2 (June 2025 — COMPLETE)
- User uploaded official logo (chip + rupee + AI mark, 3 orientations). Processed (white-trim, web-optimized) into /public: logo-icon.png (512px), logo-horizontal.png (1200px), logo-vertical.png (800px)
- Replaced all "L" placeholder logos: navbar, footer (white tile on navy), eligibility nav, dashboard nav, admin nav, login card
- PWA icons (icon-192/512, apple-touch-icon) regenerated from real logo

## Expansion v2.1 (June 2025 — COMPLETE)
- Contact: WhatsApp +91 77700 24242 (wa.me/917770024242) everywhere; email help@loanlaabh.com in footer + advisor banner
- Paisabazaar-style navbar: CIBIL Score (6-item dropdown), Loans (7-item dropdown), Calculators, Credit Cards (SOON badge); mobile expandable groups
- New pages: /cibil-score (what/range/factors/improve/loans anchor sections), /calculators (interactive EMI calculator with sliders), /credit-cards (coming soon)
- Homepage images (via vision expert): 4 featured product cards with photos (personal/business/home/car), Why Us split w/ couple photo, Trust split w/ handshake photo, new Advisor banner section w/ support-agent photo + WhatsApp/email CTAs
- PWA (Option A chosen): /public/manifest.json, sw.js (network-first), icon-192/512 + apple-touch-icon (generated), layout metadata (manifest, themeColor #0A1628), SW registered in providers.js. Play Store (TWA) deferred to later.

## UI Redesign v2 (June 2025 — COMPLETE)
Brand design system: Deep Navy #0A1628, Bright Blue #1A6FE8, Green #22C55E, Amber #F59E0B, bg #F8FAFC, 12px card radius, soft shadows (0 4px 24px rgba(0,0,0,0.06)).
- Homepage (app/page.js): 11 sections — Hero (CIBIL headline + animated FinMatrix panel + 4 trust badges), Problem (4 cards), LoanLaabh Way (5-step timeline, #how-it-works), FinMatrix AI™ (#finmatrix, 11 param chips), Why Us (6 cards), Loan Products (#products, 7 cards), Process (4 cards), Insights™ (#insights, 6 placeholder articles), Trust & Compliance (4 cards), FAQ accordion (8 Qs), Final CTA banner
- Shared components: components/site/navbar.js (sticky, hamburger mobile), components/site/footer.js (disclaimer, WhatsApp)
- Eligibility: 5-step animated FinMatrix loading screen (min ~6.8s) + "Loan Discovery Report" result (star rating from approval_probability, match category badges Strong/Good/Needs Review/Not Suitable, "Why This Match" checkmarks, Continue Application → /dashboard, Talk to Advisor → WhatsApp)
- Animations in globals.css (fm-* keyframes: matrix grid, scanline, pop, fill)
- WhatsApp placeholder everywhere: 919999999999 (user will replace with real number)

## Constraints
- Backend API (/api/[[...path]]/route.js), Supabase schema, auth, admin, dashboard: UNCHANGED in redesign
- /api/leads response only exposes aggregates (count, probability, amount) — no lender names to customer
- User struggles with CLI — give GitHub Web UI / "Save to Github" instructions for deploys

## Pending / Future
- User verification: Supabase Auth production config (Site URL, redirect URLs, {{ .Token }} email template) + live OTP login
- SMS OTP via MSG91 (waiting on user's DLT onboarding)
- Replace WhatsApp placeholder number
- 14 seed lenders marked need_more_info (inactive) in lender_criteria
- Insights: real article pages (currently placeholders)
