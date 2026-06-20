'use client'
import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getSupabaseBrowser } from '@/lib/supabase-browser'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { ArrowRight, CheckCircle2, Sparkles, Loader2, ChevronLeft, MessageCircle, AlertTriangle, AlertCircle } from 'lucide-react'

const LOAN_TYPES = [
  { value: 'personal', label: 'Personal Loan', emoji: '💼' },
  { value: 'business', label: 'Business Loan', emoji: '📈' },
  { value: 'home', label: 'Home Loan', emoji: '🏠' },
  { value: 'lap', label: 'Loan Against Property', emoji: '🏢' },
  { value: 'car', label: 'Car Loan', emoji: '🚗' },
]
const RESIDENCE = [
  { value: 'self_owned', label: 'Self Owned' },
  { value: 'rented', label: 'Rented' },
  { value: 'family_owned', label: 'Family Owned' },
]
const EMPLOYMENT = [
  { value: 'salaried', label: 'Salaried' },
  { value: 'self_employed', label: 'Self Employed' },
  { value: 'business_owner', label: 'Business Owner' },
]
const PURPOSE = ['Personal Use','Medical Emergency','Wedding','Travel','Home Renovation','Debt Consolidation','Business Expansion','Education','Other']
const CIBIL_BANDS = [
  { value: 'excellent', label: 'Excellent (750+)' },
  { value: 'good', label: 'Good (700-749)' },
  { value: 'average', label: 'Average (650-699)' },
  { value: 'poor', label: 'Poor (Below 650)' },
  { value: 'unknown', label: "I Don't Know" },
]
const BANKS = ['HDFC Bank','ICICI Bank','SBI','Axis Bank','Kotak Mahindra','Yes Bank','IndusInd Bank','PNB','BoB','Other']
const fmtINR = (n) => '₹' + Number(n || 0).toLocaleString('en-IN')

