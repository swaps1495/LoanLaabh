-- =====================================================================
-- LoanLaabh — Backfill missing `requested_amount` column on leads table
-- =====================================================================
-- Run this ONCE in Supabase → SQL Editor if you want the column to exist
-- permanently. Otherwise the API self-heals by stripping the column when
-- missing (see attempt-3 auto-heal loop in /api/leads POST).
-- =====================================================================

ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS requested_amount numeric(14,2);

-- Backfill from existing loan_amount so old rows stay meaningful
UPDATE public.leads
  SET requested_amount = loan_amount
  WHERE requested_amount IS NULL AND loan_amount IS NOT NULL;

-- Sanity check — should show both columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'leads'
  AND column_name IN ('loan_amount', 'requested_amount')
ORDER BY column_name;
