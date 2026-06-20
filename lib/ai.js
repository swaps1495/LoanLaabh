// AI analysis layer. Tries OpenAI-compatible endpoint via env vars.
// Gracefully falls back to deterministic rule-based scoring if AI unavailable.
import { estimateEligibleAmount, computeFoir } from './matching'

const LLM_BASE_URL = process.env.LLM_BASE_URL || 'https://integrations.emergentagent.com/llm/v1'
const LLM_API_KEY = process.env.OPENAI_API_KEY || process.env.EMERGENT_LLM_KEY
const LLM_MODEL = process.env.LLM_MODEL || 'gpt-4o'

function ruleBasedAnalysis(lead, eligible) {
  const foir = lead.foir ?? computeFoir(lead.existing_emi || 0, lead.net_monthly_salary)
  const cibilMap = { excellent: 90, good: 78, average: 60, poor: 40, unknown: 60 }
  const cibilPts = cibilMap[lead.credit_band || 'unknown']
  const incomePts = Math.min(20, lead.net_monthly_salary / 5000)
  const foirPenalty = foir > 65 ? -20 : foir > 50 ? -10 : 0
  const enquiryPenalty = lead.recent_enquiries === 'yes' ? -8 : 0
  const lenderBonus = Math.min(15, eligible.length * 2)
  const score = Math.max(0, Math.min(100, Math.round(cibilPts * 0.6 + incomePts + foirPenalty + enquiryPenalty + lenderBonus)))

  const approval = score >= 75 ? 'High' : score >= 55 ? 'Medium' : 'Low'
  const priority = score >= 75 && eligible.length >= 3 ? 'Hot' : score >= 55 ? 'Warm' : 'Cold'
  const flags = []
  if (foir > 65) flags.push('High FOIR')
  if (lead.credit_band === 'poor') flags.push('Low CIBIL band')
  if (lead.recent_enquiries === 'yes') flags.push('Recent credit enquiries')
  if (lead.total_experience_years && lead.total_experience_years < 1) flags.push('Low work experience')
  if (eligible.length === 0) flags.push('No lenders matched')

  const top3 = eligible.slice(0, 3).map(e => ({ lender_id: e.lender.id, lender_name: e.lender.name, reason: `Score ${e.match_score}, est EMI ₹${e.estimated_emi}@${e.estimated_interest_rate}%` }))
  const eligibleAmount = estimateEligibleAmount(lead)

  return {
    lead_score: score,
    approval_probability: approval,
    estimated_eligible_amount: eligibleAmount,
    top_3_lenders: top3,
    risk_flags: flags,
    sales_priority: priority,
    internal_notes: `Rule-based assessment. ${eligible.length} lenders matched. FOIR ${foir}%. ${flags.length ? 'Flags: ' + flags.join(', ') : 'No major flags.'}`,
    provider: 'rule_based',
  }
}

export async function analyzeLeadAI(lead, eligible) {
  const fallback = ruleBasedAnalysis(lead, eligible)
  if (!LLM_API_KEY) return fallback

  const lendersForAI = eligible.slice(0, 8).map(e => ({ id: e.lender.id, name: e.lender.name, match_score: e.match_score, est_emi: e.estimated_emi, rate: e.estimated_interest_rate }))

  const sys = 'You are a credit underwriter and loan sales analyst at an Indian DSA. Return STRICT JSON only, no prose.'
  const user = `Analyze this loan lead and return a JSON object with keys: lead_score (0-100), approval_probability ('High'|'Medium'|'Low'), estimated_eligible_amount (number INR), top_3_lenders (array of {lender_id, lender_name, reason}), risk_flags (string[]), sales_priority ('Hot'|'Warm'|'Cold'), internal_notes (string).\n\nLead: ${JSON.stringify(lead)}\nEligible lenders (rule-based): ${JSON.stringify(lendersForAI)}`

  try {
    const res = await fetch(`${LLM_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LLM_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: LLM_MODEL,
        messages: [{ role: 'system', content: sys }, { role: 'user', content: user }],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      }),
    })
    if (!res.ok) {
      console.warn('AI call failed:', res.status, await res.text().catch(()=>''))
      return fallback
    }
    const data = await res.json()
    const content = data.choices?.[0]?.message?.content
    if (!content) return fallback
    const parsed = JSON.parse(content)
    return {
      lead_score: parsed.lead_score ?? fallback.lead_score,
      approval_probability: parsed.approval_probability || fallback.approval_probability,
      estimated_eligible_amount: parsed.estimated_eligible_amount || fallback.estimated_eligible_amount,
      top_3_lenders: parsed.top_3_lenders || fallback.top_3_lenders,
      risk_flags: parsed.risk_flags || fallback.risk_flags,
      sales_priority: parsed.sales_priority || fallback.sales_priority,
      internal_notes: parsed.internal_notes || fallback.internal_notes,
      provider: 'openai',
    }
  } catch (e) {
    console.warn('AI exception:', e.message)
    return fallback
  }
}
