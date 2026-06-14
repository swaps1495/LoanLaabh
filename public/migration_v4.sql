-- LoanLaabh Migration v4 — Auth, Profiles, Applications, RLS
-- Safe / idempotent. Run AFTER v3 migration.
-- Adds: profiles, admins, applications-as-leads with user_id, single-active-app trigger, RLS policies, auto-profile creation.

-- ===== 1. PROFILES table =====
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  phone text,
  full_name text,
  city text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists profiles_email_idx on public.profiles(email);

-- ===== 2. ADMINS whitelist =====
create table if not exists public.admins (
  email text primary key,
  name text,
  created_at timestamptz default now()
);

-- ===== 3. LINK leads to auth users (existing data preserved with NULL user_id) =====
alter table public.leads
  add column if not exists user_id uuid references auth.users(id) on delete set null,
  add column if not exists requested_amount numeric(14,2),
  add column if not exists admin_notes text;

-- Backfill requested_amount from existing loan_amount
update public.leads set requested_amount = loan_amount where requested_amount is null;

-- Normalize the lead_status workflow values (keep existing rows compatible)
-- Active statuses: draft, submitted, docs_pending, sent_to_lender, under_review
-- Closed statuses: approved, rejected, disbursed, expired, withdrawn
-- Legacy: New, Qualified, Hot, Applied  (treated as active)

-- ===== 4. SINGLE-ACTIVE-APPLICATION trigger =====
create or replace function public.enforce_single_active_application()
returns trigger as $$
declare
  active_statuses text[] := ARRAY['draft','submitted','docs_pending','sent_to_lender','under_review','New','Qualified','Hot','Applied'];
begin
  if new.user_id is not null and new.lead_status = any(active_statuses) then
    if exists (
      select 1 from public.leads
      where user_id = new.user_id
        and id != coalesce(new.id, '00000000-0000-0000-0000-000000000000'::uuid)
        and lead_status = any(active_statuses)
    ) then
      raise exception 'User already has an active application' using errcode = 'P0001';
    end if;
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_single_active_app on public.leads;
create trigger trg_single_active_app
  before insert or update of lead_status, user_id on public.leads
  for each row execute function public.enforce_single_active_application();

-- ===== 5. AUTO-CREATE profile on auth signup =====
create or replace function public.handle_new_auth_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, phone)
  values (new.id, new.email, new.phone)
  on conflict (id) do update set email = excluded.email, updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

-- ===== 6. RLS POLICIES =====
-- (Service-role key used by backend bypasses RLS automatically.)

alter table public.profiles enable row level security;
drop policy if exists "users_select_own_profile" on public.profiles;
create policy "users_select_own_profile" on public.profiles
  for select using (auth.uid() = id);
drop policy if exists "users_update_own_profile" on public.profiles;
create policy "users_update_own_profile" on public.profiles
  for update using (auth.uid() = id);
drop policy if exists "admins_select_all_profiles" on public.profiles;
create policy "admins_select_all_profiles" on public.profiles
  for select using (exists (select 1 from public.admins a where a.email = (auth.jwt()->>'email')));

alter table public.leads enable row level security;
drop policy if exists "users_select_own_leads" on public.leads;
create policy "users_select_own_leads" on public.leads
  for select using (auth.uid() = user_id);
drop policy if exists "admins_all_leads" on public.leads;
create policy "admins_all_leads" on public.leads
  for all using (exists (select 1 from public.admins a where a.email = (auth.jwt()->>'email')));

alter table public.matches enable row level security;
drop policy if exists "users_select_own_matches" on public.matches;
create policy "users_select_own_matches" on public.matches
  for select using (exists (select 1 from public.leads l where l.id = lead_id and l.user_id = auth.uid()));
drop policy if exists "admins_all_matches" on public.matches;
create policy "admins_all_matches" on public.matches
  for all using (exists (select 1 from public.admins a where a.email = (auth.jwt()->>'email')));

alter table public.lender_criteria enable row level security;
drop policy if exists "public_read_lenders" on public.lender_criteria;
create policy "public_read_lenders" on public.lender_criteria
  for select using (true);
drop policy if exists "admins_modify_lenders" on public.lender_criteria;
create policy "admins_modify_lenders" on public.lender_criteria
  for all using (exists (select 1 from public.admins a where a.email = (auth.jwt()->>'email')));

alter table public.lender_foir_slabs enable row level security;
drop policy if exists "public_read_foir" on public.lender_foir_slabs;
create policy "public_read_foir" on public.lender_foir_slabs for select using (true);
drop policy if exists "admins_modify_foir" on public.lender_foir_slabs;
create policy "admins_modify_foir" on public.lender_foir_slabs
  for all using (exists (select 1 from public.admins a where a.email = (auth.jwt()->>'email')));

alter table public.admins enable row level security;
drop policy if exists "admins_self_read" on public.admins;
create policy "admins_self_read" on public.admins
  for select using (email = (auth.jwt()->>'email'));

-- ===== 7. SEED bootstrap admin (UPDATE EMAIL BELOW BEFORE/AFTER MIGRATION) =====
-- Add yourself as the first admin. You can add more via SQL or admin UI later.
insert into public.admins (email, name) values
  ('swapnil@loanlaabh.com', 'Swapnil (Founder)')
  on conflict (email) do nothing;
-- After you sign in once with your real email, run:
--   insert into public.admins (email, name) values ('your-real-email@example.com', 'Your Name')
--   on conflict (email) do nothing;
