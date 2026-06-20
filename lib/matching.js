// Screening engine v3 — uses real Excel lender data + per-income FOIR slabs + city tier salaries.
// Inputs: lead { net_monthly_salary, city_tier, latest_credit_enquiries_count, credit_band|cibil_score, age, employment_type, loan_type, loan_amount, existing_emi, pf_deducted, pt_deducted }
// Lenders array includes new fields: min_net_salary_general/metro/tier2, max_latest_enquiries, status, allowed_address_proofs.
// FOIR slabs are an array of { lender_id, income_min, income_max, foir_max }.

const CIBIL_BAND_MIN = { excellent: 760, good: 720, average: 680, poor: 620, unknown: 700 }

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

function effectiveCibil(lead) {
  if (lead.cibil_score) return Number(lead.cibil_score)
  return CIBIL_BAND_MIN[lead.credit_band || 'unknown'] || 700
}

// Pick the right min salary based on city tier (Metro > Tier2 > General fallback)
function minSalaryFor(l, tier) {
  if (tier === 'Metro' && l.min_net_salary_metro) return Number(l.min_net_salary_metro)
  if (tier === 'Tier2' && l.min_net_salary_tier2) return Number(l.min_net_salary_tier2)
  return Number(l.min_net_salary_general || l.min_net_salary || 0)
}

// Find FOIR cap from per-income slabs; fallback to lender.foir_max
function foirCapFor(slabs, lenderId, income, fallback) {
  const mine = slabs.filter(s => s.lender_id === lenderId).sort((a,b) => Number(a.income_min) - Number(b.income_min))
  for (const s of mine) {
    const min = Number(s.income_min)
    const max = s.income_max == null ? Infinity : Number(s.income_max)
    if (income >= min && income < max) return Number(s.foir_max)
    if (income >= min && s.income_max == null) return Number(s.foir_max) // open-ended
  }
  // if there's any slab matching income >= max of last band
  if (mine.length > 0) return Number(mine[mine.length - 1].foir_max)
  return fallback ?? 65
}

export function screenLenders(lead, lenders, foirSlabs = []) {
  const cibil = effectiveCibil(lead)
  const foir = lead.foir ?? computeFoir(lead.existing_emi || 0, lead.net_monthly_salary)
  const tier = lead.city_tier || 'Other'
  const enqCount = Number(lead.latest_credit_enquiries_count || 0)

  const eligible = []
  const needMoreInfo = []

  for (const l of lenders) {
    if (l.status === 'need_more_info' || l.active === false) {
      if (l.loan_types?.includes(lead.loan_type)) needMoreInfo.push({ lender: l, reason: 'Lender policy not fully captured' })
      continue
    }
    if (!l.loan_types?.includes(lead.loan_type)) continue

    const reasons = []
    let blocker = null

    // CIBIL
    if (l.min_cibil && cibil < Number(l.min_cibil)) blocker = `CIBIL ${cibil} below ${l.min_cibil}`
    else if (l.min_cibil) reasons.push(`CIBIL ${cibil} meets ${l.min_cibil}+`)

    // Age
    if (!blocker && lead.age && l.min_age && (lead.age < Number(l.min_age) || (l.max_age && lead.age > Number(l.max_age)))) {
      blocker = `Age ${lead.age} outside ${l.min_age}-${l.max_age}`
    }

    // Salary by tier
    const reqSalary = minSalaryFor(l, tier)
    if (!blocker && reqSalary > 0 && Number(lead.net_monthly_salary) < reqSalary) {
      blocker = `Salary ₹${lead.net_monthly_salary} below ₹${reqSalary} (${tier})`
    } else if (!blocker && reqSalary > 0) {
      reasons.push(`Salary clears ₹${reqSalary} (${tier})`)
    }

    // Employment
    if (!blocker && l.accepts_employment?.length && !l.accepts_employment.includes(lead.employment_type)) {
      blocker = `Employment type not accepted`
    }

    // PF / PT
    if (!blocker && l.pf_mandatory && lead.pf_deducted === false) blocker = `PF deduction mandatory`
    if (!blocker && l.pt_mandatory && lead.pt_deducted === false) blocker = `PT deduction mandatory`

    // Max latest enquiries
    if (!blocker && l.max_latest_enquiries != null && enqCount > Number(l.max_latest_enquiries)) {
      blocker = `Too many recent enquiries (${enqCount} > ${l.max_latest_enquiries})`
    } else if (!blocker && l.max_latest_enquiries != null) {
      reasons.push(`Enquiries ${enqCount} OK (max ${l.max_latest_enquiries})`)
    }

    // FOIR slab
    const foirCap = foirCapFor(foirSlabs, l.id, Number(lead.net_monthly_salary), l.foir_max)
    if (!blocker && foir > foirCap) blocker = `FOIR ${foir}% > ${foirCap}% cap`
    else if (!blocker) reasons.push(`FOIR ${foir}% within ${foirCap}% cap`)

    // Loan amount
    if (!blocker && lead.loan_amount && (lead.loan_amount < Number(l.min_loan_amount) || lead.loan_amount > Number(l.max_loan_amount))) {
      blocker = `Loan amount outside lender range`
    }

    if (blocker) continue

    const estRate = Number(l.interest_rate_min) + (Number(l.interest_rate_max) - Number(l.interest_rate_min)) * 0.4
    const tenureGuess = 36
    const estEmi = Math.round(emi(lead.loan_amount, estRate, tenureGuess))
    const creditMargin = l.min_cibil ? (cibil - Number(l.min_cibil)) / 100 : 0
    const incomeMargin = reqSalary ? Math.min(2, (lead.net_monthly_salary - reqSalary) / reqSalary) : 0
    const score = Math.max(0, Math.min(100, Math.round(60 + creditMargin * 10 + incomeMargin * 8 - foir * 0.2)))

    eligible.push({ lender: l, match_score: score, estimated_emi: estEmi, estimated_interest_rate: Math.round(estRate*100)/100, reasons })
  }
  eligible.sort((a, b) => b.match_score - a.match_score)
  return { eligible, foir, need_more_info: needMoreInfo }
}

export function estimateEligibleAmount(lead) {
  const cibil = effectiveCibil(lead)
  let mult = 18
  if (cibil >= 760) mult = 28
  else if (cibil >= 720) mult = 24
  else if (cibil >= 680) mult = 18
  else mult = 12
  if (lead.employment_type === 'business_owner') mult *= 1.15
  const foir = lead.foir ?? computeFoir(lead.existing_emi || 0, lead.net_monthly_salary)
  if (foir > 55) mult *= 0.6
  else if (foir > 40) mult *= 0.85
  if (Number(lead.latest_credit_enquiries_count || 0) > 5) mult *= 0.85
  const base = lead.net_monthly_salary * mult
  return Math.round(Math.min(base, lead.loan_amount * 1.1))
}
