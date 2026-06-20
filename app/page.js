'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getSupabaseBrowser } from '@/lib/supabase-browser'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, CheckCircle2, Shield, Clock, TrendingUp, ChevronDown } from 'lucide-react'

const LOAN_TYPES = [
  { value: 'personal', label: 'Personal Loan', emoji: '💼', desc: 'Wedding, travel, medical, anything' },
  { value: 'business', label: 'Business Loan', emoji: '📈', desc: 'Grow your enterprise' },
  { value: 'home', label: 'Home Loan', emoji: '🏠', desc: 'Buy or build your dream home' },
  { value: 'lap', label: 'Loan Against Property', emoji: '🏢', desc: 'Unlock property value' },
  { value: 'car', label: 'Car Loan', emoji: '🚗', desc: 'New or used vehicle' },
]

const FAQS = [
  { q: 'Will checking eligibility affect my CIBIL score?', a: 'No. We only do a soft enquiry based on the details you provide. Your CIBIL score is not impacted.' },
  { q: 'How is LoanLaabh different from going to a bank directly?', a: 'We compare 15+ lenders for you instantly, match you to the ones most likely to approve, and our experts negotiate the best rate on your behalf — all at zero cost to you.' },
  { q: 'Are you a bank or NBFC?', a: 'No. LoanLaabh is a registered DSA (Direct Selling Agent) marketplace. We connect you with our partner banks and NBFCs who provide the actual loan.' },
  { q: 'Is there any fee?', a: 'Using LoanLaabh is 100% free for borrowers. We get paid by lenders when a loan is successfully disbursed.' },
  { q: 'How long does the process take?', a: 'Pre-qualification is instant (~60 seconds). Final loan disbursal typically takes 24-72 hours depending on the lender and documentation.' },
  { q: 'What documents will I need?', a: 'Typically: PAN, Aadhaar, last 3 months bank statements, last 2 salary slips, and a passport-size photo. Our team will guide you.' },
]

