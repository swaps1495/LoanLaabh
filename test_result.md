#====================================================================================================
# START - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================

# THIS SECTION CONTAINS CRITICAL TESTING INSTRUCTIONS FOR BOTH AGENTS
# BOTH MAIN_AGENT AND TESTING_AGENT MUST PRESERVE THIS ENTIRE BLOCK

# Communication Protocol:
# If the `testing_agent` is available, main agent should delegate all testing tasks to it.
#
# You have access to a file called `test_result.md`. This file contains the complete testing state
# and history, and is the primary means of communication between main and the testing agent.
#
# Main and testing agents must follow this exact format to maintain testing data. 
# The testing data must be entered in yaml format Below is the data structure:
# 
## user_problem_statement: {problem_statement}
## backend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.py"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## frontend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.js"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## metadata:
##   created_by: "main_agent"
##   version: "1.0"
##   test_sequence: 0
##   run_ui: false
##
## test_plan:
##   current_focus:
##     - "Task name 1"
##     - "Task name 2"
##   stuck_tasks:
##     - "Task name with persistent issues"
##   test_all: false
##   test_priority: "high_first"  # or "sequential" or "stuck_first"
##
## agent_communication:
##     -agent: "main"  # or "testing" or "user"
##     -message: "Communication message between agents"

# Protocol Guidelines for Main agent
#
# 1. Update Test Result File Before Testing:
#    - Main agent must always update the `test_result.md` file before calling the testing agent
#    - Add implementation details to the status_history
#    - Set `needs_retesting` to true for tasks that need testing
#    - Update the `test_plan` section to guide testing priorities
#    - Add a message to `agent_communication` explaining what you've done
#
# 2. Incorporate User Feedback:
#    - When a user provides feedback that something is or isn't working, add this information to the relevant task's status_history
#    - Update the working status based on user feedback
#    - If a user reports an issue with a task that was marked as working, increment the stuck_count
#    - Whenever user reports issue in the app, if we have testing agent and task_result.md file so find the appropriate task for that and append in status_history of that task to contain the user concern and problem as well 
#
# 3. Track Stuck Tasks:
#    - Monitor which tasks have high stuck_count values or where you are fixing same issue again and again, analyze that when you read task_result.md
#    - For persistent issues, use websearch tool to find solutions
#    - Pay special attention to tasks in the stuck_tasks list
#    - When you fix an issue with a stuck task, don't reset the stuck_count until the testing agent confirms it's working
#
# 4. Provide Context to Testing Agent:
#    - When calling the testing agent, provide clear instructions about:
#      - Which tasks need testing (reference the test_plan)
#      - Any authentication details or configuration needed
#      - Specific test scenarios to focus on
#      - Any known issues or edge cases to verify
#
# 5. Call the testing agent with specific instructions referring to test_result.md
#
# IMPORTANT: Main agent must ALWAYS update test_result.md BEFORE calling the testing agent, as it relies on this file to understand what to test next.

#====================================================================================================
# END - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================



#====================================================================================================
# Testing Data - Main Agent and testing sub agent both should log testing data below this section
#====================================================================================================

user_problem_statement: |
  LoanLaabh - Indian loan eligibility & lender matching platform (DSA marketplace).
  v2: Optimized for LEAD CONVERSION & PRE-QUALIFICATION (not lender comparison).
  - 7-step customer form (Basic, Residence, Employment, Income+FOIR, Loan, Credit, Consent)
  - Rule-based screening engine + GPT-4o AI analysis (lead score, approval probability, eligible amount, risk flags, sales priority, internal notes)
  - Customer result page HIDES lender names. Shows pre-qualification, eligible amount, approval chances, WhatsApp CTA
  - Admin dashboard with filters (status/loan type/city/priority/date), CSV export, lead status workflow
  - Lender Criteria Manager (/admin/lenders) with full CRUD
  - Supabase (Postgres) for persistence, admin password auth

