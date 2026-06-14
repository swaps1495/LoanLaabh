import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getSupabaseServer, isSupabaseConfigured, getUserFromAuthHeader, isUserAdmin } from '@/lib/supabase'
import { screenLenders, computeFoir } from '@/lib/matching'
import { analyzeLeadAI } from '@/lib/ai'

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

      const lead = {
        user_id: user.id,
        full_name: b.full_name, mobile: b.mobile, pan: b.pan || null, city: b.city || null,
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
      }

      const { data: row, error: e1 } = await sb.from('leads').insert(enriched).select().single()
      if (e1) return cors(NextResponse.json({ error: e1.message }, { status: 500 }))

      if (eligible.length) {
        const matchRows = eligible.slice(0, 10).map(m => ({
          lead_id: row.id, lender_id: m.lender.id, match_score: m.match_score,
          estimated_emi: m.estimated_emi, estimated_interest_rate: m.estimated_interest_rate, reasons: m.reasons,
        }))
        await sb.from('matches').insert(matchRows)
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
      if (error) return cors(NextResponse.json({ error: error.message }, { status: 500 }))
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
    if (route === '/lender-criteria' && method === 'GET') {
      const a = await adminCheck(request); if (!a) return unauth()
      const sb = getSupabaseServer(); if (!sb) return noConf()
      const { data, error } = await sb.from('lender_criteria').select('*').order('name')
      if (error) return cors(NextResponse.json({ error: error.message }, { status: 500 }))
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

    return cors(NextResponse.json({ error: `Route ${route} not found` }, { status: 404 }))
  } catch (e) {
    console.error('API error', e)
    return cors(NextResponse.json({ error: e.message || 'Internal server error' }, { status: 500 }))
  }
}

export const GET = handle
export const POST = handle
export const PUT = handle
export const DELETE = handle
export const PATCH = handle
