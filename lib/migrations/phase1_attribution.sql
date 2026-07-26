-- =====================================================================
-- LoanLaabh — Phase 1 Attribution & Lead-Tracking Foundation
-- =====================================================================
-- Run this ONCE in Supabase → SQL Editor → New Query → Paste → Run.
-- It's fully idempotent (uses ADD COLUMN IF NOT EXISTS) so re-running is safe.
--
-- Backwards compatible: existing rows keep their data. New columns get NULL
-- defaults except `retry_count` (0), `tags` (empty text[]), and
-- `last_activity_at` (now()).
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Extend `lead_captures` (public pre-eligibility funnel)
-- ---------------------------------------------------------------------
ALTER TABLE public.lead_captures
  ADD COLUMN IF NOT EXISTS original_source_type   text,
  ADD COLUMN IF NOT EXISTS original_utm_source    text,
  ADD COLUMN IF NOT EXISTS original_utm_medium    text,
  ADD COLUMN IF NOT EXISTS original_utm_campaign  text,
  ADD COLUMN IF NOT EXISTS original_utm_content   text,
  ADD COLUMN IF NOT EXISTS original_utm_term      text,
  ADD COLUMN IF NOT EXISTS original_fbclid        text,
  ADD COLUMN IF NOT EXISTS original_gclid         text,
  ADD COLUMN IF NOT EXISTS original_fbp           text,
  ADD COLUMN IF NOT EXISTS original_fbc           text,
  ADD COLUMN IF NOT EXISTS original_referrer      text,
  ADD COLUMN IF NOT EXISTS original_landing_page  text,
  ADD COLUMN IF NOT EXISTS original_device_type   text,
  ADD COLUMN IF NOT EXISTS original_browser       text,
  ADD COLUMN IF NOT EXISTS original_platform      text,
  ADD COLUMN IF NOT EXISTS first_visit_at         timestamptz,
  ADD COLUMN IF NOT EXISTS latest_source_type     text,
  ADD COLUMN IF NOT EXISTS latest_utm_source      text,
  ADD COLUMN IF NOT EXISTS latest_utm_medium      text,
  ADD COLUMN IF NOT EXISTS latest_utm_campaign    text,
  ADD COLUMN IF NOT EXISTS latest_utm_content     text,
  ADD COLUMN IF NOT EXISTS latest_utm_term        text,
  ADD COLUMN IF NOT EXISTS latest_referrer        text,
  ADD COLUMN IF NOT EXISTS latest_landing_page    text,
  ADD COLUMN IF NOT EXISTS latest_source_cta      text,
  ADD COLUMN IF NOT EXISTS retry_count            int         DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tags                   text[]      DEFAULT ARRAY[]::text[],
  ADD COLUMN IF NOT EXISTS last_activity_at       timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS consent_at             timestamptz;

CREATE INDEX IF NOT EXISTS idx_lead_captures_mobile          ON public.lead_captures (mobile);
CREATE INDEX IF NOT EXISTS idx_lead_captures_email           ON public.lead_captures (email);
CREATE INDEX IF NOT EXISTS idx_lead_captures_source_type     ON public.lead_captures (original_source_type);
CREATE INDEX IF NOT EXISTS idx_lead_captures_last_activity   ON public.lead_captures (last_activity_at DESC);

-- ---------------------------------------------------------------------
-- 2. Extend `leads` (post-eligibility, full customer profile)
-- ---------------------------------------------------------------------
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS original_source_type   text,
  ADD COLUMN IF NOT EXISTS original_utm_source    text,
  ADD COLUMN IF NOT EXISTS original_utm_medium    text,
  ADD COLUMN IF NOT EXISTS original_utm_campaign  text,
  ADD COLUMN IF NOT EXISTS original_utm_content   text,
  ADD COLUMN IF NOT EXISTS original_utm_term      text,
  ADD COLUMN IF NOT EXISTS original_fbclid        text,
  ADD COLUMN IF NOT EXISTS original_gclid         text,
  ADD COLUMN IF NOT EXISTS original_fbp           text,
  ADD COLUMN IF NOT EXISTS original_fbc           text,
  ADD COLUMN IF NOT EXISTS original_referrer      text,
  ADD COLUMN IF NOT EXISTS original_landing_page  text,
  ADD COLUMN IF NOT EXISTS original_device_type   text,
  ADD COLUMN IF NOT EXISTS original_browser       text,
  ADD COLUMN IF NOT EXISTS original_platform      text,
  ADD COLUMN IF NOT EXISTS first_visit_at         timestamptz,
  ADD COLUMN IF NOT EXISTS latest_source_type     text,
  ADD COLUMN IF NOT EXISTS latest_utm_source      text,
  ADD COLUMN IF NOT EXISTS latest_utm_medium      text,
  ADD COLUMN IF NOT EXISTS latest_utm_campaign    text,
  ADD COLUMN IF NOT EXISTS latest_utm_content     text,
  ADD COLUMN IF NOT EXISTS latest_utm_term        text,
  ADD COLUMN IF NOT EXISTS latest_referrer        text,
  ADD COLUMN IF NOT EXISTS latest_landing_page    text,
  ADD COLUMN IF NOT EXISTS retry_count            int         DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tags                   text[]      DEFAULT ARRAY[]::text[],
  ADD COLUMN IF NOT EXISTS last_activity_at       timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS consent_at             timestamptz;

CREATE INDEX IF NOT EXISTS idx_leads_mobile                  ON public.leads (mobile);
CREATE INDEX IF NOT EXISTS idx_leads_source_type             ON public.leads (original_source_type);
CREATE INDEX IF NOT EXISTS idx_leads_last_activity           ON public.leads (last_activity_at DESC);

-- ---------------------------------------------------------------------
-- 3. Convenience: backfill first_visit_at for older rows so reporting
--    charts do not choke on NULLs.
-- ---------------------------------------------------------------------
UPDATE public.lead_captures SET first_visit_at = created_at
WHERE first_visit_at IS NULL AND created_at IS NOT NULL;

UPDATE public.leads SET first_visit_at = created_at
WHERE first_visit_at IS NULL AND created_at IS NOT NULL;

-- ---------------------------------------------------------------------
-- 4. Sanity check
-- ---------------------------------------------------------------------
-- Should return 20+ rows now
SELECT column_name, data_type FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'lead_captures'
ORDER BY ordinal_position;
