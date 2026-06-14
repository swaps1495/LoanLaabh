'use client'
import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { ArrowRight, CheckCircle2, Sparkles, Shield, Clock, TrendingUp, Loader2, ChevronLeft, MessageCircle, AlertTriangle } from 'lucide-react'

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

const WHATSAPP_NUMBER = '919999999999' // update with real number

const fmtINR = (n) => '₹' + Number(n || 0).toLocaleString('en-IN')

export default function App() {
  const [view, setView] = useState('landing')
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [form, setForm] = useState({
    full_name: '', mobile: '', pan: '', city: '', pincode: '', age: '',
    residence_type: '',
    employment_type: '', company_name: '', designation: '',
    total_experience_years: '', current_company_experience_years: '', salary_account_bank: '',
    net_monthly_salary: '', existing_emi: '', pf_deducted: null, pt_deducted: null,
    loan_type: '', loan_amount: '', loan_purpose: '',
    credit_band: '', recent_enquiries: '',
    consent_share: false, consent_terms: false,
  })
  const update = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const foir = useMemo(() => {
    const s = Number(form.net_monthly_salary || 0)
    const e = Number(form.existing_emi || 0)
    if (!s) return 0
    return Math.round((e / s) * 10000) / 100
  }, [form.net_monthly_salary, form.existing_emi])

  const start = () => { setView('form'); setStep(0); setResult(null); setError(null) }

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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Submission failed')
      setResult(data); setView('result')
    } catch (e) { setError(e.message) } finally { setSubmitting(false) }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50">
      <nav className="sticky top-0 z-40 backdrop-blur bg-white/80 border-b border-slate-200">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => setView('landing')} className="flex items-center gap-2 font-bold text-xl text-slate-900">
            <span className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-lg w-9 h-9 flex items-center justify-center">L</span>
            <span>Loan<span className="text-blue-600">Laabh</span></span>
          </button>
          <a href="/admin" className="text-sm text-slate-500 hover:text-slate-900">Admin</a>
        </div>
      </nav>

      {view === 'landing' && <Landing onStart={start} />}
      {view === 'form' && (
        <FormView form={form} update={update} step={step} setStep={setStep} foir={foir}
          next={() => setStep(s => Math.min(s+1,6))} back={() => setStep(s => Math.max(s-1,0))}
          stepValid={stepValid()} submit={submit} submitting={submitting} error={error} />
      )}
      {view === 'result' && result && <ResultPage data={result} onRestart={start} />}

      <footer className="py-8 text-center text-xs text-slate-500">
        LoanLaabh is a DSA partner platform. We do not disburse loans directly. © 2025
      </footer>
    </div>
  )
}

