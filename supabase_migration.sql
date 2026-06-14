-- LoanLaabh Schema v2 (Pre-qualification + AI analysis)
-- Run this in Supabase SQL Editor. Safe to run on a fresh project.

-- Drop old tables if re-running
drop table if exists public.matches cascade;
drop table if exists public.lenders cascade;
drop table if exists public.leads cascade;
drop table if exists public.lender_criteria cascade;

-- 1. LEADS
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  -- Step 1: Basic
  full_name text not null,
  mobile text not null,
  pan text,
  city text,
  pincode text,
  age integer,
  -- Step 2: Residence
  residence_type text,            -- self_owned | rented | family_owned
  -- Step 3: Employment
  employment_type text not null,  -- salaried | self_employed | business_owner
  company_name text,
  designation text,
  total_experience_years numeric(4,1),
  current_company_experience_years numeric(4,1),
  salary_account_bank text,
  -- Step 4: Income
  net_monthly_salary numeric(14,2) not null,
  existing_emi numeric(14,2) default 0,
  pf_deducted boolean,
  pt_deducted boolean,
  foir numeric(5,2),              -- computed: (existing_emi/net_monthly_salary)*100
  -- Step 5: Loan
  loan_type text not null,        -- personal | business | home | lap | car
  loan_amount numeric(14,2) not null,
  loan_purpose text,
  -- Step 6: Credit
  credit_band text,               -- excellent | good | average | poor | unknown
  recent_enquiries text,          -- yes | no | not_sure
  -- Consent
  consent_share boolean default false,
  consent_terms boolean default false,
  -- AI / CRM
  lead_score integer,
  approval_probability text,      -- High | Medium | Low
  estimated_eligible_amount numeric(14,2),
  recommended_lender_ids uuid[],
  risk_flags text[],
  sales_priority text,            -- Hot | Warm | Cold
  internal_notes text,
  ai_provider text,               -- 'openai' or 'rule_based'
  lead_status text default 'New', -- New|Qualified|Hot|Applied|Approved|Rejected|Disbursed
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index leads_created_at_idx on public.leads(created_at desc);
create index leads_status_idx on public.leads(lead_status);

-- 2. LENDER CRITERIA
create table public.lender_criteria (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  loan_types text[] not null,
  min_cibil integer not null default 650,
  min_age integer not null default 21,
  max_age integer not null default 60,
  min_net_salary numeric(14,2) not null default 15000,
  pf_mandatory boolean default false,
  pt_mandatory boolean default false,
  accepts_employment text[] not null,    -- salaried, self_employed, business_owner
  foir_max numeric(5,2) default 65,      -- max allowed FOIR%
  foir_max_high_income numeric(5,2) default 70, -- if salary > high_income_threshold
  high_income_threshold numeric(14,2) default 75000,
  min_loan_amount numeric(14,2) default 50000,
  max_loan_amount numeric(14,2) default 5000000,
  interest_rate_min numeric(5,2) default 11,
  interest_rate_max numeric(5,2) default 22,
  city_restrictions text[],              -- empty/null = pan-India
  notes text,
  active boolean default true,
  created_at timestamptz default now()
);

-- 3. MATCHES (internal only - never shown to customer)
create table public.matches (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  lender_id uuid not null references public.lender_criteria(id) on delete cascade,
  match_score numeric(5,2),
  estimated_emi numeric(14,2),
  estimated_interest_rate numeric(5,2),
  reasons text[],
  created_at timestamptz default now(),
  unique(lead_id, lender_id)
);
create index matches_lead_idx on public.matches(lead_id);

-- SEED LENDER CRITERIA
insert into public.lender_criteria (name, loan_types, min_cibil, min_age, max_age, min_net_salary, pf_mandatory, pt_mandatory, accepts_employment, foir_max, foir_max_high_income, high_income_threshold, min_loan_amount, max_loan_amount, interest_rate_min, interest_rate_max, notes) values
('HDFC Bank', ARRAY['personal','home','car','lap'], 720, 21, 60, 25000, true, false, ARRAY['salaried','self_employed','business_owner'], 60, 70, 75000, 50000, 5000000, 10.50, 16.50, 'Premium brand'),
('ICICI Bank', ARRAY['personal','home','car','lap','business'], 700, 23, 58, 30000, true, false, ARRAY['salaried','self_employed','business_owner'], 60, 70, 75000, 50000, 4000000, 10.75, 17.00, 'Quick approval'),
('Bajaj Finserv', ARRAY['personal','business','car'], 685, 21, 60, 22000, false, false, ARRAY['salaried','self_employed','business_owner'], 65, 72, 60000, 30000, 4000000, 11.50, 22.00, 'Liberal CIBIL'),
('Tata Capital', ARRAY['personal','home','car','business','lap'], 700, 22, 58, 25000, true, false, ARRAY['salaried','self_employed','business_owner'], 60, 68, 80000, 75000, 3500000, 10.99, 18.50, 'Flexible'),
('Axis Bank', ARRAY['personal','home','car'], 720, 21, 60, 25000, true, false, ARRAY['salaried','self_employed'], 60, 70, 75000, 50000, 4000000, 10.49, 17.50, 'Low rates for salaried'),
('Kotak Mahindra', ARRAY['personal','home','car'], 750, 23, 60, 30000, true, true, ARRAY['salaried','self_employed'], 55, 65, 100000, 100000, 5000000, 10.25, 16.00, 'Premium tier'),
('IDFC First', ARRAY['personal','home','car'], 680, 21, 60, 20000, false, false, ARRAY['salaried','self_employed'], 65, 72, 60000, 50000, 4000000, 10.49, 19.00, 'Liberal policy'),
('Aditya Birla Capital', ARRAY['personal','business'], 700, 21, 60, 25000, false, false, ARRAY['salaried','self_employed','business_owner'], 60, 68, 75000, 50000, 3500000, 12.00, 21.00, 'SME focus'),
('PaySense', ARRAY['personal'], 650, 21, 58, 18000, false, false, ARRAY['salaried','self_employed'], 70, 75, 50000, 5000, 500000, 16.00, 32.00, 'App-based instant'),
('CASHe', ARRAY['personal'], 600, 22, 55, 15000, false, false, ARRAY['salaried'], 70, 75, 40000, 7000, 400000, 24.00, 33.00, 'Young salaried'),
('LIC Housing', ARRAY['home','lap'], 700, 23, 65, 25000, true, false, ARRAY['salaried','self_employed','business_owner'], 60, 70, 75000, 200000, 15000000, 8.50, 11.50, 'Best home rates'),
('SBI', ARRAY['personal','home','car','business'], 720, 21, 65, 25000, true, false, ARRAY['salaried','self_employed','business_owner'], 60, 70, 75000, 50000, 7500000, 8.40, 15.00, 'Lowest rates'),
('Mahindra Finance', ARRAY['car','business'], 650, 21, 60, 18000, false, false, ARRAY['salaried','self_employed','business_owner'], 65, 72, 50000, 50000, 3000000, 12.00, 18.00, 'Tier-2/3 cities'),
('Lendingkart', ARRAY['business'], 650, 23, 60, 30000, false, false, ARRAY['business_owner','self_employed'], 65, 72, 75000, 50000, 2000000, 18.00, 27.00, 'Unsecured business'),
('Fullerton', ARRAY['personal','home','lap','business'], 680, 21, 60, 20000, false, false, ARRAY['salaried','self_employed','business_owner'], 65, 70, 60000, 50000, 3000000, 11.99, 24.00, 'Multi-product');
