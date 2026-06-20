-- LoanLaabh Self-Contained Safe Migration (v3-final)
-- Creates tables IF NOT EXISTS, alters with ADD COLUMN IF NOT EXISTS, then seeds real Excel data.
-- Safe to re-run.

-- ========== 1. CREATE TABLES IF NEEDED ==========

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  full_name text not null, mobile text not null, pan text, city text, pincode text, age integer,
  residence_type text,
  employment_type text not null, company_name text, designation text,
  total_experience_years numeric(4,1), current_company_experience_years numeric(4,1), salary_account_bank text,
  net_monthly_salary numeric(14,2) not null, existing_emi numeric(14,2) default 0,
  pf_deducted boolean, pt_deducted boolean, foir numeric(5,2),
  loan_type text not null, loan_amount numeric(14,2) not null, loan_purpose text,
  credit_band text, recent_enquiries text,
  consent_share boolean default false, consent_terms boolean default false,
  lead_score integer, approval_probability text, estimated_eligible_amount numeric(14,2),
  recommended_lender_ids uuid[], risk_flags text[], sales_priority text, internal_notes text, ai_provider text,
  lead_status text default 'New',
  created_at timestamptz default now(), updated_at timestamptz default now()
);
create index if not exists leads_created_at_idx on public.leads(created_at desc);
create index if not exists leads_status_idx on public.leads(lead_status);

create table if not exists public.lender_criteria (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  loan_types text[] not null default ARRAY['personal'],
  min_cibil integer,
  min_age integer, max_age integer,
  min_net_salary numeric(14,2),
  pf_mandatory boolean default false, pt_mandatory boolean default false,
  accepts_employment text[] not null default ARRAY['salaried'],
  foir_max numeric(5,2) default 65, foir_max_high_income numeric(5,2) default 75,
  high_income_threshold numeric(14,2) default 80000,
  min_loan_amount numeric(14,2) default 50000, max_loan_amount numeric(14,2) default 5000000,
  interest_rate_min numeric(5,2) default 10.5, interest_rate_max numeric(5,2) default 22,
  city_restrictions text[], notes text, active boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  lender_id uuid not null references public.lender_criteria(id) on delete cascade,
  match_score numeric(5,2), estimated_emi numeric(14,2), estimated_interest_rate numeric(5,2),
  reasons text[], created_at timestamptz default now(),
  unique(lead_id, lender_id)
);
create index if not exists matches_lead_idx on public.matches(lead_id);

-- ========== 2. ADD NEW COLUMNS (safe / idempotent) ==========

alter table public.lender_criteria
  add column if not exists min_net_salary_general numeric(14,2),
  add column if not exists min_net_salary_metro numeric(14,2),
  add column if not exists min_net_salary_tier2 numeric(14,2),
  add column if not exists max_latest_enquiries integer,
  add column if not exists status text default 'active',
  add column if not exists allowed_address_proofs text[];

alter table public.leads
  add column if not exists city_tier text,
  add column if not exists latest_credit_enquiries_count integer;

-- ========== 3. NEW TABLE: FOIR slabs ==========

create table if not exists public.lender_foir_slabs (
  id uuid primary key default gen_random_uuid(),
  lender_id uuid not null references public.lender_criteria(id) on delete cascade,
  income_min numeric(14,2) not null,
  income_max numeric(14,2),
  foir_max numeric(5,2) not null,
  notes text,
  created_at timestamptz default now()
);
create index if not exists foir_lender_idx on public.lender_foir_slabs(lender_id);

-- ========== 4. CLEAR OLD SEED DATA & RESEED FROM EXCEL ==========

delete from public.matches;
delete from public.lender_foir_slabs;
delete from public.lender_criteria;

-- 37 real lenders from LoanLaabh_PL_Eligibility Excel

