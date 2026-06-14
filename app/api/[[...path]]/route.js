import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getSupabaseServer, isSupabaseConfigured } from '@/lib/supabase'
import { screenLenders, computeFoir } from '@/lib/matching'
import { analyzeLeadAI } from '@/lib/ai'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const ADMIN_COOKIE = 'loanlaabh_admin'

function cors(res) {
  res.headers.set('Access-Control-Allow-Origin', process.env.CORS_ORIGINS || '*')
  res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.headers.set('Access-Control-Allow-Credentials', 'true')
  return res
}

export async function OPTIONS() { return cors(new NextResponse(null, { status: 200 })) }

function noConf() {
  return cors(NextResponse.json({ error: 'Supabase not configured. Add SUPABASE env vars and restart.' }, { status: 503 }))
}
async function isAdmin() { return cookies().get(ADMIN_COOKIE)?.value === 'ok' }

async function handle(request, { params }) {
  const { path = [] } = params
  const route = '/' + path.join('/')
  const method = request.method
  try {
    if (route === '/' && method === 'GET') {
      return cors(NextResponse.json({ ok: true, app: 'LoanLaabh', supabase_configured: isSupabaseConfigured() }))
    }

    // ---- ADMIN AUTH ----
    if (route === '/admin/login' && method === 'POST') {
      const { password } = await request.json()
      if (password === process.env.ADMIN_PASSWORD) {
        cookies().set(ADMIN_COOKIE, 'ok', { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60*60*8 })
        return cors(NextResponse.json({ success: true }))
      }
      return cors(NextResponse.json({ error: 'Invalid password' }, { status: 401 }))
    }
    if (route === '/admin/logout' && method === 'POST') {
      cookies().set(ADMIN_COOKIE, '', { maxAge: 0, path: '/' })
      return cors(NextResponse.json({ success: true }))
    }
    if (route === '/admin/check' && method === 'GET') {
      return cors(NextResponse.json({ authenticated: await isAdmin() }))
    }

    // ---- SUBMIT LEAD ----
    if (route === '/leads' && method === 'POST') {
      const sb = getSupabaseServer(); if (!sb) return noConf()
      const b = await request.json()
      const required = ['full_name','mobile','employment_type','net_monthly_salary','loan_type','loan_amount']
      for (const k of required) if (!b[k]) return cors(NextResponse.json({ error: `Missing field: ${k}` }, { status: 400 }))

      const lead = {
        full_name: b.full_name, mobile: b.mobile, pan: b.pan || null, city: b.city || null,
        pincode: b.pincode || null, age: b.age ? Number(b.age) : null,
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
        loan_type: b.loan_type, loan_amount: Number(b.loan_amount),
        loan_purpose: b.loan_purpose || null,
        credit_band: b.credit_band || 'unknown',
        recent_enquiries: b.recent_enquiries || null,
        latest_credit_enquiries_count: b.latest_credit_enquiries_count ? Number(b.latest_credit_enquiries_count) : (b.recent_enquiries === 'yes' ? 3 : 0),
        city_tier: b.city_tier || 'Other',
        consent_share: !!b.consent_share, consent_terms: !!b.consent_terms,
      }
      lead.foir = computeFoir(lead.existing_emi, lead.net_monthly_salary)

      // 1. fetch active lenders + FOIR slabs
      const { data: lenders } = await sb.from('lender_criteria').select('*').eq('active', true)
      const lenderIds = (lenders || []).map(l => l.id)
      let foirSlabs = []
      if (lenderIds.length) {
        const { data: slabs } = await sb.from('lender_foir_slabs').select('*').in('lender_id', lenderIds)
        foirSlabs = slabs || []
      }
      const { eligible } = screenLenders(lead, lenders || [], foirSlabs)

      // 2. AI analysis
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
        lead_status: 'New',
      }

      const { data: row, error: e1 } = await sb.from('leads').insert(enriched).select().single()
      if (e1) return cors(NextResponse.json({ error: e1.message }, { status: 500 }))

      // 3. persist matches (internal)
      if (eligible.length) {
        const matchRows = eligible.slice(0, 10).map(m => ({
          lead_id: row.id, lender_id: m.lender.id, match_score: m.match_score,
          estimated_emi: m.estimated_emi, estimated_interest_rate: m.estimated_interest_rate, reasons: m.reasons,
        }))
        await sb.from('matches').insert(matchRows)
      }

      // Customer-facing response - NO lender names
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

    // ---- ADMIN: LEADS ----
    if (route === '/leads' && method === 'GET') {
      if (!(await isAdmin())) return cors(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
      const sb = getSupabaseServer(); if (!sb) return noConf()
      const { data, error } = await sb.from('leads').select('*, matches(*, lender_criteria(name))').order('created_at', { ascending: false }).limit(1000)
      if (error) return cors(NextResponse.json({ error: error.message }, { status: 500 }))
      return cors(NextResponse.json({ leads: data }))
    }

    // Update lead status
    const leadStatusMatch = route.match(/^\/leads\/([^/]+)\/status$/)
    if (leadStatusMatch && method === 'PATCH') {
      if (!(await isAdmin())) return cors(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
      const sb = getSupabaseServer(); if (!sb) return noConf()
      const { lead_status } = await request.json()
      const { error } = await sb.from('leads').update({ lead_status, updated_at: new Date().toISOString() }).eq('id', leadStatusMatch[1])
      if (error) return cors(NextResponse.json({ error: error.message }, { status: 500 }))
      return cors(NextResponse.json({ success: true }))
    }

    // ---- LENDER CRITERIA CRUD ----
    if (route === '/lender-criteria' && method === 'GET') {
      if (!(await isAdmin())) return cors(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
      const sb = getSupabaseServer(); if (!sb) return noConf()
      const { data, error } = await sb.from('lender_criteria').select('*').order('name')
      if (error) return cors(NextResponse.json({ error: error.message }, { status: 500 }))
      return cors(NextResponse.json({ lenders: data }))
    }
    if (route === '/lender-criteria' && method === 'POST') {
      if (!(await isAdmin())) return cors(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
      const sb = getSupabaseServer(); if (!sb) return noConf()
      const b = await request.json()
      const { data, error } = await sb.from('lender_criteria').insert(b).select().single()
      if (error) return cors(NextResponse.json({ error: error.message }, { status: 500 }))
      return cors(NextResponse.json({ lender: data }))
    }
    const lenderMatch = route.match(/^\/lender-criteria\/([^/]+)$/)
    if (lenderMatch && method === 'PATCH') {
      if (!(await isAdmin())) return cors(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
      const sb = getSupabaseServer(); if (!sb) return noConf()
      const b = await request.json()
      const { data, error } = await sb.from('lender_criteria').update(b).eq('id', lenderMatch[1]).select().single()
      if (error) return cors(NextResponse.json({ error: error.message }, { status: 500 }))
      return cors(NextResponse.json({ lender: data }))
    }
    if (lenderMatch && method === 'DELETE') {
      if (!(await isAdmin())) return cors(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
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