export default function EligibilityPage() {
  const router = useRouter()
  const [authChecked, setAuthChecked] = useState(false)
  const [session, setSession] = useState(null)
  const [activeApp, setActiveApp] = useState(null)
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [form, setForm] = useState({
    full_name: '', mobile: '', pan: '', city: '', pincode: '', age: '', city_tier: 'Metro',
    residence_type: '',
    employment_type: '', company_name: '', designation: '',
    total_experience_years: '', current_company_experience_years: '', salary_account_bank: '',
    net_monthly_salary: '', existing_emi: '', pf_deducted: null, pt_deducted: null,
    loan_type: '', loan_amount: '', loan_purpose: '',
    credit_band: '', recent_enquiries: '', latest_credit_enquiries_count: '',
    consent_share: false, consent_terms: false,
  })

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const foir = useMemo(() => {
    const s = Number(form.net_monthly_salary || 0), e = Number(form.existing_emi || 0)
    return s ? Math.round((e / s) * 10000) / 100 : 0
  }, [form.net_monthly_salary, form.existing_emi])

  useEffect(() => {
    (async () => {
      const sb = getSupabaseBrowser()
      const { data: { session: s } } = await sb.auth.getSession()
      if (!s) { router.replace('/login?redirect=/eligibility'); return }
      setSession(s)
      // Check for active application
      const r = await fetch('/api/me/has-active', { headers: { Authorization: `Bearer ${s.access_token}` } })
      const d = await r.json()
      if (d.has_active) setActiveApp(d.active)
      setAuthChecked(true)
    })()
  }, [router])

  const stepValid = () => {
    if (step === 0) return form.full_name.trim().length > 1 && /^\d{10}$/.test(form.mobile) && form.age
    if (step === 1) return !!form.residence_type
    if (step === 2) return !!form.employment_type
    if (step === 3) return Number(form.net_monthly_salary) > 0 && form.pf_deducted !== null && form.pt_deducted !== null
    if (step === 4) return !!form.loan_type && Number(form.loan_amount) > 0 && !!form.loan_purpose
    if (step === 5) return !!form.credit_band && !!form.recent_enquiries
    if (step === 6) return form.consent_share && form.consent_terms
    return true
  }

  const submit = async () => {
    setSubmitting(true); setError(null)
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (res.status === 409) { setActiveApp(data.active); return }
      if (!res.ok) throw new Error(data.error || 'Submission failed')
      setResult(data)
    } catch (e) { setError(e.message) } finally { setSubmitting(false) }
  }

  if (!authChecked) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-blue-600" /></div>

  // BLOCK if active application exists
  if (activeApp) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-blue-50 flex items-center justify-center p-4">
        <Card className="max-w-lg w-full shadow-xl border-amber-200">
          <CardContent className="p-8 text-center">
            <div className="mx-auto bg-amber-100 text-amber-600 rounded-2xl w-16 h-16 flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">You already have an ongoing application</h1>
            <p className="text-slate-600 mt-3">Please track it from your dashboard. You can start a new application once the current one is closed.</p>
            <div className="bg-slate-50 rounded-lg p-4 mt-4 text-sm">
              <div className="text-slate-500">Current application</div>
              <div className="font-semibold capitalize mt-1">{activeApp.loan_type} loan · {(activeApp.lead_status || '').replace(/_/g,' ')}</div>
            </div>
            <Link href="/dashboard"><Button size="lg" className="mt-6 w-full bg-blue-600 hover:bg-blue-700">Track Application <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (result) {
    const loanLabel = LOAN_TYPES.find(l => l.value === result.loan_type)?.label || 'Loan'
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full shadow-2xl border-2 border-blue-100 overflow-hidden">
          <div className={`p-8 text-center text-white ${result.pre_qualified ? 'bg-gradient-to-br from-blue-600 to-indigo-600' : 'bg-gradient-to-br from-slate-700 to-slate-900'}`}>
            <div className="text-5xl mb-3">{result.pre_qualified ? '🎉' : '📋'}</div>
            <h1 className="text-3xl md:text-4xl font-bold">Congratulations {result.first_name}!</h1>
            <p className="mt-3 text-lg opacity-95">
              {result.pre_qualified ? `Based on your profile, you are pre-qualified for a ${loanLabel}.` : `We've assessed your profile. Let's connect you with a loan expert.`}
            </p>
          </div>
          <CardContent className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatBox label="Estimated Eligible" value={fmtINR(result.estimated_eligible_amount)} highlight />
              <StatBox label="Approval Chances" value={result.approval_probability || 'Medium'} colored={result.approval_probability} />
              <StatBox label="Status" value={result.pre_qualified ? 'Pre-Approved' : 'Under Review'} colored="info" />
            </div>
            <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-600 border">
              <strong>Disclaimer:</strong> This is a preliminary eligibility assessment only. Final loan approval is subject to lender verification, documentation, and credit checks.
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <Link href="/dashboard"><Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700 h-12">Track Application <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
              <a href={`https://wa.me/919999999999?text=${encodeURIComponent(`Hi, I just submitted ${loanLabel} application (ID: ${result.lead_id.slice(0,8)})`)}`} target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="w-full bg-emerald-600 hover:bg-emerald-700 h-12"><MessageCircle className="mr-2 h-4 w-4" /> WhatsApp Expert</Button>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const steps = ['Basic','Residence','Employment','Income','Loan','Credit','Consent']
  const progress = ((step + 1) / steps.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50">
      <nav className="bg-white border-b sticky top-0 z-30">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <span className="bg-blue-600 text-white rounded-lg w-8 h-8 flex items-center justify-center">L</span>
            <span>Loan<span className="text-blue-600">Laabh</span></span>
          </Link>
          <Link href="/dashboard"><Button variant="ghost" size="sm">Dashboard</Button></Link>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2 text-sm">
            <span className="font-medium text-slate-700">Step {step + 1} of {steps.length}: {steps[step]}</span>
            <span className="text-slate-500">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>{steps[step]}</CardTitle>
            <CardDescription>{step + 1} of 7</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {step === 0 && (
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2"><Label>Full Name *</Label><Input value={form.full_name} onChange={e => update('full_name', e.target.value)} placeholder="As per PAN" /></div>
                <div><Label>Mobile *</Label><Input value={form.mobile} onChange={e => update('mobile', e.target.value.replace(/\D/g,'').slice(0,10))} placeholder="10-digit" /></div>
                <div><Label>PAN</Label><Input value={form.pan} onChange={e => update('pan', e.target.value.toUpperCase().slice(0,10))} placeholder="ABCDE1234F" /></div>
                <div><Label>City</Label><Input value={form.city} onChange={e => update('city', e.target.value)} placeholder="Mumbai" /></div>
                <div><Label>Pincode</Label><Input value={form.pincode} onChange={e => update('pincode', e.target.value.replace(/\D/g,'').slice(0,6))} placeholder="400001" /></div>
                <div className="sm:col-span-2">
                  <Label>City Tier</Label>
                  <Select value={form.city_tier} onValueChange={v => update('city_tier', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Metro">Metro (Mumbai, Delhi, Bangalore, Chennai, etc.)</SelectItem>
                      <SelectItem value="Tier2">Tier-2 (other major cities)</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="sm:col-span-2"><Label>Age *</Label><Input type="number" value={form.age} onChange={e => update('age', e.target.value)} placeholder="30" /></div>
              </div>
            )}
            {step === 1 && (
              <div className="grid gap-3">
                {RESIDENCE.map(r => (
                  <button key={r.value} type="button" onClick={() => update('residence_type', r.value)}
                    className={`p-4 rounded-xl border-2 text-left ${form.residence_type === r.value ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}>
                    <div className="font-semibold">{r.label}</div>
                  </button>
                ))}
              </div>
            )}
            {step === 2 && (
              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-3">
                  {EMPLOYMENT.map(e => (
                    <button key={e.value} type="button" onClick={() => update('employment_type', e.value)}
                      className={`p-4 rounded-xl border-2 text-left ${form.employment_type === e.value ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}>
                      <div className="font-semibold">{e.label}</div>
                    </button>
                  ))}
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div><Label>Company</Label><Input value={form.company_name} onChange={e => update('company_name', e.target.value)} /></div>
                  <div><Label>Designation</Label><Input value={form.designation} onChange={e => update('designation', e.target.value)} /></div>
                  <div><Label>Total Experience (yrs)</Label><Input type="number" step="0.5" value={form.total_experience_years} onChange={e => update('total_experience_years', e.target.value)} /></div>
                  <div><Label>Current Company (yrs)</Label><Input type="number" step="0.5" value={form.current_company_experience_years} onChange={e => update('current_company_experience_years', e.target.value)} /></div>
                  <div className="sm:col-span-2">
                    <Label>Salary Bank</Label>
                    <Select value={form.salary_account_bank} onValueChange={v => update('salary_account_bank', v)}>
                      <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                      <SelectContent>{BANKS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
            {step === 3 && (
              <div className="space-y-4">
                <div><Label>Net Monthly Salary (₹) *</Label><Input type="number" value={form.net_monthly_salary} onChange={e => update('net_monthly_salary', e.target.value)} placeholder="50000" /></div>
                <div><Label>Existing Monthly EMI (₹)</Label><Input type="number" value={form.existing_emi} onChange={e => update('existing_emi', e.target.value)} placeholder="0" /></div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <YesNo label="PF Deducted?" value={form.pf_deducted} onChange={v => update('pf_deducted', v)} />
                  <YesNo label="PT Deducted?" value={form.pt_deducted} onChange={v => update('pt_deducted', v)} />
                </div>
                {Number(form.net_monthly_salary) > 0 && (
                  <div className={`rounded-xl p-4 border-2 ${foir > 65 ? 'bg-amber-50 border-amber-300' : 'bg-emerald-50 border-emerald-200'}`}>
                    <div className="flex items-center gap-2 font-semibold">
                      {foir > 65 ? <AlertTriangle className="h-5 w-5 text-amber-600" /> : <CheckCircle2 className="h-5 w-5 text-emerald-600" />}
                      Your Fixed Obligation to Income Ratio is <span className="text-lg">{foir}%</span>
                    </div>
                    {foir > 65 && <p className="text-sm text-amber-800 mt-2">Your existing obligations are high. We will still try to find the best option for you.</p>}
                  </div>
                )}
              </div>
            )}
            {step === 4 && (
              <div className="space-y-4">
                <Label>Loan Type *</Label>
                <div className="grid sm:grid-cols-2 gap-2">
                  {LOAN_TYPES.map(lt => (
                    <button key={lt.value} type="button" onClick={() => update('loan_type', lt.value)}
                      className={`p-3 rounded-lg border-2 text-left flex items-center gap-3 ${form.loan_type === lt.value ? 'border-blue-600 bg-blue-50' : 'border-slate-200'}`}>
                      <span className="text-2xl">{lt.emoji}</span><span className="font-medium">{lt.label}</span>
                    </button>
                  ))}
                </div>
                <div><Label>Loan Amount (₹) *</Label><Input type="number" value={form.loan_amount} onChange={e => update('loan_amount', e.target.value)} placeholder="500000" /></div>
                <div><Label>Purpose *</Label>
                  <Select value={form.loan_purpose} onValueChange={v => update('loan_purpose', v)}>
                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>{PURPOSE.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
            )}
            {step === 5 && (
              <div className="space-y-4">
                <Label>Credit Profile *</Label>
                <div className="grid gap-2">
                  {CIBIL_BANDS.map(c => (
                    <button key={c.value} type="button" onClick={() => update('credit_band', c.value)}
                      className={`p-3 rounded-lg border-2 text-left ${form.credit_band === c.value ? 'border-blue-600 bg-blue-50' : 'border-slate-200'}`}>{c.label}</button>
                  ))}
                </div>
                <Label className="pt-2">Recent credit enquiries (90 days)? *</Label>
                <div className="grid grid-cols-3 gap-2">
                  {['yes','no','not_sure'].map(v => (
                    <button key={v} type="button" onClick={() => update('recent_enquiries', v)}
                      className={`p-3 rounded-lg border-2 capitalize ${form.recent_enquiries === v ? 'border-blue-600 bg-blue-50' : 'border-slate-200'}`}>{v.replace('_',' ')}</button>
                  ))}
                </div>
                {form.recent_enquiries === 'yes' && (
                  <div><Label>How many enquiries?</Label><Input type="number" min="0" value={form.latest_credit_enquiries_count} onChange={e => update('latest_credit_enquiries_count', e.target.value)} placeholder="2" /></div>
                )}
              </div>
            )}
            {step === 6 && (
              <div className="space-y-4">
                <label className="flex items-start gap-3 p-3 rounded-lg border cursor-pointer hover:bg-slate-50">
                  <Checkbox checked={form.consent_share} onCheckedChange={v => update('consent_share', !!v)} />
                  <span className="text-sm">I agree to share my information with partner banks and NBFCs for loan processing.</span>
                </label>
                <label className="flex items-start gap-3 p-3 rounded-lg border cursor-pointer hover:bg-slate-50">
                  <Checkbox checked={form.consent_terms} onCheckedChange={v => update('consent_terms', !!v)} />
                  <span className="text-sm">I agree to the Terms &amp; Privacy Policy.</span>
                </label>
              </div>
            )}
            {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded text-sm">{error}</div>}
            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => setStep(s => Math.max(s - 1, 0))} disabled={step === 0 || submitting}>
                <ChevronLeft className="mr-1 h-4 w-4" /> Back
              </Button>
              {step < 6 ? (
                <Button onClick={() => setStep(s => Math.min(s + 1, 6))} disabled={!stepValid()} className="bg-blue-600 hover:bg-blue-700">
                  Next <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={submit} disabled={!stepValid() || submitting} className="bg-blue-600 hover:bg-blue-700">
                  {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</> : <><Sparkles className="mr-2 h-4 w-4" /> Check Eligibility</>}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

function YesNo({ label, value, onChange }) {
  return (
    <div>
      <Label className="block mb-2">{label}</Label>
      <div className="flex gap-2">
        <button type="button" onClick={() => onChange(true)} className={`flex-1 py-2 rounded-lg border-2 ${value === true ? 'border-blue-600 bg-blue-50' : 'border-slate-200'}`}>Yes</button>
        <button type="button" onClick={() => onChange(false)} className={`flex-1 py-2 rounded-lg border-2 ${value === false ? 'border-blue-600 bg-blue-50' : 'border-slate-200'}`}>No</button>
      </div>
    </div>
  )
}

function StatBox({ label, value, highlight, colored }) {
  const cls = colored === 'High' ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
    : colored === 'Medium' ? 'text-amber-700 bg-amber-50 border-amber-200'
    : colored === 'Low' ? 'text-red-700 bg-red-50 border-red-200'
    : colored === 'info' ? 'text-blue-700 bg-blue-50 border-blue-200'
    : highlight ? 'text-blue-700 bg-blue-50 border-blue-200' : 'text-slate-700 bg-white border-slate-200'
  return (
    <div className={`rounded-xl border-2 p-4 text-center ${cls}`}>
      <div className="text-xs uppercase tracking-wider opacity-70">{label}</div>
      <div className="text-xl font-bold mt-1">{value}</div>
    </div>
  )
}
