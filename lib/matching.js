// Rule-based screening engine for LoanLaabh.
// Filters lenders against lead profile using lender_criteria.

const CIBIL_BAND_MIN = { excellent: 750, good: 700, average: 650, poor: 580, unknown: 700 }

function emi(p, ratePct, months) {
  const r = ratePct / 12 / 100
  if (!months || r === 0) return p / (months || 1)
  const x = Math.pow(1 + r, months)
  return (p * r * x) / (x - 1)
}

export function computeFoir(existingEmi, netSalary) {
  if (!netSalary || netSalary <= 0) return 0
  return Math.round((existingEmi / netSalary) * 10000) / 100
}

export function screenLenders(lead, lenders) {
  const cibil = CIBIL_BAND_MIN[lead.credit_band || 'unknown'] || 700
  const foir = lead.foir ?? computeFoir(lead.existing_emi || 0, lead.net_monthly_salary)
  const tenureGuess = lead.loan_type === 'home' || lead.loan_type === 'lap' ? 180 : 36

  const eligible = []
  for (const l of lenders) {
    if (!l.active) continue
    const reasons = []
    let blocker = null

    if (!l.loan_types?.includes(lead.loan_type)) continue
    if (cibil < l.min_cibil) { blocker = `CIBIL band below ${l.min_cibil}`; }
    if (!blocker && lead.age && (lead.age < l.min_age || lead.age > l.max_age)) blocker = `Age outside ${l.min_age}-${l.max_age}`
    if (!blocker && lead.net_monthly_salary < l.min_net_salary) blocker = `Net salary below ₹${l.min_net_salary}`
    if (!blocker && !l.accepts_employment?.includes(lead.employment_type)) blocker = `Employment type not accepted`
    if (!blocker && l.pf_mandatory && lead.pf_deducted === false) blocker = `PF deduction mandatory`
    if (!blocker && l.pt_mandatory && lead.pt_deducted === false) blocker = `PT deduction mandatory`
    if (!blocker) {
      const isHigh = lead.net_monthly_salary >= (l.high_income_threshold || 75000)
      const foirCap = isHigh ? l.foir_max_high_income : l.foir_max
      if (foir > foirCap) blocker = `FOIR ${foir}% exceeds ${foirCap}%`
    }
    if (!blocker && lead.loan_amount && (lead.loan_amount < l.min_loan_amount || lead.loan_amount > l.max_loan_amount)) {
      blocker = `Loan amount outside ₹${l.min_loan_amount}-₹${l.max_loan_amount}`
    }
    if (!blocker && l.city_restrictions?.length && lead.city && !l.city_restrictions.includes(lead.city)) {
      blocker = `City not serviced`
    }
    if (blocker) continue

    reasons.push(`CIBIL band ${lead.credit_band} OK`)
    reasons.push(`Income ₹${lead.net_monthly_salary} clears ₹${l.min_net_salary}`)
    reasons.push(`FOIR ${foir}% within limit`)
    if (l.pf_mandatory && lead.pf_deducted) reasons.push('PF deduction confirmed')

    const estRate = l.interest_rate_min + (l.interest_rate_max - l.interest_rate_min) * 0.4
    const estEmi = Math.round(emi(lead.loan_amount, estRate, tenureGuess))
    // simple score: based on credit margin + foir margin + income margin
    const creditMargin = (cibil - l.min_cibil) / 100
    const incomeMargin = (lead.net_monthly_salary - l.min_net_salary) / Math.max(l.min_net_salary, 1)
    const score = Math.max(0, Math.min(100, Math.round(60 + creditMargin * 8 + incomeMargin * 10 - foir * 0.3)))

    eligible.push({
      lender: l,
      match_score: score,
      estimated_emi: estEmi,
      estimated_interest_rate: Math.round(estRate * 100) / 100,
      reasons,
    })
  }
  eligible.sort((a, b) => b.match_score - a.match_score)
  return { eligible, foir }
}

// Heuristic estimate of eligible loan amount (multiplier method)
export function estimateEligibleAmount(lead) {
  const cibil = CIBIL_BAND_MIN[lead.credit_band || 'unknown'] || 700
  let mult = 18 // months of net income
  if (cibil >= 750) mult = 28
  else if (cibil >= 700) mult = 22
  else if (cibil >= 650) mult = 16
  else mult = 10
  if (lead.employment_type === 'business_owner') mult *= 1.2
  const foir = lead.foir ?? computeFoir(lead.existing_emi || 0, lead.net_monthly_salary)
  if (foir > 50) mult *= 0.6
  else if (foir > 35) mult *= 0.85
  const base = lead.net_monthly_salary * mult
  return Math.round(Math.min(base, lead.loan_amount * 1.1))
}