insert into public.lender_criteria (name, loan_types, min_cibil, min_age, max_age, min_net_salary, min_net_salary_general, min_net_salary_metro, min_net_salary_tier2, max_latest_enquiries, pf_mandatory, pt_mandatory, accepts_employment, foir_max, foir_max_high_income, high_income_threshold, min_loan_amount, max_loan_amount, interest_rate_min, interest_rate_max, allowed_address_proofs, notes, active, status) values (
  'Aditya Birla Finance Limited', ARRAY['personal']::text[], 700, 21, 56,
  25000, 25000, NULL, NULL,
  2, true, true,
  ARRAY['salaried']::text[], 65, 75, 80000, 50000, 4000000, 10.5, 22.0,
  ARRAY['Updated Aadhaar','Gas receipt','Light bill']::text[], NULL, true, 'active'
);
insert into public.lender_criteria (name, loan_types, min_cibil, min_age, max_age, min_net_salary, min_net_salary_general, min_net_salary_metro, min_net_salary_tier2, max_latest_enquiries, pf_mandatory, pt_mandatory, accepts_employment, foir_max, foir_max_high_income, high_income_threshold, min_loan_amount, max_loan_amount, interest_rate_min, interest_rate_max, allowed_address_proofs, notes, active, status) values (
  'Axis Bank', ARRAY['personal']::text[], 740, 21, 55,
  25000, 25000, NULL, NULL,
  3, true, true,
  ARRAY['salaried']::text[], 65, 75, 80000, 50000, 4000000, 10.5, 22.0,
  ARRAY['Updated Aadhaar','Gas receipt','Light bill','Rent Agreement']::text[], NULL, true, 'active'
);
insert into public.lender_criteria (name, loan_types, min_cibil, min_age, max_age, min_net_salary, min_net_salary_general, min_net_salary_metro, min_net_salary_tier2, max_latest_enquiries, pf_mandatory, pt_mandatory, accepts_employment, foir_max, foir_max_high_income, high_income_threshold, min_loan_amount, max_loan_amount, interest_rate_min, interest_rate_max, allowed_address_proofs, notes, active, status) values (
  'Axis Finance', ARRAY['personal']::text[], 730, 21, 58,
  35000, NULL, 35000, 30000,
  3, true, true,
  ARRAY['salaried']::text[], 65, 75, 80000, 50000, 4000000, 10.5, 22.0,
  ARRAY['Updated Aadhaar','Gas receipt','Light bill']::text[], 'Salary differs by city tier (Metro/Tier2).', true, 'active'
);
insert into public.lender_criteria (name, loan_types, min_cibil, min_age, max_age, min_net_salary, min_net_salary_general, min_net_salary_metro, min_net_salary_tier2, max_latest_enquiries, pf_mandatory, pt_mandatory, accepts_employment, foir_max, foir_max_high_income, high_income_threshold, min_loan_amount, max_loan_amount, interest_rate_min, interest_rate_max, allowed_address_proofs, notes, active, status) values (
  'Bajaj Finance Limited', ARRAY['personal']::text[], 730, 21, 55,
  35000, NULL, 35000, 30000,
  5, true, true,
  ARRAY['salaried']::text[], 65, 75, 80000, 50000, 4000000, 10.5, 22.0,
  ARRAY['Updated Aadhaar','Gas receipt','Light bill']::text[], 'Salary differs by city tier (Metro/Tier2).', true, 'active'
);
insert into public.lender_criteria (name, loan_types, min_cibil, min_age, max_age, min_net_salary, min_net_salary_general, min_net_salary_metro, min_net_salary_tier2, max_latest_enquiries, pf_mandatory, pt_mandatory, accepts_employment, foir_max, foir_max_high_income, high_income_threshold, min_loan_amount, max_loan_amount, interest_rate_min, interest_rate_max, allowed_address_proofs, notes, active, status) values (
  'Bajaj Finserv Direct Limited', ARRAY['personal']::text[], 700, 21, 55,
  30000, NULL, 30000, 25000,
  5, NULL, NULL,
  ARRAY['salaried']::text[], 65, 75, 80000, 50000, 4000000, 10.5, 22.0,
  ARRAY['Updated Aadhaar','Gas receipt','Light bill']::text[], 'Salary differs by city tier (Metro/Tier2).', true, 'active'
);
insert into public.lender_criteria (name, loan_types, min_cibil, min_age, max_age, min_net_salary, min_net_salary_general, min_net_salary_metro, min_net_salary_tier2, max_latest_enquiries, pf_mandatory, pt_mandatory, accepts_employment, foir_max, foir_max_high_income, high_income_threshold, min_loan_amount, max_loan_amount, interest_rate_min, interest_rate_max, allowed_address_proofs, notes, active, status) values (
  'Bandhan Bank Limited', ARRAY['personal']::text[], 730, 23, 65,
  35000, NULL, 35000, 20000,
  4, true, true,
  ARRAY['salaried']::text[], 65, 75, 80000, 50000, 4000000, 10.5, 22.0,
  ARRAY['Updated Aadhaar','Gas receipt','Light bill']::text[], 'Salary differs by city tier (Metro/Tier2).', true, 'active'
);
insert into public.lender_criteria (name, loan_types, min_cibil, min_age, max_age, min_net_salary, min_net_salary_general, min_net_salary_metro, min_net_salary_tier2, max_latest_enquiries, pf_mandatory, pt_mandatory, accepts_employment, foir_max, foir_max_high_income, high_income_threshold, min_loan_amount, max_loan_amount, interest_rate_min, interest_rate_max, allowed_address_proofs, notes, active, status) values (
  'Bhanix Finance & Investment Limited (Cashe)', ARRAY['personal']::text[], NULL, NULL, NULL,
  15000, NULL, NULL, NULL,
  NULL, NULL, NULL,
  ARRAY['salaried']::text[], 65, 75, 80000, 50000, 4000000, 10.5, 22.0,
  ARRAY['Updated Aadhaar','Gas receipt','Light bill']::text[], NULL, false, 'need_more_info'
);
insert into public.lender_criteria (name, loan_types, min_cibil, min_age, max_age, min_net_salary, min_net_salary_general, min_net_salary_metro, min_net_salary_tier2, max_latest_enquiries, pf_mandatory, pt_mandatory, accepts_employment, foir_max, foir_max_high_income, high_income_threshold, min_loan_amount, max_loan_amount, interest_rate_min, interest_rate_max, allowed_address_proofs, notes, active, status) values (
  'Bright Loans (Avinash Capital Markets Pvt Ltd) (Fittr)', ARRAY['personal']::text[], NULL, NULL, NULL,
  15000, NULL, NULL, NULL,
  NULL, NULL, NULL,
  ARRAY['salaried']::text[], 65, 75, 80000, 50000, 4000000, 10.5, 22.0,
  ARRAY['Updated Aadhaar','Gas receipt','Light bill']::text[], NULL, false, 'need_more_info'
);
insert into public.lender_criteria (name, loan_types, min_cibil, min_age, max_age, min_net_salary, min_net_salary_general, min_net_salary_metro, min_net_salary_tier2, max_latest_enquiries, pf_mandatory, pt_mandatory, accepts_employment, foir_max, foir_max_high_income, high_income_threshold, min_loan_amount, max_loan_amount, interest_rate_min, interest_rate_max, allowed_address_proofs, notes, active, status) values (
  'Chola Mandalam Bank', ARRAY['personal']::text[], 675, 23, 58,
  25000, NULL, 25000, 20000,
  4, true, true,
  ARRAY['salaried']::text[], 65, 75, 80000, 50000, 4000000, 10.5, 22.0,
  ARRAY['Updated Aadhaar','Gas receipt','Light bill']::text[], 'Address note: rest of maharastra owne house required; Salary differs by city tier (Metro/Tier2).', true, 'active'
);
insert into public.lender_criteria (name, loan_types, min_cibil, min_age, max_age, min_net_salary, min_net_salary_general, min_net_salary_metro, min_net_salary_tier2, max_latest_enquiries, pf_mandatory, pt_mandatory, accepts_employment, foir_max, foir_max_high_income, high_income_threshold, min_loan_amount, max_loan_amount, interest_rate_min, interest_rate_max, allowed_address_proofs, notes, active, status) values (
  'Equitas', ARRAY['personal']::text[], NULL, NULL, NULL,
  15000, NULL, NULL, NULL,
  NULL, NULL, NULL,
  ARRAY['salaried']::text[], 65, 75, 80000, 50000, 4000000, 10.5, 22.0,
  ARRAY['Updated Aadhaar','Gas receipt','Light bill']::text[], NULL, false, 'need_more_info'
);
insert into public.lender_criteria (name, loan_types, min_cibil, min_age, max_age, min_net_salary, min_net_salary_general, min_net_salary_metro, min_net_salary_tier2, max_latest_enquiries, pf_mandatory, pt_mandatory, accepts_employment, foir_max, foir_max_high_income, high_income_threshold, min_loan_amount, max_loan_amount, interest_rate_min, interest_rate_max, allowed_address_proofs, notes, active, status) values (
  'FI (Epifi Technologies)', ARRAY['personal']::text[], NULL, NULL, NULL,
  15000, NULL, NULL, NULL,
  NULL, NULL, NULL,
  ARRAY['salaried']::text[], 65, 75, 80000, 50000, 4000000, 10.5, 22.0,
  ARRAY['Updated Aadhaar','Gas receipt','Light bill']::text[], NULL, false, 'need_more_info'
);
insert into public.lender_criteria (name, loan_types, min_cibil, min_age, max_age, min_net_salary, min_net_salary_general, min_net_salary_metro, min_net_salary_tier2, max_latest_enquiries, pf_mandatory, pt_mandatory, accepts_employment, foir_max, foir_max_high_income, high_income_threshold, min_loan_amount, max_loan_amount, interest_rate_min, interest_rate_max, allowed_address_proofs, notes, active, status) values (
  'Fatakpay', ARRAY['personal']::text[], 650, 21, 60,
  17500, 17500, NULL, NULL,
  10, false, false,
  ARRAY['salaried']::text[], 65, 75, 80000, 50000, 4000000, 10.5, 22.0,
  ARRAY['Updated Aadhaar','Gas receipt','Light bill']::text[], 'Address note: rest of maharastra owne house required', true, 'active'
);
insert into public.lender_criteria (name, loan_types, min_cibil, min_age, max_age, min_net_salary, min_net_salary_general, min_net_salary_metro, min_net_salary_tier2, max_latest_enquiries, pf_mandatory, pt_mandatory, accepts_employment, foir_max, foir_max_high_income, high_income_threshold, min_loan_amount, max_loan_amount, interest_rate_min, interest_rate_max, allowed_address_proofs, notes, active, status) values (
  'Fibe (Early Salary Services)', ARRAY['personal']::text[], NULL, NULL, NULL,
  15000, NULL, NULL, NULL,
  NULL, NULL, NULL,
  ARRAY['salaried']::text[], 65, 75, 80000, 50000, 4000000, 10.5, 22.0,
  ARRAY['Updated Aadhaar','Gas receipt','Light bill']::text[], NULL, false, 'need_more_info'
);
insert into public.lender_criteria (name, loan_types, min_cibil, min_age, max_age, min_net_salary, min_net_salary_general, min_net_salary_metro, min_net_salary_tier2, max_latest_enquiries, pf_mandatory, pt_mandatory, accepts_employment, foir_max, foir_max_high_income, high_income_threshold, min_loan_amount, max_loan_amount, interest_rate_min, interest_rate_max, allowed_address_proofs, notes, active, status) values (
  'Finnable', ARRAY['personal']::text[], 670, 21, 54,
  20000, NULL, 20000, 15000,
  4, false, false,
  ARRAY['salaried']::text[], 65, 75, 80000, 50000, 4000000, 10.5, 22.0,
  ARRAY['No address proof required']::text[], 'Salary differs by city tier (Metro/Tier2).', true, 'active'
);
insert into public.lender_criteria (name, loan_types, min_cibil, min_age, max_age, min_net_salary, min_net_salary_general, min_net_salary_metro, min_net_salary_tier2, max_latest_enquiries, pf_mandatory, pt_mandatory, accepts_employment, foir_max, foir_max_high_income, high_income_threshold, min_loan_amount, max_loan_amount, interest_rate_min, interest_rate_max, allowed_address_proofs, notes, active, status) values (
  'Finzy', ARRAY['personal']::text[], NULL, NULL, NULL,
  15000, NULL, NULL, NULL,
  NULL, NULL, NULL,
  ARRAY['salaried']::text[], 65, 75, 80000, 50000, 4000000, 10.5, 22.0,
  ARRAY['Updated Aadhaar','Gas receipt','Light bill']::text[], NULL, false, 'need_more_info'
);
insert into public.lender_criteria (name, loan_types, min_cibil, min_age, max_age, min_net_salary, min_net_salary_general, min_net_salary_metro, min_net_salary_tier2, max_latest_enquiries, pf_mandatory, pt_mandatory, accepts_employment, foir_max, foir_max_high_income, high_income_threshold, min_loan_amount, max_loan_amount, interest_rate_min, interest_rate_max, allowed_address_proofs, notes, active, status) values (
  'HDFC Bank', ARRAY['personal']::text[], 730, 21, 58,
  35000, NULL, 35000, 30000,
  3, true, true,
  ARRAY['salaried']::text[], 65, 75, 80000, 50000, 4000000, 10.5, 22.0,
  ARRAY['Updated Aadhaar','Gas receipt','Light bill']::text[], 'Address note: rest of maharastra owne house required; Salary differs by city tier (Metro/Tier2).', true, 'active'
);
insert into public.lender_criteria (name, loan_types, min_cibil, min_age, max_age, min_net_salary, min_net_salary_general, min_net_salary_metro, min_net_salary_tier2, max_latest_enquiries, pf_mandatory, pt_mandatory, accepts_employment, foir_max, foir_max_high_income, high_income_threshold, min_loan_amount, max_loan_amount, interest_rate_min, interest_rate_max, allowed_address_proofs, notes, active, status) values (
  'HDFC Bank ( Emerging )', ARRAY['personal']::text[], 730, 21, 58,
  35000, NULL, 35000, 30000,
  3, true, true,
  ARRAY['salaried']::text[], 65, 75, 80000, 50000, 4000000, 10.5, 22.0,
  ARRAY['Updated Aadhaar','Gas receipt','Light bill']::text[], 'Address note: rest of maharastra owne house required; Salary differs by city tier (Metro/Tier2).', true, 'active'
);
insert into public.lender_criteria (name, loan_types, min_cibil, min_age, max_age, min_net_salary, min_net_salary_general, min_net_salary_metro, min_net_salary_tier2, max_latest_enquiries, pf_mandatory, pt_mandatory, accepts_employment, foir_max, foir_max_high_income, high_income_threshold, min_loan_amount, max_loan_amount, interest_rate_min, interest_rate_max, allowed_address_proofs, notes, active, status) values (
  'ICICI', ARRAY['personal']::text[], 725, 21, 58,
  35000, NULL, 35000, 30000,
  3, true, true,
  ARRAY['salaried']::text[], 65, 75, 80000, 50000, 4000000, 10.5, 22.0,
  ARRAY['NO address proof required']::text[], 'Address note: rest of maharsatra owne house required; rest of maharsatra owne house required; Salary differs by city tier (Metro/Tier2).', true, 'active'
);
insert into public.lender_criteria (name, loan_types, min_cibil, min_age, max_age, min_net_salary, min_net_salary_general, min_net_salary_metro, min_net_salary_tier2, max_latest_enquiries, pf_mandatory, pt_mandatory, accepts_employment, foir_max, foir_max_high_income, high_income_threshold, min_loan_amount, max_loan_amount, interest_rate_min, interest_rate_max, allowed_address_proofs, notes, active, status) values (
  'IDFC FIRST BANK', ARRAY['personal']::text[], 730, 21, 55,
  25000, 25000, NULL, NULL,
  2, true, true,
  ARRAY['salaried']::text[], 65, 75, 80000, 50000, 4000000, 10.5, 22.0,
  ARRAY['Updated Aadhaar','Gas receipt','Light bill']::text[], NULL, true, 'active'
);
insert into public.lender_criteria (name, loan_types, min_cibil, min_age, max_age, min_net_salary, min_net_salary_general, min_net_salary_metro, min_net_salary_tier2, max_latest_enquiries, pf_mandatory, pt_mandatory, accepts_employment, foir_max, foir_max_high_income, high_income_threshold, min_loan_amount, max_loan_amount, interest_rate_min, interest_rate_max, allowed_address_proofs, notes, active, status) values (
  'Incred Finance', ARRAY['personal']::text[], 700, 21, 54,
  20000, NULL, 20000, 15,
  3, false, false,
  ARRAY['salaried']::text[], 65, 75, 80000, 50000, 4000000, 10.5, 22.0,
  ARRAY['Updated Aadhaar','Gas receipt','Light bill']::text[], 'Salary differs by city tier (Metro/Tier2).', true, 'active'
);
insert into public.lender_criteria (name, loan_types, min_cibil, min_age, max_age, min_net_salary, min_net_salary_general, min_net_salary_metro, min_net_salary_tier2, max_latest_enquiries, pf_mandatory, pt_mandatory, accepts_employment, foir_max, foir_max_high_income, high_income_threshold, min_loan_amount, max_loan_amount, interest_rate_min, interest_rate_max, allowed_address_proofs, notes, active, status) values (
  'Indusind Bank', ARRAY['personal']::text[], 700, 21, 58,
  30000, NULL, 30000, 20,
  4, true, true,
  ARRAY['salaried']::text[], 65, 75, 80000, 50000, 4000000, 10.5, 22.0,
  ARRAY['NO address proof required']::text[], 'Address note: rest of maharsatra owne house required; rest of maharsatra owne house required; Salary differs by city tier (Metro/Tier2).', true, 'active'
);
insert into public.lender_criteria (name, loan_types, min_cibil, min_age, max_age, min_net_salary, min_net_salary_general, min_net_salary_metro, min_net_salary_tier2, max_latest_enquiries, pf_mandatory, pt_mandatory, accepts_employment, foir_max, foir_max_high_income, high_income_threshold, min_loan_amount, max_loan_amount, interest_rate_min, interest_rate_max, allowed_address_proofs, notes, active, status) values (
  'Kotak', ARRAY['personal']::text[], 730, 21, 56,
  35000, NULL, 35000, 30000,
  3, true, true,
  ARRAY['salaried']::text[], 65, 75, 80000, 50000, 4000000, 10.5, 22.0,
  ARRAY['Updated Aadhaar','Gas receipt','Light bill']::text[], 'Address note: rest of maharastra owne house required; Salary differs by city tier (Metro/Tier2).', true, 'active'
);
insert into public.lender_criteria (name, loan_types, min_cibil, min_age, max_age, min_net_salary, min_net_salary_general, min_net_salary_metro, min_net_salary_tier2, max_latest_enquiries, pf_mandatory, pt_mandatory, accepts_employment, foir_max, foir_max_high_income, high_income_threshold, min_loan_amount, max_loan_amount, interest_rate_min, interest_rate_max, allowed_address_proofs, notes, active, status) values (
  'L&T Finance', ARRAY['personal']::text[], 700, 21, 56,
  35000, NULL, 35000, 25000,
  2, true, true,
  ARRAY['salaried']::text[], 65, 75, 80000, 50000, 4000000, 10.5, 22.0,
  ARRAY['Updated Aadhaar','Gas receipt','Light bill']::text[], 'Address note: rest of maharastra owne house required; Salary differs by city tier (Metro/Tier2).', true, 'active'
);
insert into public.lender_criteria (name, loan_types, min_cibil, min_age, max_age, min_net_salary, min_net_salary_general, min_net_salary_metro, min_net_salary_tier2, max_latest_enquiries, pf_mandatory, pt_mandatory, accepts_employment, foir_max, foir_max_high_income, high_income_threshold, min_loan_amount, max_loan_amount, interest_rate_min, interest_rate_max, allowed_address_proofs, notes, active, status) values (
  'Manaba Finance', ARRAY['personal']::text[], 650, 21, 54,
  12, 12, NULL, NULL,
  9, false, false,
  ARRAY['salaried']::text[], 65, 75, 80000, 50000, 4000000, 10.5, 22.0,
  ARRAY['Updated Aadhaar','Gas receipt','Light bill owne house)']::text[], NULL, true, 'active'
);
insert into public.lender_criteria (name, loan_types, min_cibil, min_age, max_age, min_net_salary, min_net_salary_general, min_net_salary_metro, min_net_salary_tier2, max_latest_enquiries, pf_mandatory, pt_mandatory, accepts_employment, foir_max, foir_max_high_income, high_income_threshold, min_loan_amount, max_loan_amount, interest_rate_min, interest_rate_max, allowed_address_proofs, notes, active, status) values (
  'Moneyview', ARRAY['personal']::text[], NULL, NULL, NULL,
  15000, NULL, NULL, NULL,
  NULL, NULL, NULL,
  ARRAY['salaried']::text[], 65, 75, 80000, 50000, 4000000, 10.5, 22.0,
  ARRAY['Updated Aadhaar','Gas receipt','Light bill']::text[], NULL, false, 'need_more_info'
);
insert into public.lender_criteria (name, loan_types, min_cibil, min_age, max_age, min_net_salary, min_net_salary_general, min_net_salary_metro, min_net_salary_tier2, max_latest_enquiries, pf_mandatory, pt_mandatory, accepts_employment, foir_max, foir_max_high_income, high_income_threshold, min_loan_amount, max_loan_amount, interest_rate_min, interest_rate_max, allowed_address_proofs, notes, active, status) values (
  'Muthoot Finance Ltd', ARRAY['personal']::text[], 670, 21, 56,
  35000, NULL, 35000, 25000,
  4, true, true,
  ARRAY['salaried']::text[], 65, 75, 80000, 50000, 4000000, 10.5, 22.0,
  ARRAY['Updated Aadhaar','Gas receipt','Light bill']::text[], 'Salary differs by city tier (Metro/Tier2).', true, 'active'
);
insert into public.lender_criteria (name, loan_types, min_cibil, min_age, max_age, min_net_salary, min_net_salary_general, min_net_salary_metro, min_net_salary_tier2, max_latest_enquiries, pf_mandatory, pt_mandatory, accepts_employment, foir_max, foir_max_high_income, high_income_threshold, min_loan_amount, max_loan_amount, interest_rate_min, interest_rate_max, allowed_address_proofs, notes, active, status) values (
  'Open Financial Technologies Pvt Ltd', ARRAY['personal']::text[], NULL, NULL, NULL,
  15000, NULL, NULL, NULL,
  NULL, NULL, NULL,
  ARRAY['salaried']::text[], 65, 75, 80000, 50000, 4000000, 10.5, 22.0,
  ARRAY['Updated Aadhaar','Gas receipt','Light bill']::text[], NULL, false, 'need_more_info'
);
insert into public.lender_criteria (name, loan_types, min_cibil, min_age, max_age, min_net_salary, min_net_salary_general, min_net_salary_metro, min_net_salary_tier2, max_latest_enquiries, pf_mandatory, pt_mandatory, accepts_employment, foir_max, foir_max_high_income, high_income_threshold, min_loan_amount, max_loan_amount, interest_rate_min, interest_rate_max, allowed_address_proofs, notes, active, status) values (
  'Payme (Huey Tech)', ARRAY['personal']::text[], NULL, NULL, NULL,
  15000, NULL, NULL, NULL,
  NULL, NULL, NULL,
  ARRAY['salaried']::text[], 65, 75, 80000, 50000, 4000000, 10.5, 22.0,
  ARRAY['Updated Aadhaar','Gas receipt','Light bill']::text[], NULL, false, 'need_more_info'
);
insert into public.lender_criteria (name, loan_types, min_cibil, min_age, max_age, min_net_salary, min_net_salary_general, min_net_salary_metro, min_net_salary_tier2, max_latest_enquiries, pf_mandatory, pt_mandatory, accepts_employment, foir_max, foir_max_high_income, high_income_threshold, min_loan_amount, max_loan_amount, interest_rate_min, interest_rate_max, allowed_address_proofs, notes, active, status) values (
  'Piramal Finance', ARRAY['personal']::text[], 700, 21, 56,
  35000, NULL, 35000, 20000,
  3, true, true,
  ARRAY['salaried']::text[], 65, 75, 80000, 50000, 4000000, 10.5, 22.0,
  ARRAY['Updated Aadhaar','Gas receipt','Light bill']::text[], 'CIBIL note: 700+ VENTILE V9 AND ABOBE; Address note: rest of maharastra owne house required; Salary differs by city tier (Metro/Tier2).', true, 'active'
);
insert into public.lender_criteria (name, loan_types, min_cibil, min_age, max_age, min_net_salary, min_net_salary_general, min_net_salary_metro, min_net_salary_tier2, max_latest_enquiries, pf_mandatory, pt_mandatory, accepts_employment, foir_max, foir_max_high_income, high_income_threshold, min_loan_amount, max_loan_amount, interest_rate_min, interest_rate_max, allowed_address_proofs, notes, active, status) values (
  'Poonawalla Finance', ARRAY['personal']::text[], 700, NULL, NULL,
  15000, NULL, NULL, NULL,
  2, NULL, NULL,
  ARRAY['salaried']::text[], 65, 75, 80000, 50000, 4000000, 10.5, 22.0,
  ARRAY['Updated Aadhaar','Gas receipt','Light bill']::text[], NULL, true, 'active'
);
insert into public.lender_criteria (name, loan_types, min_cibil, min_age, max_age, min_net_salary, min_net_salary_general, min_net_salary_metro, min_net_salary_tier2, max_latest_enquiries, pf_mandatory, pt_mandatory, accepts_employment, foir_max, foir_max_high_income, high_income_threshold, min_loan_amount, max_loan_amount, interest_rate_min, interest_rate_max, allowed_address_proofs, notes, active, status) values (
  'Ram Fincorp (Fittr)', ARRAY['personal']::text[], NULL, NULL, NULL,
  15000, NULL, NULL, NULL,
  NULL, NULL, NULL,
  ARRAY['salaried']::text[], 65, 75, 80000, 50000, 4000000, 10.5, 22.0,
  ARRAY['Updated Aadhaar','Gas receipt','Light bill']::text[], NULL, false, 'need_more_info'
);
insert into public.lender_criteria (name, loan_types, min_cibil, min_age, max_age, min_net_salary, min_net_salary_general, min_net_salary_metro, min_net_salary_tier2, max_latest_enquiries, pf_mandatory, pt_mandatory, accepts_employment, foir_max, foir_max_high_income, high_income_threshold, min_loan_amount, max_loan_amount, interest_rate_min, interest_rate_max, allowed_address_proofs, notes, active, status) values (
  'SBM Bank', ARRAY['personal']::text[], NULL, NULL, NULL,
  15000, NULL, NULL, NULL,
  NULL, NULL, NULL,
  ARRAY['salaried']::text[], 65, 75, 80000, 50000, 4000000, 10.5, 22.0,
  ARRAY['Updated Aadhaar','Gas receipt','Light bill']::text[], NULL, false, 'need_more_info'
);
insert into public.lender_criteria (name, loan_types, min_cibil, min_age, max_age, min_net_salary, min_net_salary_general, min_net_salary_metro, min_net_salary_tier2, max_latest_enquiries, pf_mandatory, pt_mandatory, accepts_employment, foir_max, foir_max_high_income, high_income_threshold, min_loan_amount, max_loan_amount, interest_rate_min, interest_rate_max, allowed_address_proofs, notes, active, status) values (
  'SCB', ARRAY['personal']::text[], NULL, NULL, NULL,
  15000, NULL, NULL, NULL,
  NULL, NULL, NULL,
  ARRAY['salaried']::text[], 65, 75, 80000, 50000, 4000000, 10.5, 22.0,
  ARRAY['Updated Aadhaar','Gas receipt','Light bill']::text[], NULL, false, 'need_more_info'
);
insert into public.lender_criteria (name, loan_types, min_cibil, min_age, max_age, min_net_salary, min_net_salary_general, min_net_salary_metro, min_net_salary_tier2, max_latest_enquiries, pf_mandatory, pt_mandatory, accepts_employment, foir_max, foir_max_high_income, high_income_threshold, min_loan_amount, max_loan_amount, interest_rate_min, interest_rate_max, allowed_address_proofs, notes, active, status) values (
  'SMFG', ARRAY['personal']::text[], 700, 21, 56,
  30000, NULL, 30000, 25000,
  6, false, false,
  ARRAY['salaried']::text[], 65, 75, 80000, 50000, 4000000, 10.5, 22.0,
  ARRAY['Updated Aadhaar','Gas receipt','Light bill']::text[], 'Salary differs by city tier (Metro/Tier2).', true, 'active'
);
insert into public.lender_criteria (name, loan_types, min_cibil, min_age, max_age, min_net_salary, min_net_salary_general, min_net_salary_metro, min_net_salary_tier2, max_latest_enquiries, pf_mandatory, pt_mandatory, accepts_employment, foir_max, foir_max_high_income, high_income_threshold, min_loan_amount, max_loan_amount, interest_rate_min, interest_rate_max, allowed_address_proofs, notes, active, status) values (
  'South Indian Bank Ltd', ARRAY['personal']::text[], NULL, NULL, NULL,
  15000, NULL, NULL, NULL,
  NULL, NULL, NULL,
  ARRAY['salaried']::text[], 65, 75, 80000, 50000, 4000000, 10.5, 22.0,
  ARRAY['Updated Aadhaar','Gas receipt','Light bill']::text[], NULL, false, 'need_more_info'
);
insert into public.lender_criteria (name, loan_types, min_cibil, min_age, max_age, min_net_salary, min_net_salary_general, min_net_salary_metro, min_net_salary_tier2, max_latest_enquiries, pf_mandatory, pt_mandatory, accepts_employment, foir_max, foir_max_high_income, high_income_threshold, min_loan_amount, max_loan_amount, interest_rate_min, interest_rate_max, allowed_address_proofs, notes, active, status) values (
  'Tata Capital Financial Services Limited', ARRAY['personal']::text[], 700, 21, 58,
  35000, NULL, 35000, 25000,
  5, false, false,
  ARRAY['salaried']::text[], 65, 75, 80000, 50000, 4000000, 10.5, 22.0,
  ARRAY['Updated Aadhaar','Gas receipt','Light bill']::text[], 'Address note: rest of maharastra owne house required; Salary differs by city tier (Metro/Tier2).', true, 'active'
);
insert into public.lender_criteria (name, loan_types, min_cibil, min_age, max_age, min_net_salary, min_net_salary_general, min_net_salary_metro, min_net_salary_tier2, max_latest_enquiries, pf_mandatory, pt_mandatory, accepts_employment, foir_max, foir_max_high_income, high_income_threshold, min_loan_amount, max_loan_amount, interest_rate_min, interest_rate_max, allowed_address_proofs, notes, active, status) values (
  'Utkarsh Bank', ARRAY['personal']::text[], NULL, NULL, NULL,
  15000, NULL, NULL, NULL,
  NULL, NULL, NULL,
  ARRAY['salaried']::text[], 65, 75, 80000, 50000, 4000000, 10.5, 22.0,
  ARRAY['Updated Aadhaar','Gas receipt','Light bill']::text[], NULL, false, 'need_more_info'
);

