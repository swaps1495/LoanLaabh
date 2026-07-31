import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getSupabaseServer, isSupabaseConfigured, getUserFromAuthHeader, isUserAdmin } from '@/lib/supabase'
import { screenLenders, computeFoir } from '@/lib/matching'
import { analyzeLeadAI } from '@/lib/ai'
import { attrToColumns, buildRetryTags } from '@/lib/attribution-server'
import { classifySource } from '@/lib/source-classifier'
import { buildUserData, sendMetaCapiEventSafe, fbcFromFbclid } from '@/lib/meta-capi'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const ACTIVE_STATUSES = ['draft','submitted','docs_pending','sent_to_lender','under_review','New','Qualified','Hot','Applied']
const LEGACY_ADMIN_COOKIE = 'loanlaabh_admin'

function cors(res) {
  res.headers.set('Access-Control-Allow-Origin', process.env.CORS_ORIGINS || '*')
  res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.headers.set('Access-Control-Allow-Credentials', 'true')
  return res
}

function isNetworkError(error) {
  if (!error) return false
  const msg = (error.message || error.toString() || '').toLowerCase()
  return (
    msg.includes('fetch failed') ||
    msg.includes('enotfound') ||
    msg.includes('econnrefused') ||
    msg.includes('etimedout') ||
    msg.includes('network') ||
    msg.includes('typeerror: fetch')
  )
}

function supabaseUnreachable() {
  return cors(NextResponse.json({
    error: 'Database temporarily unreachable. Your Supabase project may be paused (free-tier auto-pauses after 7 days of inactivity). Please visit https://app.supabase.com and click "Restore project" to resume.',
    code: 'SUPABASE_UNREACHABLE',
  }, { status: 503 }))
}

export async function OPTIONS() { return cors(new NextResponse(null, { status: 200 })) }
function noConf() { return cors(NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })) }
function unauth() { return cors(NextResponse.json({ error: 'Unauthorized' }, { status: 401 })) }

async function adminCheck(request) {
  const user = await getUserFromAuthHeader(request)
  if (user && await isUserAdmin(user)) return { user, source: 'auth' }
  // Legacy cookie fallback
  if (cookies().get(LEGACY_ADMIN_COOKIE)?.value === 'ok') return { user: null, source: 'legacy_cookie' }
  return null
}