backend:
  - task: "Self-healing insert path for /api/leads (missing column auto-fallback)"
    implemented: true
    working: "NA"
    file: "app/api/[[...path]]/route.js"
    needs_retesting: true
    status_history:
        - working: "NA"
          agent: "main"
          comment: "User reported HTTP 500 on eligibility form submit: 'Could not find the requested_amount column of leads in the schema cache'. Root cause: /api/leads POST tries to insert requested_amount + full attribution set, but user's Supabase leads table is missing requested_amount column (migration_v4.sql was never applied). Previous fallback only stripped attribution columns, so requested_amount kept failing. FIX: Extended insert flow to 3 attempts — (1) full enriched insert, (2) strip attribution columns and retry, (3) auto-heal loop that parses missing column name from Postgrest error ('could not find X column' or 'column \"X\" does not exist'), removes it from the payload, and retries. Loop runs up to 6 times to handle multiple missing columns. Also created /app/lib/migrations/fix_requested_amount.sql for user to optionally add the column permanently."
  - task: "Meta Pixel + Conversions API (CAPI) integration"
    implemented: true
    working: true
    file: "app/api/[[...path]]/route.js, lib/meta-capi.js, components/site/MetaPixel.js"
    needs_retesting: false
    status_history:
        - working: "NA"
          agent: "main"
          comment: "Implemented Meta Pixel (browser) + Conversions API (server) with event_id deduplication. NEW files: lib/meta-capi.js (server helper - SHA-256 hashing of email/phone/name/city per Meta requirement, IP/UA forwarding from x-forwarded-for + user-agent headers, test_event_code support, fbcFromFbclid helper); lib/meta-events.js (client helper - newEventId + fireMetaEvent); components/site/MetaPixel.js (base pixel code via next/script afterInteractive); components/site/MetaRoutePageView.js (App Router PageView on route change with Suspense wrapper for useSearchParams); components/site/ViewContentTracker.js (fires ViewContent on /eligibility, /cibil-score, /credit-cards, /calculators); components/site/ContactEventTracker.js (global tel: click listener → Contact event). SERVER-SIDE events wired: POST /api/leads/capture → CAPI 'Lead' event (both new + returning path); POST /api/leads → CAPI 'CompleteRegistration' event with value=loan_amount, currency=INR, status=approval_probability. CLIENT-SIDE events wired: login page + eligibility page + chatbot fire browser Lead/CompleteRegistration with same event_id sent to CAPI for dedup. Env vars added to .env: NEXT_PUBLIC_META_PIXEL_ID=2036446207001182, META_PIXEL_ID=2036446207001182, META_CAPI_ACCESS_TOKEN=<redacted EAAB token>, META_CAPI_TEST_EVENT_CODE=TEST59885, META_GRAPH_API_VERSION=v18.0. Direct Graph API test from CLI PASSED: {events_received:1, fbtrace_id:AgunDumJFqO1iwvXmzBJWTS}. Local /api/leads/capture returns 200 with lead_id. CAPI calls are non-blocking (sendMetaCapiEventSafe swallows errors so marketing failures never break user flows)."
        - working: true
          agent: "testing"
          comment: "VERIFIED - All 10/10 backend tests PASSED ✅. (1) Health check returns 200 with ok:true, app:'LoanLaabh', supabase_configured:true. (2) Keepalive returns 200 with db:'alive' (Supabase working). (3) Lead capture with FULL Meta identifiers (utm_*, fbclid, _fbp, _fbc, referrer, landing_page, device/browser/platform, event_id, event_source_url) returns 200 with lead_id in 1.86s (well under 5s threshold) - CAPI fire does not slow down response. (4) Direct Graph API call to Meta PASSED: events_received=1, fbtrace_id=Aps8HnIsWH87_vM-hSGZ7Mi - confirms credentials valid and events reaching Meta. (5) Dedupe working correctly: same mobile with different source (google vs facebook) returns returning:true, retry_count:1, tags include 'Re-engaged from New Campaign' - server fires another CAPI Lead event (correct behavior, Meta dedupes via event_id). (6) Missing event_id doesn't break: server generates fallback event_id (srv-<uuid>-<ts>), returns 200. (7) PII hashing code verification PASSED: SHA-256 for email/phone/name/city, email normalized to lowercase, 10-digit Indian mobiles get 91 prefix, does NOT hash fbp/fbc/fbclid/IP/UA (correct per Meta spec), uses x-forwarded-for for client_ip_address, uses user-agent for client_user_agent. (8) Non-blocking marketing failures verified: sendMetaCapiEventSafe swallows all errors, route.js uses sendMetaCapiEventSafe (not sendMetaCapiEvent) - lead capture response NOT dependent on CAPI success. (9) Existing behaviour preserved: admin login returns 200 with cookie, GET /api/leads returns 200 with 5 leads, GET /api/lender-criteria returns 200 with 37 lenders, GET /api/lead-captures returns 200 with 12 captures including test leads (mobiles 9887761234, 9876543210). (10) CORS headers present: access-control-allow-origin:* on all responses. No HTTP 500 errors. Meta CAPI integration working correctly end-to-end."
  - task: "Admin GET /api/lead-captures endpoint (pre-eligibility funnel view)"
    implemented: true
    working: true
    file: "app/api/[[...path]]/route.js"
    needs_retesting: false
    status_history:
        - working: "NA"
          agent: "main"
          comment: "User reported that new leads captured in Supabase lead_captures table are not visible on the admin dashboard. Root cause: admin dashboard only queried /api/leads (post-eligibility). Added new admin-only endpoint GET /api/lead-captures which returns all rows from public.lead_captures ordered by last_activity_at desc, with graceful fallback to created_at if last_activity_at column missing. Also added 'Lead Captures (Pre-Eligibility)' tab in /admin/page.js with search, source-type filter, CSV export, and columns for source/campaign/landing page/device/retries/tags/first-visit/last-activity. Local curl test confirms endpoint returns real user data with full attribution populated after user ran SQL migration."
        - working: true
          agent: "testing"
          comment: "VERIFIED - All 7/7 tests PASSED. Bug fix working correctly. (1) Admin login returns 200 with success:true and cookie set, (2) GET /api/lead-captures WITH admin cookie returns 200 with lead_captures array containing 9 rows including user's earlier lead (mobile:9657781755), all required fields present (id, full_name, mobile, email, created_at), optional attribution fields present (original_source_type, original_utm_source, retry_count, tags, first_visit_at, last_activity_at, device/browser/platform), (3) GET /api/lead-captures WITHOUT cookie returns 401 Unauthorized (auth guard working), (4) E2E capture+list: new lead captured with full attribution (fbclid:E2E_123), appears in list with original_source_type='Meta Ads', retry_count=0, tags=['New Lead'], (5) Dedupe+retry: same mobile captured again with different source (gclid:G_456), no duplicate created, retry_count incremented to 1, tags updated to ['New Lead','Returning Lead','Customer Retried','Re-engaged from New Campaign'], original_source_type preserved as 'Meta Ads', latest_source_type updated to 'Google Ads', (6) CORS headers present (access-control-allow-origin:*), (7) Existing endpoints unaffected: GET /api/leads returns 200 with leads array, GET /api/lender-criteria returns 200 with lenders array, GET /api/keepalive returns 200 with db:alive. The main bug fix is confirmed working - pre-eligibility leads now visible in admin dashboard via new endpoint."
  - task: "Phase 1 attribution + dedupe on /api/leads/capture"
    implemented: true
    working: true
    file: "app/api/[[...path]]/route.js"
    needs_retesting: false
    status_history:
        - working: "NA"
          agent: "main"
          comment: "Added attribution capture (utm_*, fbclid, gclid, _fbp, _fbc, referrer, landing_page, device/browser/platform, first_visit_at) + dedupe on mobile OR email. Returning leads increment retry_count, get tag 'Returning Lead' (and 'Re-engaged from New Campaign' if source changed), preserve original_* fields, refresh latest_* fields. If DB migration not yet applied, code falls back to legacy minimal insert without breaking submissions."
        - working: true
          agent: "testing"
          comment: "VERIFIED - All 12 tests PASSED. POST /api/leads/capture working correctly with full attribution support. (1) Health check returns 200 with ok:true, (2) Keepalive returns 200 - Supabase is ALIVE (restored), (3) Lead capture with full attribution returns 200 with lead_id and migration_pending:true (expected - SQL migration not yet applied), (4) Dedupe by mobile working - returns returning:true, retry_count:1, tags:['Returning Lead','Customer Retried'], (5) Dedupe by email working correctly, (6) Validation returns 400 for missing fields, (7) Attribution field is optional - works without it, (8) Source classifier handles gclid without crash, (9) Admin login working, (10) GET /api/leads returns 200 with lead data (Supabase restored), (11) GET /api/lender-criteria returns 200, (12) CORS headers present. No 500 errors. Fallback logic working as designed when migration not applied."
  - task: "Phase 1 attribution on /api/leads (eligibility form)"
    implemented: true
    working: "NA"
    file: "app/api/[[...path]]/route.js"
    needs_retesting: false
    status_history:
        - working: "NA"
          agent: "main"
          comment: "Added attribution to enriched insert. Looks up prior lead by mobile to preserve original_* attribution + increment retry_count + tag as Returning/Re-engaged. Falls back to legacy insert if new columns missing. Existing active-application (409) check preserved."
        - working: "NA"
          agent: "testing"
          comment: "NOT TESTED per review request - this endpoint requires Supabase auth JWT which cannot be easily minted from test script. The code path is similar to /api/leads/capture and uses the same helper functions (attrToColumns, buildRetryTags) which have been verified. Main agent should note this for future end-to-end testing."
  - task: "Improved error handling for Supabase unreachability (paused/DNS fail)"
    implemented: true
    working: true
    file: "app/api/[[...path]]/route.js"
    needs_retesting: false
    status_history:
        - working: "NA"
          agent: "main"
          comment: "User reported TypeError: fetch failed on admin panel (GET /api/leads and /api/lender-criteria). Root cause: Supabase project appears to be paused/unreachable (DNS resolution fails for pnxhjmwxngkvceytfihs.supabase.co). Added network-error detection in the outer try/catch — returns HTTP 503 with code=SUPABASE_UNREACHABLE and an actionable error message directing user to restore project via Supabase dashboard. Also improved /admin loadLeads to gracefully surface network errors as a red banner instead of leaving the UI blank. Actual DB unpausing must be done manually by the user."
        - working: false
          agent: "testing"
          comment: "Initial testing FAILED. The original fix in the catch block was not being triggered. Root cause: Supabase client doesn't throw exceptions for network errors - it returns error objects in the response { data, error }. The error handling code was checking 'if (error)' and returning generic 500 with error.message = 'TypeError: fetch failed'."
        - working: true
          agent: "testing"
          comment: "FIXED and VERIFIED. Created helper functions isNetworkError() and supabaseUnreachable(). Updated error handling in GET /api/leads and GET /api/lender-criteria to detect network errors before returning 500. All 8 test cases now pass: (1) Admin login with correct password returns 200, (2) Admin login with wrong password returns 401, (3) GET /api/leads with auth returns 503 with SUPABASE_UNREACHABLE code and actionable message containing 'paused' and 'supabase.com', (4) GET /api/lender-criteria with auth returns 503 with SUPABASE_UNREACHABLE, (5) GET /api/leads without auth returns 401, (6) Health check GET /api returns 200, (7) Nonexistent route returns 404, (8) CORS headers present on 503 response. No route returns raw 'fetch failed' error anymore."
  - task: "Lead submission with screening + AI analysis"
    implemented: true
    working: "NA"
    file: "app/api/[[...path]]/route.js"
    needs_retesting: true
  - task: "Admin lead listing with filters"
    implemented: true
    working: "NA"
    file: "app/api/[[...path]]/route.js"
    needs_retesting: true
  - task: "Lender Criteria CRUD"
    implemented: true
    working: "NA"
    file: "app/api/[[...path]]/route.js"
    needs_retesting: true
  - task: "Admin authentication (password)"
    implemented: true
    working: true
    file: "app/api/[[...path]]/route.js"
    needs_retesting: false