-- 127 FOIR slabs (income-band caps)
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 25000, 40000, 50, NULL from public.lender_criteria where name = 'Aditya Birla Finance Limited';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 40000, 50000, 55, NULL from public.lender_criteria where name = 'Aditya Birla Finance Limited';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 50000, 60000, 60, NULL from public.lender_criteria where name = 'Aditya Birla Finance Limited';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 60000, 80000, 65, NULL from public.lender_criteria where name = 'Aditya Birla Finance Limited';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 80000, 150000, 75, NULL from public.lender_criteria where name = 'Aditya Birla Finance Limited';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 150000, NULL, 80, 'Open-ended upper band' from public.lender_criteria where name = 'Aditya Birla Finance Limited';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 30000, 40000, 50, NULL from public.lender_criteria where name = 'Axis Bank';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 40000, 50000, 55, NULL from public.lender_criteria where name = 'Axis Bank';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 50000, 60000, 60, NULL from public.lender_criteria where name = 'Axis Bank';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 60000, 80000, 65, NULL from public.lender_criteria where name = 'Axis Bank';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 80000, 150000, 75, NULL from public.lender_criteria where name = 'Axis Bank';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 150000, NULL, 80, 'Open-ended upper band' from public.lender_criteria where name = 'Axis Bank';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 30000, 40000, 50, NULL from public.lender_criteria where name = 'Axis Finance';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 40000, 50000, 55, NULL from public.lender_criteria where name = 'Axis Finance';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 50000, 60000, 60, NULL from public.lender_criteria where name = 'Axis Finance';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 60000, 80000, 65, NULL from public.lender_criteria where name = 'Axis Finance';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 80000, 150000, 75, NULL from public.lender_criteria where name = 'Axis Finance';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 150000, NULL, 80, 'Open-ended upper band' from public.lender_criteria where name = 'Axis Finance';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 30000, 40000, 50, NULL from public.lender_criteria where name = 'Bajaj Finance Limited';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 40000, 50000, 55, NULL from public.lender_criteria where name = 'Bajaj Finance Limited';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 50000, 60000, 60, NULL from public.lender_criteria where name = 'Bajaj Finance Limited';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 60000, 80000, 65, NULL from public.lender_criteria where name = 'Bajaj Finance Limited';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 80000, 150000, 75, NULL from public.lender_criteria where name = 'Bajaj Finance Limited';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 150000, NULL, 80, 'Open-ended upper band' from public.lender_criteria where name = 'Bajaj Finance Limited';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 30000, 40000, 50, NULL from public.lender_criteria where name = 'Bajaj Finserv Direct Limited';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 40000, 50000, 55, NULL from public.lender_criteria where name = 'Bajaj Finserv Direct Limited';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 50000, 60000, 60, NULL from public.lender_criteria where name = 'Bajaj Finserv Direct Limited';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 60000, 80000, 65, NULL from public.lender_criteria where name = 'Bajaj Finserv Direct Limited';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 80000, 150000, 75, NULL from public.lender_criteria where name = 'Bajaj Finserv Direct Limited';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 150000, NULL, 80, 'Open-ended upper band' from public.lender_criteria where name = 'Bajaj Finserv Direct Limited';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 30000, 40000, 50, NULL from public.lender_criteria where name = 'Bandhan Bank Limited';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 40000, 50000, 55, NULL from public.lender_criteria where name = 'Bandhan Bank Limited';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 50000, 60000, 60, NULL from public.lender_criteria where name = 'Bandhan Bank Limited';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 60000, 80000, 65, NULL from public.lender_criteria where name = 'Bandhan Bank Limited';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 80000, 150000, 75, NULL from public.lender_criteria where name = 'Bandhan Bank Limited';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 150000, NULL, 80, 'Open-ended upper band' from public.lender_criteria where name = 'Bandhan Bank Limited';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 30000, 40000, 50, NULL from public.lender_criteria where name = 'IDFC FIRST BANK';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 40000, 50000, 55, NULL from public.lender_criteria where name = 'IDFC FIRST BANK';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 50000, 60000, 60, NULL from public.lender_criteria where name = 'IDFC FIRST BANK';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 60000, 80000, 65, NULL from public.lender_criteria where name = 'IDFC FIRST BANK';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 80000, 150000, 75, NULL from public.lender_criteria where name = 'IDFC FIRST BANK';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 150000, NULL, 80, 'Open-ended upper band' from public.lender_criteria where name = 'IDFC FIRST BANK';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 30000, 40000, 50, NULL from public.lender_criteria where name = 'Chola Mandalam Bank';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 40000, 50000, 55, NULL from public.lender_criteria where name = 'Chola Mandalam Bank';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 50000, 60000, 60, NULL from public.lender_criteria where name = 'Chola Mandalam Bank';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 60000, 80000, 65, NULL from public.lender_criteria where name = 'Chola Mandalam Bank';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 80000, 150000, 75, NULL from public.lender_criteria where name = 'Chola Mandalam Bank';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 150000, NULL, 80, 'Open-ended upper band' from public.lender_criteria where name = 'Chola Mandalam Bank';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 30000, 40000, 50, NULL from public.lender_criteria where name = 'Finnable';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 40000, 50000, 55, NULL from public.lender_criteria where name = 'Finnable';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 50000, 60000, 60, NULL from public.lender_criteria where name = 'Finnable';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 60000, 80000, 65, NULL from public.lender_criteria where name = 'Finnable';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 80000, 150000, 75, NULL from public.lender_criteria where name = 'Finnable';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 150000, NULL, 80, 'Open-ended upper band' from public.lender_criteria where name = 'Finnable';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 30000, 40000, 50, NULL from public.lender_criteria where name = 'SMFG';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 40000, 50000, 55, NULL from public.lender_criteria where name = 'SMFG';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 50000, 60000, 60, NULL from public.lender_criteria where name = 'SMFG';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 60000, 80000, 65, NULL from public.lender_criteria where name = 'SMFG';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 80000, 150000, 75, NULL from public.lender_criteria where name = 'SMFG';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 150000, NULL, 80, 'Open-ended upper band' from public.lender_criteria where name = 'SMFG';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 30000, 40000, 50, NULL from public.lender_criteria where name = 'HDFC Bank';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 40000, 50000, 55, NULL from public.lender_criteria where name = 'HDFC Bank';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 50000, 60000, 60, NULL from public.lender_criteria where name = 'HDFC Bank';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 60000, 80000, 65, NULL from public.lender_criteria where name = 'HDFC Bank';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 80000, 150000, 75, NULL from public.lender_criteria where name = 'HDFC Bank';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 150000, NULL, 80, 'Open-ended upper band' from public.lender_criteria where name = 'HDFC Bank';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 30000, 40000, 50, NULL from public.lender_criteria where name = 'HDFC Bank ( Emerging )';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 40000, 50000, 55, NULL from public.lender_criteria where name = 'HDFC Bank ( Emerging )';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 50000, 60000, 60, NULL from public.lender_criteria where name = 'HDFC Bank ( Emerging )';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 60000, 80000, 65, NULL from public.lender_criteria where name = 'HDFC Bank ( Emerging )';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 80000, 150000, 75, NULL from public.lender_criteria where name = 'HDFC Bank ( Emerging )';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 150000, NULL, 80, 'Open-ended upper band' from public.lender_criteria where name = 'HDFC Bank ( Emerging )';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 30000, 40000, 50, NULL from public.lender_criteria where name = 'ICICI';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 40000, 50000, 55, NULL from public.lender_criteria where name = 'ICICI';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 50000, 60000, 60, NULL from public.lender_criteria where name = 'ICICI';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 60000, 80000, 65, NULL from public.lender_criteria where name = 'ICICI';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 80000, 150000, 75, NULL from public.lender_criteria where name = 'ICICI';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 150000, NULL, 80, 'Open-ended upper band' from public.lender_criteria where name = 'ICICI';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 30000, 40000, 50, NULL from public.lender_criteria where name = 'Incred Finance';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 40000, 50000, 55, NULL from public.lender_criteria where name = 'Incred Finance';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 50000, 60000, 60, NULL from public.lender_criteria where name = 'Incred Finance';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 60000, 80000, 65, NULL from public.lender_criteria where name = 'Incred Finance';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 80000, 150000, 75, NULL from public.lender_criteria where name = 'Incred Finance';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 150000, NULL, 80, 'Open-ended upper band' from public.lender_criteria where name = 'Incred Finance';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 30000, 40000, 50, NULL from public.lender_criteria where name = 'Indusind Bank';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 40000, 50000, 55, NULL from public.lender_criteria where name = 'Indusind Bank';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 50000, 60000, 60, NULL from public.lender_criteria where name = 'Indusind Bank';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 60000, 80000, 65, NULL from public.lender_criteria where name = 'Indusind Bank';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 80000, 150000, 75, NULL from public.lender_criteria where name = 'Indusind Bank';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 150000, NULL, 80, 'Open-ended upper band' from public.lender_criteria where name = 'Indusind Bank';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 30000, 40000, 50, NULL from public.lender_criteria where name = 'Kotak';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 40000, 50000, 55, NULL from public.lender_criteria where name = 'Kotak';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 50000, 60000, 60, NULL from public.lender_criteria where name = 'Kotak';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 60000, 80000, 65, NULL from public.lender_criteria where name = 'Kotak';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 80000, 150000, 75, NULL from public.lender_criteria where name = 'Kotak';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 150000, NULL, 80, 'Open-ended upper band' from public.lender_criteria where name = 'Kotak';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 30000, 40000, 50, NULL from public.lender_criteria where name = 'L&T Finance';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 40000, 50000, 55, NULL from public.lender_criteria where name = 'L&T Finance';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 50000, 60000, 60, NULL from public.lender_criteria where name = 'L&T Finance';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 60000, 80000, 65, NULL from public.lender_criteria where name = 'L&T Finance';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 80000, 150000, 75, NULL from public.lender_criteria where name = 'L&T Finance';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 150000, NULL, 80, 'Open-ended upper band' from public.lender_criteria where name = 'L&T Finance';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 30000, 40000, 50, NULL from public.lender_criteria where name = 'Muthoot Finance Ltd';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 40000, 50000, 55, NULL from public.lender_criteria where name = 'Muthoot Finance Ltd';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 50000, 60000, 60, NULL from public.lender_criteria where name = 'Muthoot Finance Ltd';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 60000, 80000, 65, NULL from public.lender_criteria where name = 'Muthoot Finance Ltd';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 80000, 150000, 75, NULL from public.lender_criteria where name = 'Muthoot Finance Ltd';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 150000, NULL, 80, 'Open-ended upper band' from public.lender_criteria where name = 'Muthoot Finance Ltd';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 30000, 40000, 50, NULL from public.lender_criteria where name = 'Piramal Finance';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 40000, 50000, 55, NULL from public.lender_criteria where name = 'Piramal Finance';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 50000, 60000, 60, NULL from public.lender_criteria where name = 'Piramal Finance';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 60000, 80000, 65, NULL from public.lender_criteria where name = 'Piramal Finance';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 80000, 150000, 75, NULL from public.lender_criteria where name = 'Piramal Finance';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 150000, NULL, 80, 'Open-ended upper band' from public.lender_criteria where name = 'Piramal Finance';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 30000, 40000, 50, NULL from public.lender_criteria where name = 'Tata Capital Financial Services Limited';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 40000, 50000, 55, NULL from public.lender_criteria where name = 'Tata Capital Financial Services Limited';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 50000, 60000, 60, NULL from public.lender_criteria where name = 'Tata Capital Financial Services Limited';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 60000, 80000, 65, NULL from public.lender_criteria where name = 'Tata Capital Financial Services Limited';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 80000, 150000, 75, NULL from public.lender_criteria where name = 'Tata Capital Financial Services Limited';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 150000, NULL, 80, 'Open-ended upper band' from public.lender_criteria where name = 'Tata Capital Financial Services Limited';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 12000, 30000, 40, NULL from public.lender_criteria where name = 'Manaba Finance';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 40000, 50000, 55, NULL from public.lender_criteria where name = 'Manaba Finance';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 50000, 60000, 60, NULL from public.lender_criteria where name = 'Manaba Finance';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 60000, 80000, 65, NULL from public.lender_criteria where name = 'Manaba Finance';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 80000, 150000, 75, NULL from public.lender_criteria where name = 'Manaba Finance';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 150000, NULL, 80, 'Open-ended upper band' from public.lender_criteria where name = 'Manaba Finance';
insert into public.lender_foir_slabs (lender_id, income_min, income_max, foir_max, notes) select id, 0, NULL, 65, 'FOIR range given 45-65; using max as cap' from public.lender_criteria where name = 'Fatakpay';