function Landing({ onStart }) {
  return (
    <main>
      <section className="container mx-auto px-4 pt-12 pb-16 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <Badge className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-100">🇮🇳 India&apos;s smartest pre-qualification platform</Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 leading-tight tracking-tight">
            Check your loan eligibility in <span className="text-blue-600">60 seconds</span>.
          </h1>
          <p className="mt-5 text-lg text-slate-600 max-w-xl">
            Get pre-qualified for Personal, Business, Home, LAP & Car loans. Know your eligible amount, approval chances & next steps — without affecting your credit score.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Button size="lg" onClick={onStart} className="text-base h-12 px-8 bg-blue-600 hover:bg-blue-700">
              Check Your Loan Eligibility <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
          <div className="mt-8 flex items-center gap-6 text-sm text-slate-600">
            <div className="flex items-center gap-2"><Shield className="h-4 w-4 text-emerald-600" /> 100% Free</div>
            <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-emerald-600" /> 60-sec form</div>
            <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> No CIBIL hit</div>
          </div>
        </div>
        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 blur-3xl rounded-full" />
          <img src="https://images.unsplash.com/photo-1580893246395-52aead8960dc?auto=format&fit=crop&w=900&q=80" alt="Loan partnership" className="relative rounded-2xl shadow-2xl w-full object-cover aspect-[4/3]" />
        </div>
      </section>

      <section className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[{n:'15+',l:'Partner Lenders'},{n:'5',l:'Loan Types'},{n:'60s',l:'Avg. Pre-Qual'},{n:'₹1.5Cr',l:'Max Loan'}].map((s,i) => (
            <Card key={i} className="text-center"><CardContent className="py-6">
              <div className="text-3xl font-bold text-blue-600">{s.n}</div>
              <div className="text-sm text-slate-600 mt-1">{s.l}</div>
            </CardContent></Card>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-center text-slate-900 mb-2">All loan types, one platform</h2>
        <p className="text-center text-slate-600 mb-10">We pre-qualify you with our partner banks & NBFCs in seconds.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {LOAN_TYPES.map(lt => (
            <Card key={lt.value} className="hover:shadow-lg transition cursor-pointer hover:-translate-y-1 duration-200" onClick={onStart}>
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-3">{lt.emoji}</div>
                <div className="font-semibold text-slate-900">{lt.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-center text-slate-900 mb-10">How it works</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { n:1, t:'Fill 60-sec form', d:'Tell us about your income, work & loan requirement.' },
            { n:2, t:'AI runs eligibility', d:'Our engine + GPT-4o screen 15+ lenders & assess your profile.' },
            { n:3, t:'Get pre-qualified', d:'See your eligible amount & approval chances instantly.' },
          ].map(s => (
            <Card key={s.n}><CardContent className="p-6">
              <div className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold">{s.n}</div>
              <h3 className="font-semibold text-xl mt-4">{s.t}</h3>
              <p className="text-slate-600 mt-2">{s.d}</p>
            </CardContent></Card>
          ))}
        </div>
        <div className="text-center mt-10">
          <Button size="lg" onClick={onStart} className="bg-blue-600 hover:bg-blue-700 h-12 px-8">
            Check Your Loan Eligibility <ArrowRight className="ml-2" />
          </Button>
        </div>
      </section>
    </main>
  )
}

function FormView({ form, update, step, foir, next, back, stepValid, submit, submitting, error }) {
  const steps = ['Basic Details','Residence','Employment','Income & Obligations','Loan Requirement','Credit Profile','Consent']
  const progress = ((step + 1) / steps.length) * 100

  return (
    <main className="container mx-auto px-4 py-10 max-w-2xl">
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
          <CardDescription>Step {step+1} of 7</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 0 && (
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2"><Label>Full Name *</Label><Input value={form.full_name} onChange={e => update('full_name', e.target.value)} placeholder="As per PAN" /></div>
              <div><Label>Mobile Number *</Label><Input value={form.mobile} onChange={e => update('mobile', e.target.value.replace(/\D/g,'').slice(0,10))} placeholder="10-digit" /></div>
              <div><Label>PAN Number</Label><Input value={form.pan} onChange={e => update('pan', e.target.value.toUpperCase().slice(0,10))} placeholder="ABCDE1234F" /></div>
              <div><Label>City</Label><Input value={form.city} onChange={e => update('city', e.target.value)} placeholder="Mumbai" /></div>
              <div><Label>Pincode</Label><Input value={form.pincode} onChange={e => update('pincode', e.target.value.replace(/\D/g,'').slice(0,6))} placeholder="400001" /></div>
              <div className="sm:col-span-2"><Label>Age *</Label><Input type="number" value={form.age} onChange={e => update('age', e.target.value)} placeholder="30" /></div>
            </div>
          )}

          {step === 1 && (
            <div className="grid gap-3">
              <Label>Residence Type *</Label>
              {RESIDENCE.map(r => (
                <button key={r.value} type="button" onClick={() => update('residence_type', r.value)}
                  className={`p-4 rounded-xl border-2 text-left transition ${form.residence_type === r.value ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}>
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
                <div><Label>Company Name</Label><Input value={form.company_name} onChange={e => update('company_name', e.target.value)} /></div>
                <div><Label>Designation</Label><Input value={form.designation} onChange={e => update('designation', e.target.value)} /></div>
                <div><Label>Total Work Experience (years)</Label><Input type="number" step="0.5" value={form.total_experience_years} onChange={e => update('total_experience_years', e.target.value)} /></div>
                <div><Label>Current Company (years)</Label><Input type="number" step="0.5" value={form.current_company_experience_years} onChange={e => update('current_company_experience_years', e.target.value)} /></div>
                <div className="sm:col-span-2">
                  <Label>Salary Account Bank</Label>
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
              <div><Label>Net Monthly In-Hand Salary (₹) *</Label><Input type="number" value={form.net_monthly_salary} onChange={e => update('net_monthly_salary', e.target.value)} placeholder="50000" /></div>
              <div><Label>Existing Monthly EMI Obligations (₹)</Label><Input type="number" value={form.existing_emi} onChange={e => update('existing_emi', e.target.value)} placeholder="0" /></div>
              <div className="grid sm:grid-cols-2 gap-4">
                <YesNo label="PF Deducted from Salary?" value={form.pf_deducted} onChange={v => update('pf_deducted', v)} />
                <YesNo label="PT Deducted from Salary?" value={form.pt_deducted} onChange={v => update('pt_deducted', v)} />
              </div>
              {Number(form.net_monthly_salary) > 0 && (
                <div className={`rounded-xl p-4 border-2 ${foir > 65 ? 'bg-amber-50 border-amber-300' : 'bg-emerald-50 border-emerald-200'}`}>
                  <div className="flex items-center gap-2 font-semibold">
                    {foir > 65 ? <AlertTriangle className="h-5 w-5 text-amber-600" /> : <CheckCircle2 className="h-5 w-5 text-emerald-600" />}
                    Your current Fixed Obligation to Income Ratio is <span className="text-lg">{foir}%</span>
                  </div>
                  {foir > 65 && (
                    <p className="text-sm text-amber-800 mt-2">Your existing obligations are high. This may affect your loan eligibility. We will still try to find the best option for you.</p>
                  )}
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
              <div><Label>Loan Amount Required (₹) *</Label><Input type="number" value={form.loan_amount} onChange={e => update('loan_amount', e.target.value)} placeholder="500000" /></div>
              <div><Label>Loan Purpose *</Label>
                <Select value={form.loan_purpose} onValueChange={v => update('loan_purpose', v)}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>{PURPOSE.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <Label>How would you rate your credit profile? *</Label>
              <div className="grid gap-2">
                {CIBIL_BANDS.map(c => (
                  <button key={c.value} type="button" onClick={() => update('credit_band', c.value)}
                    className={`p-3 rounded-lg border-2 text-left ${form.credit_band === c.value ? 'border-blue-600 bg-blue-50' : 'border-slate-200'}`}>
                    {c.label}
                  </button>
                ))}
              </div>
              <Label className="pt-2">Applied for any loan/card in last 3 months? *</Label>
              <div className="grid grid-cols-3 gap-2">
                {['yes','no','not_sure'].map(v => (
                  <button key={v} type="button" onClick={() => update('recent_enquiries', v)}
                    className={`p-3 rounded-lg border-2 capitalize ${form.recent_enquiries === v ? 'border-blue-600 bg-blue-50' : 'border-slate-200'}`}>{v.replace('_',' ')}</button>
                ))}
              </div>
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
            <Button variant="outline" onClick={back} disabled={step === 0 || submitting}><ChevronLeft className="mr-1 h-4 w-4" /> Back</Button>
            {step < 6 ? (
              <Button onClick={next} disabled={!stepValid} className="bg-blue-600 hover:bg-blue-700">Next <ArrowRight className="ml-1 h-4 w-4" /></Button>
            ) : (
              <Button onClick={submit} disabled={!stepValid || submitting} className="bg-blue-600 hover:bg-blue-700">
                {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</> : <><Sparkles className="mr-2 h-4 w-4" /> Check Eligibility</>}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </main>
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

function ResultPage({ data, onRestart }) {
  const loanLabel = LOAN_TYPES.find(l => l.value === data.loan_type)?.label || 'Loan'
  const isPreQualified = data.pre_qualified
  const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hi, I just checked my eligibility on LoanLaabh (Lead ID: ${data.lead_id}). I want to continue my ${loanLabel} application.`)}`

  return (
    <main className="container mx-auto px-4 py-10 max-w-2xl">
      <Card className="shadow-2xl border-2 border-blue-100 overflow-hidden">
        <div className={`p-8 text-center text-white ${isPreQualified ? 'bg-gradient-to-br from-blue-600 to-indigo-600' : 'bg-gradient-to-br from-slate-700 to-slate-900'}`}>
          <div className="text-5xl mb-3">{isPreQualified ? '🎉' : '📋'}</div>
          <h1 className="text-3xl md:text-4xl font-bold">Congratulations {data.first_name}!</h1>
          <p className="mt-3 text-lg opacity-95">
            {isPreQualified
              ? `Based on your profile, you are pre-qualified for a ${loanLabel}.`
              : `We've assessed your profile for a ${loanLabel}. Let's connect you with a loan expert.`}
          </p>
        </div>
        <CardContent className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatBox label="Estimated Eligible Amount" value={fmtINR(data.estimated_eligible_amount)} highlight />
            <StatBox label="Approval Chances" value={data.approval_probability || 'Medium'} colored={data.approval_probability} />
            <StatBox label="Application Status" value={isPreQualified ? 'Pre-Approved' : 'Under Review'} colored="info" />
          </div>

          <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-600 border">
            <p><strong>Disclaimer:</strong> This is a preliminary eligibility assessment only. Final loan approval is subject to lender verification, documentation, and credit checks.</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 h-12" onClick={() => alert('Our loan expert will contact you shortly!')}>
              Continue Application <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="w-full bg-emerald-600 hover:bg-emerald-700 h-12">
                <MessageCircle className="mr-2 h-4 w-4" /> Talk to Loan Expert on WhatsApp
              </Button>
            </a>
          </div>

          <div className="text-center pt-4">
            <button onClick={onRestart} className="text-sm text-slate-500 underline">Start a new check</button>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}

function StatBox({ label, value, highlight, colored }) {
  const colorClass = colored === 'High' ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
    : colored === 'Medium' ? 'text-amber-700 bg-amber-50 border-amber-200'
    : colored === 'Low' ? 'text-red-700 bg-red-50 border-red-200'
    : colored === 'info' ? 'text-blue-700 bg-blue-50 border-blue-200'
    : highlight ? 'text-blue-700 bg-blue-50 border-blue-200'
    : 'text-slate-700 bg-white border-slate-200'
  return (
    <div className={`rounded-xl border-2 p-4 text-center ${colorClass}`}>
      <div className="text-xs uppercase tracking-wider opacity-70">{label}</div>
      <div className="text-xl font-bold mt-1">{value}</div>
    </div>
  )
}