export default function Home() {
  const router = useRouter()
  const [authed, setAuthed] = useState(false)
  useEffect(() => {
    const sb = getSupabaseBrowser()
    sb.auth.getSession().then(({ data }) => setAuthed(!!data.session))
  }, [])

  const startApp = () => router.push(authed ? '/eligibility' : '/login?redirect=/eligibility')

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50">
      <nav className="sticky top-0 z-40 backdrop-blur bg-white/80 border-b border-slate-200">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-slate-900">
            <span className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-lg w-9 h-9 flex items-center justify-center shadow">L</span>
            <span>Loan<span className="text-blue-600">Laabh</span></span>
          </Link>
          <div className="flex items-center gap-3 text-sm">
            {authed ? (
              <Link href="/dashboard"><Button variant="ghost" size="sm">My Dashboard</Button></Link>
            ) : (
              <Link href="/login"><Button variant="ghost" size="sm">Sign in</Button></Link>
            )}
            <Button size="sm" onClick={startApp} className="bg-blue-600 hover:bg-blue-700">Check Eligibility</Button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="container mx-auto px-4 pt-12 pb-16 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <Badge className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-100">🇮🇳 India&apos;s smartest loan marketplace</Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 leading-tight tracking-tight">
            Get pre-qualified for a loan in <span className="text-blue-600">60 seconds</span>.
          </h1>
          <p className="mt-5 text-lg text-slate-600 max-w-xl">
            Personal, business, home, LAP &amp; car loans. We compare 15+ lenders and match you instantly — without affecting your credit score.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Button size="lg" onClick={startApp} className="text-base h-12 px-8 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200">
              Check Your Loan Eligibility <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-slate-600">
            <div className="flex items-center gap-2"><Shield className="h-4 w-4 text-emerald-600" /> 100% Free</div>
            <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-emerald-600" /> 60-sec form</div>
            <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> No CIBIL hit</div>
          </div>
        </div>
        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 blur-3xl rounded-full" />
          <img src="https://images.unsplash.com/photo-1580893246395-52aead8960dc?auto=format&fit=crop&w=900&q=80" alt="" className="relative rounded-2xl shadow-2xl w-full object-cover aspect-[4/3]" />
          <Card className="absolute -bottom-6 -left-6 shadow-xl border-blue-100 hidden md:block bg-white">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="bg-emerald-100 text-emerald-700 rounded-full w-10 h-10 flex items-center justify-center"><TrendingUp className="h-5 w-5" /></div>
              <div>
                <div className="text-xs text-slate-500">Lowest rate found</div>
                <div className="font-bold text-slate-900">8.40% p.a.</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* TRUST BADGES */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { n: '15+', l: 'Partner Lenders' },
            { n: '5', l: 'Loan Types' },
            { n: '60s', l: 'Pre-qualification' },
            { n: '₹1.5Cr', l: 'Max Loan' },
          ].map((s, i) => (
            <Card key={i} className="text-center"><CardContent className="py-6">
              <div className="text-3xl font-bold text-blue-600">{s.n}</div>
              <div className="text-sm text-slate-600 mt-1">{s.l}</div>
            </CardContent></Card>
          ))}
        </div>
      </section>

      {/* LOAN TYPES */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-center text-slate-900 mb-2">Whatever you need, we&apos;ve got you</h2>
        <p className="text-center text-slate-600 mb-10">5 loan types. 15+ lenders. One smart match.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {LOAN_TYPES.map(lt => (
            <Card key={lt.value} className="hover:shadow-xl transition cursor-pointer hover:-translate-y-1 duration-200" onClick={startApp}>
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-3">{lt.emoji}</div>
                <div className="font-semibold text-slate-900">{lt.label}</div>
                <div className="text-xs text-slate-500 mt-1">{lt.desc}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-center text-slate-900 mb-10">How LoanLaabh works</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { n: 1, t: 'Sign in & fill 60-sec form', d: 'Verify your email with OTP, then tell us about your loan need.' },
            { n: 2, t: 'AI matches lenders', d: 'GPT-4o + our rule engine screen 15+ lenders by your CIBIL, income, FOIR and policy.' },
            { n: 3, t: 'Get pre-qualified', d: 'See your eligible amount &amp; approval probability — our experts handle the rest.' },
          ].map(s => (
            <Card key={s.n}><CardContent className="p-6">
              <div className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold">{s.n}</div>
              <h3 className="font-semibold text-xl mt-4">{s.t}</h3>
              <p className="text-slate-600 mt-2">{s.d}</p>
            </CardContent></Card>
          ))}
        </div>
        <div className="text-center mt-10">
          <Button size="lg" onClick={startApp} className="bg-blue-600 hover:bg-blue-700 h-12 px-8">Check Your Loan Eligibility <ArrowRight className="ml-2" /></Button>
        </div>
      </section>

      {/* FAQ */}
      <section className="container mx-auto px-4 py-12 max-w-3xl">
        <h2 className="text-3xl font-bold text-center text-slate-900 mb-10">Frequently asked questions</h2>
        <div className="space-y-3">{FAQS.map((f, i) => <FaqItem key={i} q={f.q} a={f.a} />)}</div>
      </section>

      <footer className="bg-slate-900 text-slate-300 py-12 mt-12">
        <div className="container mx-auto px-4 grid md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 font-bold text-xl text-white">
              <span className="bg-blue-600 rounded-lg w-9 h-9 flex items-center justify-center">L</span>
              LoanLaabh
            </div>
            <p className="mt-3 text-sm">India&apos;s smartest loan marketplace. Pre-qualify instantly with 15+ lenders.</p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Loan Types</h4>
            <ul className="space-y-2 text-sm">{LOAN_TYPES.map(lt => <li key={lt.value}>{lt.label}</li>)}</ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Important</h4>
            <p className="text-xs leading-relaxed">LoanLaabh is a DSA (Direct Selling Agent) marketplace and does NOT directly disburse loans. All loans are provided by our partner banks and NBFCs, subject to their credit policies, verification and approval. Interest rates and processing fees are determined by the lender.</p>
          </div>
        </div>
        <div className="text-center text-xs text-slate-500 mt-8 pt-6 border-t border-slate-800">© 2026 LoanLaabh. All rights reserved.</div>
      </footer>
    </div>
  )
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="bg-white rounded-lg border">
      <button onClick={() => setOpen(!open)} className="w-full p-4 flex justify-between items-center text-left">
        <span className="font-medium text-slate-900">{q}</span>
        <ChevronDown className={`h-4 w-4 text-slate-500 transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="px-4 pb-4 text-sm text-slate-600">{a}</div>}
    </div>
  )
}
