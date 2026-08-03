-- =====================================================================
-- LoanLaabh — User Profile Page + Extended Eligibility Fields
-- =====================================================================
-- Run this ONCE in Supabase → SQL Editor. Fully idempotent (uses
-- ADD COLUMN IF NOT EXISTS) so re-running is safe.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Extend `profiles` table with all fields needed by user profile page
-- ---------------------------------------------------------------------
ALTER TABLE public.profiles
  -- Personal
  ADD COLUMN IF NOT EXISTS dob                 date,
  ADD COLUMN IF NOT EXISTS gender              text,        -- 'male' | 'female' | 'other'
  ADD COLUMN IF NOT EXISTS pan                 text,
  ADD COLUMN IF NOT EXISTS address             text,        -- personal address
  ADD COLUMN IF NOT EXISTS pin_code            text,
  -- Work
  ADD COLUMN IF NOT EXISTS occupation_type     text,        -- Salaried | Self-Employed | Business
  ADD COLUMN IF NOT EXISTS employer_name       text,
  ADD COLUMN IF NOT EXISTS work_email          text,
  ADD COLUMN IF NOT EXISTS office_number       text,
  ADD COLUMN IF NOT EXISTS work_address        text,
  ADD COLUMN IF NOT EXISTS total_experience_years numeric(5,2),
  -- Notification preferences (default ON)
  ADD COLUMN IF NOT EXISTS notif_sms           boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS notif_email         boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS notif_whatsapp      boolean DEFAULT true,
  -- Soft account deletion request
  ADD COLUMN IF NOT EXISTS deletion_requested_at timestamptz;

-- ---------------------------------------------------------------------
-- 2. Extend `leads` table with 3 new eligibility fields
-- ---------------------------------------------------------------------
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS dob        date,
  ADD COLUMN IF NOT EXISTS gender     text,
  ADD COLUMN IF NOT EXISTS pin_code   text;

-- ---------------------------------------------------------------------
-- 3. RLS policies — ensure user can read/update ONLY their own profile
--    (Supabase profiles table usually already has these but re-add for safety)
-- ---------------------------------------------------------------------
DO $$
BEGIN
  -- Enable RLS if not already
  EXECUTE 'ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY';
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DROP POLICY IF EXISTS profiles_self_select ON public.profiles;
CREATE POLICY profiles_self_select ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS profiles_self_update ON public.profiles;
CREATE POLICY profiles_self_update ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS profiles_self_insert ON public.profiles;
CREATE POLICY profiles_self_insert ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ---------------------------------------------------------------------
-- 4. Sanity check
-- ---------------------------------------------------------------------
SELECT column_name, data_type FROM information_schema.columns
WHERE table_schema='public' AND table_name='profiles'
ORDER BY ordinal_position;