frontend:
  - task: "Landing page + 7-step form"
    implemented: true
    working: true
    file: "app/page.js"
    needs_retesting: false
  - task: "Customer result page (no lender names)"
    implemented: true
    working: "NA"
    file: "app/page.js"
    needs_retesting: true
  - task: "Admin dashboard with filters + CSV export"
    implemented: true
    working: "NA"
    file: "app/admin/page.js"
    needs_retesting: true
  - task: "Lender Criteria Manager UI"
    implemented: true
    working: "NA"
    file: "app/admin/lenders/page.js"
    needs_retesting: true

metadata:
  created_by: "main_agent"
  version: "2.0"

agent_communication:
  - agent: "main"
    message: |
      Phase 1 Lead Tracking Foundation implemented (attribution + dedupe + retry tags).
      NEW FILES:
        - /app/lib/attribution.js               (client-side capture: original + latest snapshots in localStorage)
        - /app/lib/source-classifier.js         (shared classifier — Meta Ads/Google Ads/Organic Search/Direct/Referral/WhatsApp/Chatbot/Email/SMS/RCS/Partner Referral/Other)
        - /app/lib/attribution-server.js        (attrToColumns + buildRetryTags helpers)
        - /app/components/site/AttributionTracker.js  (mounted globally in layout.js)
        - /app/lib/migrations/phase1_attribution.sql  (DB migration for the user to run in Supabase SQL editor)
      MODIFIED:
        - /app/app/layout.js               — added <AttributionTracker />
        - /app/app/login/page.js           — leads/capture POST now sends attribution
        - /app/app/eligibility/page.js     — /api/leads POST now sends attribution
        - /app/components/site/ask-lfmai.js — chatbot leads/capture POST now sends attribution
        - /app/app/api/[[...path]]/route.js — rewritten POST /leads/capture with attribution + dedupe + retry_count + tags; extended POST /leads with same logic
      NOTE: The SQL migration is NOT yet applied — until the user runs it, the code path falls back to a legacy minimal insert (attribution fields silently skipped). This is intentional and non-breaking.
      TESTING NEEDED (backend-only for now):
        1) POST /api/leads/capture with body { full_name, mobile, email, consent:true, source_cta:'test', attribution:{ first:{utm_source:'facebook',utm_medium:'cpc',utm_campaign:'diwali24',fbclid:'X123',referrer:'https://www.facebook.com/',landing_page:'https://loanlaabh.com/?utm_source=facebook',device_type:'mobile',browser:'Chrome',platform:'Android',captured_at:'2026-06-01T00:00:00Z'}, latest:{utm_source:'facebook',utm_medium:'cpc',utm_campaign:'diwali24',captured_at:'2026-06-01T00:00:00Z'}}} — expect HTTP 200 with { ok:true } (or 503 SUPABASE_UNREACHABLE if DB paused).
        2) POST /api/leads/capture with SAME mobile again — expect { ok:true, returning:true, retry_count:1, tags including 'Returning Lead' }.
        3) POST /api/leads/capture with SAME mobile but DIFFERENT utm_source (e.g. utm_source:'google', utm_medium:'cpc', gclid:'Y456') — expect tags to include both 'Returning Lead' and 'Re-engaged from New Campaign'; original_utm_source stays 'facebook', latest_utm_source becomes 'google'.
        4) POST /api/leads/capture with missing full_name/mobile/email — expect 400.
        5) POST /api/leads/capture without attribution field at all — expect 200 (attribution is optional).
        6) Confirm all four responses have proper CORS headers.
        7) Existing tests should still pass — /api/admin/login, GET /api/leads with cookie, /api/lender-criteria, /api/keepalive.
      IMPORTANT CONSTRAINTS FOR TESTER:
        - Since the DB migration has NOT been applied yet, the new attribution columns likely do not exist in Supabase. The API is designed to handle this — either it will insert successfully (if user manually ran the SQL) or it will fall back to a minimal insert and return { ok:true, migration_pending:true } OR { ok:true, warning:'...' }. Either response is acceptable — please do NOT report this as a bug.
        - Supabase might still be paused. If so, all writes will return 503 SUPABASE_UNREACHABLE — that's expected.
        - Do NOT test the eligibility form path (POST /api/leads) — it requires a valid Supabase user JWT which cannot be easily minted from a script.

  - agent: "main"
    message: "v2 MVP built. Awaiting Supabase credentials from user to test end-to-end. AI analysis uses Emergent LLM key with rule-based fallback."
  - agent: "main"
    message: |
      User reported: 'TypeError: fetch failed' on admin dashboard when loading leads and lender criteria.
      Diagnosis: The Supabase project host (pnxhjmwxngkvceytfihs.supabase.co) does not resolve via DNS from this container — clear indicator that the Supabase free-tier project is PAUSED (auto-pauses after 7 days of inactivity).
      Fix applied (code side):
        1) Backend /api catch-all handler now inspects error messages/causes for network signals (fetch failed, ENOTFOUND, ECONNREFUSED, ETIMEDOUT, UND_ERR_SOCKET). When detected it returns HTTP 503 with { code: 'SUPABASE_UNREACHABLE', error: '<actionable message telling user to restore project via app.supabase.com>' } — replaces the raw 'fetch failed' error.
        2) /admin/page.js loadLeads() now: (a) has an outer try/catch for pure network failures (no response at all), (b) surfaces the SUPABASE_UNREACHABLE code with a ⚠️ banner instead of leaving the UI blank. The existing red-banner UI (line 190) will display it.
        3) /admin/lenders/page.js already surfaces `data.error` in a red banner (line 103) — no code changes needed there; it will inherit the improved backend message automatically.
      TESTING NEEDED: Since the actual Supabase project is currently PAUSED in this sandbox environment, backend tests against real /api/leads and /api/lender-criteria endpoints will produce the 503 SUPABASE_UNREACHABLE response — this is EXPECTED and confirms the fix. Please verify:
        - GET /api/leads (with legacy admin cookie or admin JWT) returns HTTP 503 + JSON { code: 'SUPABASE_UNREACHABLE', error: <string containing 'paused' and 'supabase.com'> } when Supabase is unreachable, instead of raw 'fetch failed'.
        - GET /api/lender-criteria (with admin auth) returns the same shape when Supabase is unreachable.
        - The message never returns HTTP 500 with generic 'fetch failed'.
        - Non-Supabase routes (like GET / which returns { ok: true, supabase_configured: bool }) still work.
        - Test admin login (POST /api/admin/login) with body { password: 'Sw@ps9409' } - this route does not hit Supabase so should still return 200.
      Admin credentials for testing (from /app/memory/test_credentials.md): legacy admin password 'Sw@ps9409'.
      NOTE: The underlying issue (Supabase paused) can only be resolved by the user manually restoring the project via https://app.supabase.com. Our code fix ensures graceful degradation with a clear message.
  - agent: "testing"
    message: |
      Bug fix verification COMPLETE - Supabase unreachability error handling is now working correctly.
      
      ISSUE FOUND: The original fix in the catch block was not being triggered because Supabase client returns errors in response objects { data, error } rather than throwing exceptions. The code was checking 'if (error)' and returning a generic HTTP 500 with error.message = "TypeError: fetch failed".
      
      FIX APPLIED:
        1) Created helper function isNetworkError(error) to detect network/connectivity errors by checking error message patterns
        2) Created helper function supabaseUnreachable() to return consistent 503 response with SUPABASE_UNREACHABLE code
        3) Updated GET /api/leads error handling to check isNetworkError() before returning 500
        4) Updated GET /api/lender-criteria error handling to check isNetworkError() before returning 500
        5) Kept the catch block fix for any exceptions that might be thrown
      
      TEST RESULTS: All 8/8 tests PASSED
        ✅ Admin login with correct password (200 + cookie set)
        ✅ Admin login with wrong password (401 + "Invalid password")
        ✅ GET /api/leads with auth returns 503 + SUPABASE_UNREACHABLE + actionable message
        ✅ GET /api/lender-criteria with auth returns 503 + SUPABASE_UNREACHABLE + actionable message
        ✅ GET /api/leads without auth returns 401 Unauthorized (auth check before DB call)
        ✅ Health check GET /api returns 200 (doesn't hit Supabase)
        ✅ Nonexistent route returns 404
        ✅ CORS headers present on 503 response
      
      VERIFIED: No route returns raw "fetch failed" error anymore. All Supabase unreachability errors now return HTTP 503 with code "SUPABASE_UNREACHABLE" and an actionable message directing users to restore their paused Supabase project.
  - agent: "testing"
    message: |
      Phase 1 Attribution Backend Testing COMPLETE - All 12/12 tests PASSED ✅
      
      TESTED ENDPOINTS:
        1. GET /api (health check) - ✅ Returns 200 with ok:true, app:"LoanLaabh", supabase_configured:true
        2. GET /api/keepalive - ✅ Returns 200, Supabase is ALIVE (user has restored the paused project)
        3. POST /api/leads/capture with full attribution - ✅ Returns 200 with lead_id and migration_pending:true (expected - SQL migration not yet applied by user)
        4. Dedupe by mobile - ✅ Returns 200 with returning:true, retry_count:1, tags:["Returning Lead","Customer Retried"]
        5. Dedupe by email - ✅ Returns 200 with returning:true (dedupes by email OR mobile as designed)
        6. Validation (missing fields) - ✅ Returns 400 with "Missing required fields"
        7. Lead capture without attribution field - ✅ Returns 200 (attribution is optional, no crash)
        8. Source classifier smoke test (gclid) - ✅ Returns 200 (classifies as Google Ads behind the scenes)
        9. POST /api/admin/login - ✅ Returns 200 with cookie
        10. GET /api/leads with admin cookie - ✅ Returns 200 with lead data (Supabase working)
        11. GET /api/lender-criteria with admin cookie - ✅ Returns 200 with lender list
        12. CORS headers - ✅ Present on all responses
      
      KEY FINDINGS:
        ✅ Supabase is now RESTORED and working (not paused anymore)
        ✅ Attribution capture working correctly with full payload (utm_*, fbclid, gclid, _fbp, _fbc, referrer, landing_page, device/browser/platform)
        ✅ Dedupe logic working correctly - detects returning leads by mobile OR email
        ✅ Retry tags working - "Returning Lead" and "Customer Retried" tags applied correctly
        ✅ Fallback logic working - returns migration_pending:true when new columns don't exist (expected until user runs SQL migration)
        ✅ No 500 errors or crashes with any payload combination
        ✅ Validation working correctly
        ✅ Attribution field is optional - code handles missing attribution gracefully
        ✅ Source classifier working (tested with gclid for Google Ads)
        ✅ All existing endpoints (admin login, leads list, lender criteria) still working
        ✅ CORS headers present
      
      NOT TESTED (per review request):
        ⚠️  POST /api/leads (eligibility form) - requires Supabase auth JWT which cannot be easily minted from test script. This endpoint uses the same helper functions (attrToColumns, buildRetryTags, classifySource) that have been verified in /api/leads/capture tests.
      
      RECOMMENDATION FOR MAIN AGENT:
        The Phase 1 attribution foundation is working correctly. The migration_pending:true flag in responses is EXPECTED and CORRECT - it indicates the SQL migration hasn't been applied yet. This is not a bug. Once the user runs the SQL migration in Supabase SQL editor, the full attribution columns will be persisted. Until then, the fallback logic ensures submissions don't break.

  - agent: "testing"
    message: |
      Bug Fix Verification COMPLETE - Admin lead-captures endpoint working correctly ✅
      
      TESTED: GET /api/lead-captures endpoint (the main bug fix)
      
      TEST RESULTS: All 7/7 tests PASSED
        ✅ Test 1: Admin login sanity check - POST /api/admin/login returns 200 with success:true and cookie set
        ✅ Test 2: GET /api/lead-captures WITH admin cookie (MAIN FIX) - Returns 200 with lead_captures array containing 9 rows including user's earlier lead (mobile:9657781755). All required fields present (id, full_name, mobile, email, created_at). Optional attribution fields present (original_source_type, original_utm_source, original_utm_campaign, retry_count, tags, first_visit_at, last_activity_at, original_device_type, original_browser, original_platform). CORS headers present.
        ✅ Test 3: GET /api/lead-captures WITHOUT cookie - Returns 401 Unauthorized (auth guard working correctly)
        ✅ Test 4: E2E capture + list - New lead captured via POST /api/leads/capture with full attribution (fbclid:E2E_123, utm_source:facebook, utm_medium:cpc, utm_campaign:e2e-test, device:mobile, browser:Chrome, platform:Android). Lead appears in GET /api/lead-captures response with original_source_type='Meta Ads' (correctly classified from fbclid), retry_count=0, tags=['New Lead'].
        ✅ Test 5: Dedupe + retry visibility - Same mobile captured again with different source (gclid:G_456, utm_source:google). No duplicate created (same row updated). retry_count incremented to 1. tags updated to ['New Lead','Returning Lead','Customer Retried','Re-engaged from New Campaign']. original_source_type PRESERVED as 'Meta Ads' (not overwritten). latest_source_type updated to 'Google Ads'. latest_utm_source updated to 'google'.
        ✅ Test 6: CORS headers - access-control-allow-origin:* present on all responses
        ✅ Test 7: Existing endpoints smoke test - GET /api/leads returns 200 with leads array, GET /api/lender-criteria returns 200 with lenders array, GET /api/keepalive returns 200 with db:alive
      
      KEY FINDINGS:
        ✅ The main bug is FIXED - pre-eligibility leads from lead_captures table are now visible via the new GET /api/lead-captures endpoint
        ✅ User's earlier lead (mobile:9657781755) confirmed present in the response
        ✅ Admin auth guard working correctly (401 without cookie)
        ✅ Full attribution capture working (utm_*, fbclid, gclid, referrer, landing_page, device/browser/platform)
        ✅ Source classifier working correctly (Meta Ads for fbclid, Google Ads for gclid)
        ✅ Dedupe logic working correctly (no duplicates, retry_count incremented, tags updated)
        ✅ Original attribution preserved on retry (original_source_type not overwritten)
        ✅ Latest attribution refreshed on retry (latest_source_type updated)
        ✅ CORS headers present
        ✅ No 500 errors
        ✅ Existing endpoints unaffected
      
      RECOMMENDATION FOR MAIN AGENT:
        The bug fix is working correctly. The new GET /api/lead-captures endpoint successfully returns pre-eligibility leads that were previously invisible in the admin dashboard. All attribution, dedupe, and retry logic working as designed. Ready to summarize and finish.

  - agent: "testing"
    message: |
      Meta Pixel + Conversions API (CAPI) Backend Verification COMPLETE - All 10/10 tests PASSED ✅
      
      TESTED: Meta CAPI integration (server-side event forwarding to Meta Graph API with deduplication)
      
      TEST RESULTS: All 10/10 tests PASSED
        ✅ Test 1: Health check - GET /api returns 200 with ok:true, app:'LoanLaabh', supabase_configured:true
        ✅ Test 2: Keepalive - GET /api/keepalive returns 200 with db:'alive' (Supabase working)
        ✅ Test 3: Lead capture with FULL Meta identifiers - POST /api/leads/capture with full attribution (utm_*, fbclid, _fbp, _fbc, referrer, landing_page, device/browser/platform, event_id, event_source_url) returns 200 with lead_id in 1.86s (well under 5s threshold). CAPI fire does NOT slow down response significantly.
        ✅ Test 4: Direct CAPI call to Meta Graph API - Direct POST to https://graph.facebook.com/v18.0/2036446207001182/events returns 200 with events_received=1, fbtrace_id=Aps8HnIsWH87_vM-hSGZ7Mi. Confirms credentials (META_PIXEL_ID + META_CAPI_ACCESS_TOKEN) are valid and events are reaching Meta.
        ✅ Test 5: Dedupe with different source - Same mobile (9887761234) captured again with different source (google vs facebook) returns 200 with returning:true, retry_count:1, tags include 'Re-engaged from New Campaign'. Server fires another CAPI Lead event (correct behavior - Meta dedupes via event_id, not to prevent multiple server events).
        ✅ Test 6: Missing event_id doesn't break - POST /api/leads/capture without event_id or event_source_url returns 200. Server generates fallback event_id (srv-<uuid>-<ts>).
        ✅ Test 7: PII hashing code verification - All 7 checks PASSED: (a) SHA-256 hashing for email/phone/name/city, (b) email normalized to lowercase, (c) 10-digit Indian mobiles get 91 country code prefix, (d) does NOT hash fbp, (e) does NOT hash fbc, (f) uses x-forwarded-for for client_ip_address, (g) uses user-agent for client_user_agent. Implementation matches Meta spec exactly.
        ✅ Test 8: Non-blocking marketing failures - sendMetaCapiEventSafe function exists and swallows all errors (returns ok:false instead of throwing). route.js uses sendMetaCapiEventSafe (not sendMetaCapiEvent). Lead capture response NOT dependent on CAPI success - marketing failures never break user flows.
        ✅ Test 9: Existing behaviour preserved - All 4 sub-tests PASSED: (a) admin login returns 200 with cookie, (b) GET /api/leads returns 200 with 5 leads, (c) GET /api/lender-criteria returns 200 with 37 lenders, (d) GET /api/lead-captures returns 200 with 12 captures including test leads (mobiles 9887761234, 9876543210).
        ✅ Test 10: CORS headers - access-control-allow-origin:* present on POST /api/leads/capture response.
      
      KEY FINDINGS:
        ✅ Meta CAPI integration working correctly end-to-end
        ✅ Direct Graph API call confirms credentials valid and events reaching Meta
        ✅ Lead capture with full attribution works in reasonable time (1.86s including CAPI fire)
        ✅ Dedupe logic working correctly with retry_count incrementing
        ✅ PII hashing implementation correct per Meta spec (SHA-256 for PII, no hashing for fbp/fbc/fbclid/IP/UA)
        ✅ Non-blocking error handling ensures marketing failures don't break user flows
        ✅ All existing endpoints still working
        ✅ Test leads visible in lead_captures table
        ✅ No HTTP 500 errors anywhere
      
      NOT TESTED (per review request):
        ⚠️  Frontend Pixel firing - requires real browser (separate frontend test if user requests)
        ⚠️  POST /api/leads (eligibility form) - requires Supabase JWT (cannot be easily minted from test script)
      
      RECOMMENDATION FOR MAIN AGENT:
        Meta Pixel + CAPI integration is working correctly. All backend tests passed. Ready to summarize and finish.