async function handle(request, { params }) {
  const { path = [] } = params
  const route = '/' + path.join('/')
  const method = request.method
  try {
    if (route === '/' && method === 'GET') {
      return cors(NextResponse.json({ ok: true, app: 'LoanLaabh', supabase_configured: isSupabaseConfigured() }))
    }

    // ============ KEEPALIVE (for UptimeRobot / cron) ============
    // Runs a minimal SELECT on Supabase so the free-tier project does NOT auto-pause.
    // Point UptimeRobot at: https://<your-domain>/api/keepalive  (ping every 5 min)
    if (route === '/keepalive' && method === 'GET') {
      const start = Date.now()
      const sb = getSupabaseServer()
      if (!sb) {
        return cors(NextResponse.json({ ok: false, db: 'not_configured' }, { status: 503 }))
      }
      try {
        const { error } = await sb.from('admins').select('id', { count: 'exact', head: true }).limit(1)
        if (error && isNetworkError(error)) {
          return cors(NextResponse.json({ ok: false, db: 'unreachable', error: 'Supabase unreachable — project may be paused.', ms: Date.now() - start }, { status: 503 }))
        }
        // Even if 'admins' table doesn't exist, a table-missing error still counts as a query hit
        // which is enough to keep Supabase from pausing. Return success.
        return cors(NextResponse.json({ ok: true, db: 'alive', ms: Date.now() - start, ts: new Date().toISOString() }))
      } catch (e) {
        if (isNetworkError(e)) return supabaseUnreachable()
        // Even a non-network error means we reached the DB — treat as alive
        return cors(NextResponse.json({ ok: true, db: 'alive', note: 'query returned error but db is reachable', ms: Date.now() - start }))
      }
    }

    // ============ ADMIN (legacy password) ============
    if (route === '/admin/login' && method === 'POST') {
      const { password } = await request.json()
      if (password === process.env.ADMIN_PASSWORD) {
        cookies().set(LEGACY_ADMIN_COOKIE, 'ok', { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60*60*8 })
        return cors(NextResponse.json({ success: true }))
      }
      return cors(NextResponse.json({ error: 'Invalid password' }, { status: 401 }))
    }
    if (route === '/admin/logout' && method === 'POST') {
      cookies().set(LEGACY_ADMIN_COOKIE, '', { maxAge: 0, path: '/' })
      return cors(NextResponse.json({ success: true }))
    }
    if (route === '/admin/check' && method === 'GET') {
      const a = await adminCheck(request)
      return cors(NextResponse.json({ authenticated: !!a, source: a?.source || null }))
    }

    // ============ ME (user-self) ============
    if (route === '/me/applications' && method === 'GET') {
      const user = await getUserFromAuthHeader(request)
      if (!user) return unauth()
      const sb = getSupabaseServer(); if (!sb) return noConf()
      const { data: profile } = await sb.from('profiles').select('*').eq('id', user.id).maybeSingle()
      const { data: apps } = await sb.from('leads').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      return cors(NextResponse.json({ profile, applications: apps || [] }))
    }

    if (route === '/me/profile' && method === 'PATCH') {
      const user = await getUserFromAuthHeader(request)
      if (!user) return unauth()
      const sb = getSupabaseServer(); if (!sb) return noConf()
      const body = await request.json()
      const updates = { full_name: body.full_name, phone: body.phone, city: body.city, updated_at: new Date().toISOString() }
      const { data, error } = await sb.from('profiles').upsert({ id: user.id, email: user.email, ...updates }).select().single()
      if (error) return cors(NextResponse.json({ error: error.message }, { status: 500 }))
      return cors(NextResponse.json({ profile: data }))
    }

    if (route === '/me/has-active' && method === 'GET') {
      const user = await getUserFromAuthHeader(request)
      if (!user) return unauth()
      const sb = getSupabaseServer(); if (!sb) return noConf()
      const { data } = await sb.from('leads').select('id, lead_status, loan_type, created_at').eq('user_id', user.id).in('lead_status', ACTIVE_STATUSES).limit(1)
      return cors(NextResponse.json({ has_active: (data || []).length > 0, active: data?.[0] || null }))
    }

    // ============ LEAD SUBMISSION (requires auth) ============
    if (route === '/leads' && method === 'POST') {
      const user = await getUserFromAuthHeader(request)
      if (!user) return unauth()
      const sb = getSupabaseServer(); if (!sb) return noConf()

      // Check for active application
      const { data: existing } = await sb.from('leads').select('id, lead_status, loan_type').eq('user_id', user.id).in('lead_status', ACTIVE_STATUSES).limit(1)
      if (existing && existing.length > 0) {
        return cors(NextResponse.json({
          error: 'active_application_exists',
          message: 'You already have an ongoing application. Please track it from your dashboard.',
          active: existing[0],
        }, { status: 409 }))
      }

      const b = await request.json()
      const required = ['full_name','mobile','employment_type','net_monthly_salary','loan_type','loan_amount']
      for (const k of required) if (!b[k]) return cors(NextResponse.json({ error: `Missing field: ${k}` }, { status: 400 }))

      // Phase-1 attribution capture
      const attrFirst = b.attribution?.first || null
      const attrLatest = b.attribution?.latest || attrFirst || null
      const originalCols = attrToColumns(attrFirst, 'original')
      const latestCols = attrToColumns(attrLatest, 'latest')

      // Check if a prior lead exists for this mobile (regardless of user_id)
      // to preserve original attribution and increment retry count.
      const cleanMobile = String(b.mobile).replace(/\D/g, '').slice(0, 10)
      const { data: priorLeads } = await sb
        .from('leads').select('*').eq('mobile', cleanMobile)
        .order('created_at', { ascending: true }).limit(1)
      const priorLead = priorLeads && priorLeads[0]

      const lead = {
        user_id: user.id,
        full_name: b.full_name, mobile: cleanMobile, pan: b.pan || null, city: b.city || null,
        pincode: b.pincode || null, age: b.age ? Number(b.age) : null,
        city_tier: b.city_tier || 'Other',
        residence_type: b.residence_type || null,
        employment_type: b.employment_type,
        company_name: b.company_name || null, designation: b.designation || null,
        total_experience_years: b.total_experience_years ? Number(b.total_experience_years) : null,
        current_company_experience_years: b.current_company_experience_years ? Number(b.current_company_experience_years) : null,
        salary_account_bank: b.salary_account_bank || null,
        net_monthly_salary: Number(b.net_monthly_salary),
        existing_emi: Number(b.existing_emi || 0),
        pf_deducted: b.pf_deducted ?? null,
        pt_deducted: b.pt_deducted ?? null,
        loan_type: b.loan_type, loan_amount: Number(b.loan_amount), requested_amount: Number(b.loan_amount),
        loan_purpose: b.loan_purpose || null,
        credit_band: b.credit_band || 'unknown',
        recent_enquiries: b.recent_enquiries || null,
        latest_credit_enquiries_count: b.latest_credit_enquiries_count ? Number(b.latest_credit_enquiries_count) : (b.recent_enquiries === 'yes' ? 3 : 0),
        consent_share: !!b.consent_share, consent_terms: !!b.consent_terms,
      }
      lead.foir = computeFoir(lead.existing_emi, lead.net_monthly_salary)

      // Update profile with latest info
      await sb.from('profiles').upsert({ id: user.id, email: user.email, full_name: lead.full_name, phone: lead.mobile, city: lead.city, updated_at: new Date().toISOString() })

      const { data: lenders } = await sb.from('lender_criteria').select('*').eq('active', true)
      const lenderIds = (lenders || []).map(l => l.id)
      let foirSlabs = []
      if (lenderIds.length) {
        const { data: slabs } = await sb.from('lender_foir_slabs').select('*').in('lender_id', lenderIds)
        foirSlabs = slabs || []
      }
      const { eligible } = screenLenders(lead, lenders || [], foirSlabs)

      const ai = await analyzeLeadAI(lead, eligible)
      // Build retry tags & original attribution preservation
      const retryInfo = priorLead ? buildRetryTags(priorLead, attrLatest, { reason: 'eligibility_retry' }) : { tags: ['New Lead'], sourceChanged: false }
      const preservedOriginalCols = priorLead ? {
        original_source_type: priorLead.original_source_type || originalCols.original_source_type || null,
        original_utm_source: priorLead.original_utm_source || originalCols.original_utm_source || null,
        original_utm_medium: priorLead.original_utm_medium || originalCols.original_utm_medium || null,
        original_utm_campaign: priorLead.original_utm_campaign || originalCols.original_utm_campaign || null,
        original_utm_content: priorLead.original_utm_content || originalCols.original_utm_content || null,
        original_utm_term: priorLead.original_utm_term || originalCols.original_utm_term || null,
        original_fbclid: priorLead.original_fbclid || originalCols.original_fbclid || null,
        original_gclid: priorLead.original_gclid || originalCols.original_gclid || null,
        original_fbp: priorLead.original_fbp || originalCols.original_fbp || null,
        original_fbc: priorLead.original_fbc || originalCols.original_fbc || null,
        original_referrer: priorLead.original_referrer || originalCols.original_referrer || null,
        original_landing_page: priorLead.original_landing_page || originalCols.original_landing_page || null,
        original_device_type: priorLead.original_device_type || originalCols.original_device_type || null,
        original_browser: priorLead.original_browser || originalCols.original_browser || null,
        original_platform: priorLead.original_platform || originalCols.original_platform || null,
        first_visit_at: priorLead.first_visit_at || originalCols.first_visit_at,
      } : originalCols

      const enriched = {
        ...lead,
        lead_score: ai.lead_score,
        approval_probability: ai.approval_probability,
        estimated_eligible_amount: ai.estimated_eligible_amount,
        recommended_lender_ids: (ai.top_3_lenders || []).map(t => t.lender_id).filter(Boolean),
        risk_flags: ai.risk_flags,
        sales_priority: ai.sales_priority,
        internal_notes: ai.internal_notes,
        ai_provider: ai.provider,
        lead_status: 'submitted',
        // Phase-1 attribution
        ...preservedOriginalCols,
        ...latestCols,
        retry_count: priorLead ? (priorLead.retry_count || 0) + 1 : 0,
        tags: retryInfo.tags,
        last_activity_at: new Date().toISOString(),
        consent_at: (lead.consent_share || lead.consent_terms) ? new Date().toISOString() : null,
      }

      // Try insert with attribution; fall back gracefully if migration not yet applied
      let row, e1
      {
        const res = await sb.from('leads').insert(enriched).select().single()
        row = res.data; e1 = res.error
        if (e1 && /column .* does not exist|schema cache/i.test(e1.message || '')) {
          // Fallback — insert without new attribution columns
          const { retry_count, tags, last_activity_at, consent_at,
            original_source_type, original_utm_source, original_utm_medium,
            original_utm_campaign, original_utm_content, original_utm_term,
            original_fbclid, original_gclid, original_fbp, original_fbc,
            original_referrer, original_landing_page, original_device_type,
            original_browser, original_platform, first_visit_at,
            latest_source_type, latest_utm_source, latest_utm_medium,
            latest_utm_campaign, latest_utm_content, latest_utm_term,
            latest_referrer, latest_landing_page,
            ...safe } = enriched
          const res2 = await sb.from('leads').insert(safe).select().single()
          row = res2.data; e1 = res2.error
        }
      }
      if (e1) {
        if (isNetworkError(e1)) return supabaseUnreachable()
        return cors(NextResponse.json({ error: e1.message }, { status: 500 }))
      }

      if (eligible.length) {
        const matchRows = eligible.slice(0, 10).map(m => ({
          lead_id: row.id, lender_id: m.lender.id, match_score: m.match_score,
          estimated_emi: m.estimated_emi, estimated_interest_rate: m.estimated_interest_rate, reasons: m.reasons,
        }))
        await sb.from('matches').insert(matchRows)
      }

      // Fire Meta CAPI CompleteRegistration event (post-eligibility)
      {
        const fbcVal = attrFirst?._fbc || fbcFromFbclid(attrFirst?.fbclid)
        await sendMetaCapiEventSafe({
          request,
          event_name: 'CompleteRegistration',
          event_id: b.event_id || `srv-cr-${row.id}`,
          event_source_url: b.event_source_url || attrFirst?.landing_page || 'https://loanlaabh.com/eligibility',
          user: buildUserData(request, {
            email: user.email, phone: cleanMobile, fullName: lead.full_name,
            fbp: attrFirst?._fbp || null, fbc: fbcVal,
            external_id: row.id, city: lead.city,
          }),
          custom_data: {
            content_name: lead.loan_type,
            content_category: 'loan_eligibility',
            value: Number(lead.loan_amount) || 0,
            currency: 'INR',
            status: ai.approval_probability,
          },
        })
      }

      return cors(NextResponse.json({
        lead_id: row.id,
        first_name: lead.full_name.split(' ')[0],
        loan_type: lead.loan_type,
        pre_qualified: eligible.length > 0 && ai.approval_probability !== 'Low',
        estimated_eligible_amount: ai.estimated_eligible_amount,
        approval_probability: ai.approval_probability,
        lenders_matched_count: eligible.length,
        foir: lead.foir,
      }))
    }

    // ============ ADMIN LEADS ============
    if (route === '/leads' && method === 'GET') {
      const a = await adminCheck(request); if (!a) return unauth()
      const sb = getSupabaseServer(); if (!sb) return noConf()
      const { data, error } = await sb.from('leads').select('*, matches(*, lender_criteria(name))').order('created_at', { ascending: false }).limit(1000)
      if (error) {
        if (isNetworkError(error)) return supabaseUnreachable()
        return cors(NextResponse.json({ error: error.message }, { status: 500 }))
      }
      return cors(NextResponse.json({ leads: data }))
    }

    const leadStatusMatch = route.match(/^\/leads\/([^/]+)\/status$/)
    if (leadStatusMatch && method === 'PATCH') {
      const a = await adminCheck(request); if (!a) return unauth()
      const sb = getSupabaseServer(); if (!sb) return noConf()
      const { lead_status, admin_notes } = await request.json()
      const upd = { updated_at: new Date().toISOString() }
      if (lead_status) upd.lead_status = lead_status
      if (admin_notes !== undefined) upd.admin_notes = admin_notes
      const { error } = await sb.from('leads').update(upd).eq('id', leadStatusMatch[1])
      if (error) return cors(NextResponse.json({ error: error.message }, { status: 500 }))
      return cors(NextResponse.json({ success: true }))
    }

    // ============ LENDER CRUD ============
    // ============ LEAD CAPTURES (admin — pre-eligibility funnel view) ============
    if (route === '/lead-captures' && method === 'GET') {
      const a = await adminCheck(request); if (!a) return unauth()
      const sb = getSupabaseServer(); if (!sb) return noConf()
      const { data, error } = await sb
        .from('lead_captures')
        .select('*')
        .order('last_activity_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })
        .limit(2000)
      if (error) {
        if (isNetworkError(error)) return supabaseUnreachable()
        // last_activity_at column may not exist if migration not applied — retry with created_at only
        if (/column .*last_activity_at.* does not exist/i.test(error.message || '')) {
          const { data: d2, error: e2 } = await sb.from('lead_captures').select('*').order('created_at', { ascending: false }).limit(2000)
          if (e2) return cors(NextResponse.json({ error: e2.message }, { status: 500 }))
          return cors(NextResponse.json({ lead_captures: d2, migration_pending: true }))
        }
        return cors(NextResponse.json({ error: error.message }, { status: 500 }))
      }
      return cors(NextResponse.json({ lead_captures: data }))
    }

    if (route === '/lender-criteria' && method === 'GET') {
      const a = await adminCheck(request); if (!a) return unauth()
      const sb = getSupabaseServer(); if (!sb) return noConf()
      const { data, error } = await sb.from('lender_criteria').select('*').order('name')
      if (error) {
        if (isNetworkError(error)) return supabaseUnreachable()
        return cors(NextResponse.json({ error: error.message }, { status: 500 }))
      }
      return cors(NextResponse.json({ lenders: data }))
    }
    if (route === '/lender-criteria' && method === 'POST') {
      const a = await adminCheck(request); if (!a) return unauth()
      const sb = getSupabaseServer(); if (!sb) return noConf()
      const b = await request.json()
      const { data, error } = await sb.from('lender_criteria').insert(b).select().single()
      if (error) return cors(NextResponse.json({ error: error.message }, { status: 500 }))
      return cors(NextResponse.json({ lender: data }))
    }
    const lenderMatch = route.match(/^\/lender-criteria\/([^/]+)$/)
    if (lenderMatch && method === 'PATCH') {
      const a = await adminCheck(request); if (!a) return unauth()
      const sb = getSupabaseServer(); if (!sb) return noConf()
      const b = await request.json()
      const { data, error } = await sb.from('lender_criteria').update(b).eq('id', lenderMatch[1]).select().single()
      if (error) return cors(NextResponse.json({ error: error.message }, { status: 500 }))
      return cors(NextResponse.json({ lender: data }))
    }
    if (lenderMatch && method === 'DELETE') {
      const a = await adminCheck(request); if (!a) return unauth()
      const sb = getSupabaseServer(); if (!sb) return noConf()
      const { error } = await sb.from('lender_criteria').delete().eq('id', lenderMatch[1])
      if (error) return cors(NextResponse.json({ error: error.message }, { status: 500 }))
      return cors(NextResponse.json({ success: true }))
    }

    // ============ LEAD CAPTURE (public, pre-eligibility) ============
    // Phase-1 attribution + dedupe by mobile OR email.
    // Also fires Meta CAPI `Lead` event with deduplication via event_id.
    if (route === '/leads/capture' && method === 'POST') {
      const body = await request.json().catch(() => ({}))
      const { full_name, mobile, email, consent, source_cta, attribution, event_id, event_source_url } = body
      if (!full_name || !mobile || !email) {
        return cors(NextResponse.json({ error: 'Missing required fields' }, { status: 400 }))
      }
      const cleanName = String(full_name).trim()
      const cleanMobile = String(mobile).replace(/\D/g, '').slice(0, 10)
      const cleanEmail = String(email).toLowerCase().trim()

      const first = attribution?.first || null
      const latest = attribution?.latest || first || null
      const originalCols = attrToColumns(first, 'original')
      const latestCols = attrToColumns(latest, 'latest')

      try {
        const supabase = getSupabaseServer()
        if (!supabase) return cors(NextResponse.json({ ok: true, warning: 'db_not_configured' }))

        // Dedupe check — same mobile OR same email
        const { data: existing, error: findErr } = await supabase
          .from('lead_captures')
          .select('*')
          .or(`mobile.eq.${cleanMobile},email.eq.${cleanEmail}`)
          .order('created_at', { ascending: true })
          .limit(1)

        if (findErr && isNetworkError(findErr)) return supabaseUnreachable()

        const now = new Date().toISOString()

        if (existing && existing.length > 0) {
          // ---- RETURNING LEAD ----
          const row = existing[0]
          const { tags } = buildRetryTags(row, latest, { reason: 'lead_capture_retry' })
          const patch = {
            // Refresh mutable info (name may have been corrected)
            full_name: cleanName,
            // NEVER overwrite the original source columns
            ...latestCols,
            latest_source_cta: source_cta || row.latest_source_cta || null,
            retry_count: (row.retry_count || 0) + 1,
            tags,
            last_activity_at: now,
            otp_verified: true,
            consent_at: consent ? now : row.consent_at || null,
          }
          const { data: updated, error: updErr } = await supabase
            .from('lead_captures').update(patch).eq('id', row.id).select().maybeSingle()
          if (updErr && isNetworkError(updErr)) return supabaseUnreachable()

          // Fire Meta CAPI Lead event (server-side, deduped with browser eventID)
          const fbcVal = first?._fbc || fbcFromFbclid(first?.fbclid)
          await sendMetaCapiEventSafe({
            request,
            event_name: 'Lead',
            event_id: event_id || `srv-${row.id}-${Date.now()}`,
            event_source_url: event_source_url || first?.landing_page || 'https://loanlaabh.com/',
            user: buildUserData(request, {
              email: cleanEmail, phone: cleanMobile, fullName: cleanName,
              fbp: first?._fbp || null, fbc: fbcVal, external_id: row.id,
            }),
            custom_data: {
              content_name: source_cta || 'lead_capture',
              content_category: 'loan_lead',
              lead_event_source: 'returning_lead',
            },
          })

          return cors(NextResponse.json({
            ok: true,
            lead_id: row.id,
            returning: true,
            retry_count: updated?.retry_count || patch.retry_count,
            tags,
          }))
        }

        // ---- NEW LEAD ----
        const insertRow = {
          full_name: cleanName,
          mobile: cleanMobile,
          email: cleanEmail,
          consent: !!consent,
          source_cta: source_cta || null,
          otp_verified: true,
          ...originalCols,
          ...latestCols,
          latest_source_cta: source_cta || null,
          retry_count: 0,
          tags: ['New Lead'],
          last_activity_at: now,
          consent_at: consent ? now : null,
        }

        const { data: inserted, error: insErr } = await supabase
          .from('lead_captures').insert(insertRow).select().maybeSingle()
        if (insErr) {
          if (isNetworkError(insErr)) return supabaseUnreachable()
          // If columns don't exist yet (migration not applied) — retry with minimal payload
          if (/column .* does not exist|schema cache/i.test(insErr.message || '')) {
            const fallback = {
              full_name: cleanName, mobile: cleanMobile, email: cleanEmail,
              consent: !!consent, source_cta: source_cta || null, otp_verified: true,
            }
            const { data: fbRow } = await supabase.from('lead_captures').insert(fallback).select().maybeSingle()
            return cors(NextResponse.json({ ok: true, lead_id: fbRow?.id, migration_pending: true }))
          }
          return cors(NextResponse.json({ ok: true, warning: insErr.message }))
        }

        // Fire Meta CAPI Lead event for new lead
        const fbcVal = first?._fbc || fbcFromFbclid(first?.fbclid)
        await sendMetaCapiEventSafe({
          request,
          event_name: 'Lead',
          event_id: event_id || `srv-${inserted?.id || Date.now()}`,
          event_source_url: event_source_url || first?.landing_page || 'https://loanlaabh.com/',
          user: buildUserData(request, {
            email: cleanEmail, phone: cleanMobile, fullName: cleanName,
            fbp: first?._fbp || null, fbc: fbcVal, external_id: inserted?.id,
          }),
          custom_data: {
            content_name: source_cta || 'lead_capture',
            content_category: 'loan_lead',
            lead_event_source: 'new_lead',
          },
        })

        return cors(NextResponse.json({ ok: true, lead_id: inserted?.id, returning: false }))
      } catch (e) {
        if (isNetworkError(e)) return supabaseUnreachable()
        console.warn('lead_captures error:', e?.message)
        return cors(NextResponse.json({ ok: true, warning: 'processed_with_warning' }))
      }
    }

    // ============ LFMai CHATBOT (public) ============
    if (route === '/lfmai/chat' && method === 'POST') {
      const body = await request.json().catch(() => ({}))
      const messages = Array.isArray(body.messages) ? body.messages.slice(-12) : []
      if (!messages.length) return cors(NextResponse.json({ error: 'No messages' }, { status: 400 }))
      const LLM_BASE_URL = process.env.LLM_BASE_URL || 'https://integrations.emergentagent.com/llm/v1'
      const LLM_API_KEY = process.env.OPENAI_API_KEY || process.env.EMERGENT_LLM_KEY
      const LLM_MODEL = process.env.LLM_MODEL || 'gpt-4o'
      if (!LLM_API_KEY) {
        return cors(NextResponse.json({ message: { role: 'assistant', content: "Hi! I'm LFMai. AI chat is temporarily unavailable — please reach us on WhatsApp at +91 77700 24242 or email help@loanlaabh.com." } }))
      }
      const system = `You are LFMai — the LoanLaabh FinMatrix AI assistant. You help Indian loan customers understand loan eligibility, CIBIL scores, EMI, FOIR, and the LoanLaabh product.

STRICT RULES:
- Keep answers short (2-4 sentences unless customer asks for details). Be warm, clear, and jargon-free.
- LoanLaabh is an AI-powered loan discovery platform — it does NOT lend money directly. Never promise loan approval, interest rates, loan amounts, or timelines — these are decided solely by the lending bank/NBFC.
- Never ask for or accept sensitive data like Aadhaar number, full PAN, card numbers, CVV, passwords, or OTPs in this chat.
- If asked about eligibility for a specific loan, guide the user to click "Check Free Eligibility" on the website — FinMatrix AI will analyze their profile.
- If asked about CIBIL score improvement, share 2-3 practical tips (on-time EMIs, credit utilisation < 30%, avoid multiple applications).
- For complex or account-specific queries, direct the user to WhatsApp +91 77700 24242 or email help@loanlaabh.com.
- Always mention Rupees as ₹, not $.
- If user asks who you are: "I'm LFMai, LoanLaabh's FinMatrix AI assistant."
- Never make up lender-specific rates, offers, or approval odds.`
      try {
        const res = await fetch(`${LLM_BASE_URL}/chat/completions`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${LLM_API_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: LLM_MODEL,
            messages: [{ role: 'system', content: system }, ...messages],
            temperature: 0.5,
            max_tokens: 350,
          }),
        })
        if (!res.ok) {
          const t = await res.text().catch(() => '')
          console.warn('LFMai LLM error:', res.status, t.slice(0, 200))
          return cors(NextResponse.json({ message: { role: 'assistant', content: "Sorry, I'm having trouble connecting right now. Please reach us on WhatsApp at +91 77700 24242 or email help@loanlaabh.com — a real advisor will help you quickly!" } }))
        }
        const data = await res.json()
        const content = data.choices?.[0]?.message?.content?.trim() || "I couldn't generate a reply. Please try again or WhatsApp us at +91 77700 24242."
        return cors(NextResponse.json({ message: { role: 'assistant', content } }))
      } catch (e) {
        console.warn('LFMai exception:', e.message)
        return cors(NextResponse.json({ message: { role: 'assistant', content: "Sorry, I'm offline for a moment. WhatsApp us at +91 77700 24242 and our team will help you." } }))
      }
    }

    return cors(NextResponse.json({ error: `Route ${route} not found` }, { status: 404 }))
  } catch (e) {
    console.error('API error', e)
    // Detect Supabase / network unreachability (paused project, DNS fail, timeout)
    if (isNetworkError(e)) return supabaseUnreachable()
    return cors(NextResponse.json({ error: e.message || 'Internal server error' }, { status: 500 }))
  }
}

export const GET = handle
export const POST = handle
export const PUT = handle
export const DELETE = handle
export const PATCH = handle
