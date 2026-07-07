import Link from 'next/link'
import Navbar from '@/components/site/navbar'
import Footer from '@/components/site/footer'
import { Button } from '@/components/ui/button'
import { ArrowRight, CheckCircle2, Gauge, CalendarClock, PieChart, Layers, SearchCheck, TrendingUp, MessageCircle } from 'lucide-react'

export const metadata = {
  title: 'CIBIL Score Guide — Check, Understand & Improve | LoanLaabh',
  description: 'Everything about your CIBIL score: what it is, score ranges, factors that affect it, how to improve it, and the scores lenders look for.',
}

const WHATSAPP_URL = 'https://wa.me/917770024242'

const BANDS = [
  { range: '300 – 549', label: 'Poor', color: 'bg-red-500', text: 'text-red-600', bg: 'bg-red-50 border-red-100', desc: 'Loan approval is difficult. Focus on repairing your credit history first.' },
  { range: '550 – 649', label: 'Average', color: 'bg-amber-500', text: 'text-amber-600', bg: 'bg-amber-50 border-amber-100', desc: 'Limited options. Some NBFCs may approve at higher interest rates.' },
  { range: '650 – 749', label: 'Good', color: 'bg-blue-500', text: 'text-blue-600', bg: 'bg-blue-50 border-blue-100', desc: 'Most lenders will consider you. Decent rates and loan amounts.' },
  { range: '750 – 900', label: 'Excellent', color: 'bg-emerald-500', text: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100', desc: 'Best approval chances, lowest interest rates, highest loan amounts.' },
]

const FACTORS = [
  { icon: CalendarClock, title: 'Payment History', weight: '~35%', desc: 'On-time EMI and credit card payments matter the most. Even one missed payment can hurt.' },
  { icon: PieChart, title: 'Credit Utilization', weight: '~30%', desc: 'Using more than 30% of your credit card limit regularly signals credit hunger.' },
  { icon: CalendarClock, title: 'Credit Age', weight: '~15%', desc: 'Older accounts build trust. Avoid closing your oldest credit card.' },
  { icon: Layers, title: 'Credit Mix', weight: '~10%', desc: 'A healthy mix of secured (home/car) and unsecured (personal/card) credit helps.' },
  { icon: SearchCheck, title: 'Hard Enquiries', weight: '~10%', desc: 'Every loan application triggers a hard enquiry. Too many in a short time lowers your score.' },
]

const IMPROVE_TIPS = [
  'Pay every EMI and credit card bill on or before the due date',
  'Keep credit card utilization below 30% of your limit',
  'Do not apply to multiple lenders at once — use LoanLaabh to match first',
  'Keep old credit cards active, even with small usage',
  'Check your credit report for errors and raise disputes promptly',
  'Maintain a healthy mix of secured and unsecured loans',
]

const LOAN_SCORES = [
  { type: 'Personal Loan', score: '700+', note: 'Unsecured, so lenders prefer higher scores' },
  { type: 'Home Loan', score: '650+', note: 'Property acts as security, slightly flexible' },
  { type: 'Business Loan', score: '700+', note: 'Business vintage and turnover also matter' },
  { type: 'Loan Against Property', score: '650+', note: 'Secured by property value' },
  { type: 'Used Car Loan', score: '650+', note: 'Vehicle acts as collateral' },
  { type: 'Credit Card', score: '720+', note: 'Higher score unlocks premium cards' },
]

export default function CibilScorePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0A1628] via-[#0E2240] to-[#123A6E]">
        <div className="absolute inset-0 fm-matrix-grid" />
        <div className="container mx-auto px-4 relative py-16 md:py-24 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-4 py-1.5 text-sm text-blue-100 mb-6">
              <Gauge className="h-4 w-4 text-[#5B9BF3]" /> CIBIL Score Guide
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight tracking-tight">
              Know Your CIBIL Score. <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5B9BF3] to-[#8BC0FF]">Borrow with Confidence.</span>
            </h1>
            <p className="mt-5 text-lg text-slate-300 max-w-xl leading-relaxed">
              Your CIBIL score decides which lenders say yes. Understand it, improve it, and let FinMatrix AI™ find lenders that fit your score band — without unnecessary enquiries.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link href="/eligibility">
                <Button size="lg" className="w-full sm:w-auto h-12 px-8 text-base font-semibold bg-[#1A6FE8] hover:bg-[#1559c4] rounded-lg shadow-xl shadow-blue-900/40">
                  Check My Loan Eligibility Free <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
            <div className="mt-6 flex items-center gap-2 text-sm text-slate-300">
              <CheckCircle2 className="h-4 w-4 text-[#22C55E]" /> Basic eligibility checks do not impact your CIBIL score
            </div>
          </div>
          <div className="relative hidden lg:block">
            <div className="absolute -inset-4 bg-[#1A6FE8]/20 blur-3xl rounded-full" />
            <img src="https://images.unsplash.com/photo-1651126433991-11dda0eb78ff?auto=format&fit=crop&w=900&q=80" alt="Credit score dashboard on mobile" className="relative rounded-2xl shadow-2xl w-full object-cover aspect-[4/3] border border-white/10" />
          </div>
        </div>
      </section>

      {/* What is CIBIL */}
      <section id="what" className="py-16 md:py-24 scroll-mt-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-[#0A1628] tracking-tight">What is a CIBIL Score?</h2>
          <p className="mt-4 text-[#64748B] leading-relaxed text-lg">
            Your CIBIL score is a 3-digit number between <strong className="text-[#0A1628]">300 and 900</strong> that summarizes your credit history — how you have handled loans and credit cards in the past. It is prepared by TransUnion CIBIL, India&apos;s leading credit bureau, and is the first thing most banks and NBFCs check when you apply for a loan.
          </p>
          <p className="mt-3 text-[#64748B] leading-relaxed text-lg">
            The higher your score, the more lenders trust you — which means faster approvals, higher loan amounts, and lower interest rates.
          </p>
        </div>
      </section>

      {/* Score Range */}
      <section id="range" className="py-16 md:py-24 bg-[#F8FAFC] scroll-mt-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-3xl font-bold text-[#0A1628] tracking-tight text-center">CIBIL Score Range Explained</h2>
          <div className="mt-10 h-3 rounded-full bg-gradient-to-r from-red-500 via-amber-400 via-blue-500 to-emerald-500" />
          <div className="flex justify-between text-xs text-[#64748B] mt-2 px-1 font-medium"><span>300</span><span>550</span><span>650</span><span>750</span><span>900</span></div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-8">
            {BANDS.map((b) => (
              <div key={b.label} className={`rounded-xl border p-6 fm-card-shadow ${b.bg}`}>
                <div className={`inline-flex items-center gap-2 font-bold ${b.text}`}>
                  <span className={`w-3 h-3 rounded-full ${b.color}`} /> {b.label}
                </div>
                <div className="text-2xl font-extrabold text-[#0A1628] mt-2">{b.range}</div>
                <p className="text-sm text-[#64748B] mt-2 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Factors */}
      <section id="factors" className="py-16 md:py-24 scroll-mt-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-3xl font-bold text-[#0A1628] tracking-tight text-center">What Affects Your CIBIL Score?</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-10">
            {FACTORS.map((f) => (
              <div key={f.title} className="bg-white rounded-xl border border-slate-100 fm-card-shadow fm-card-shadow-hover p-6">
                <div className="flex items-center justify-between">
                  <div className="bg-blue-50 text-[#1A6FE8] rounded-xl w-11 h-11 flex items-center justify-center"><f.icon className="h-5 w-5" /></div>
                  <span className="text-sm font-bold text-[#1A6FE8] bg-blue-50 rounded-full px-3 py-1">{f.weight}</span>
                </div>
                <h3 className="font-bold text-[#0A1628] mt-4">{f.title}</h3>
                <p className="text-sm text-[#64748B] mt-2 leading-relaxed">{f.desc}</p>
              </div>
            ))}
            <div className="bg-gradient-to-br from-[#0A1628] to-[#123A6E] rounded-xl p-6 flex flex-col justify-center text-white">
              <TrendingUp className="h-8 w-8 text-[#5B9BF3] mb-3" />
              <h3 className="font-bold">Not sure where you stand?</h3>
              <p className="text-slate-300 mt-1.5 text-sm">FinMatrix AI™ works with your score band — no exact score needed.</p>
              <Link href="/eligibility"><Button size="sm" className="mt-4 bg-[#1A6FE8] hover:bg-[#1559c4] rounded-lg font-semibold w-fit">Check Eligibility <ArrowRight className="ml-1.5 h-4 w-4" /></Button></Link>
            </div>
          </div>
        </div>
      </section>

      {/* Improve */}
      <section id="improve" className="py-16 md:py-24 bg-[#F8FAFC] scroll-mt-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-[#0A1628] tracking-tight text-center">How to Improve Your CIBIL Score</h2>
          <p className="text-center text-[#64748B] mt-3">Consistent habits over 3–6 months can meaningfully lift your score.</p>
          <div className="mt-10 space-y-3">
            {IMPROVE_TIPS.map((tip, i) => (
              <div key={i} className="flex items-start gap-3.5 bg-white rounded-xl border border-slate-100 fm-card-shadow p-5">
                <span className="bg-emerald-50 text-[#22C55E] rounded-lg w-8 h-8 flex items-center justify-center shrink-0 font-bold text-sm">{i + 1}</span>
                <span className="text-[#0A1628] font-medium pt-1">{tip}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Score for loans */}
      <section id="loans" className="py-16 md:py-24 scroll-mt-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-[#0A1628] tracking-tight text-center">CIBIL Score Lenders Typically Look For</h2>
          <div className="mt-10 bg-white rounded-xl border border-slate-100 fm-card-shadow overflow-hidden">
            <div className="grid grid-cols-3 bg-[#0A1628] text-white text-sm font-semibold px-6 py-4">
              <span>Loan Type</span><span className="text-center">Preferred Score</span><span className="text-right hidden sm:block">Note</span>
            </div>
            {LOAN_SCORES.map((l, i) => (
              <div key={l.type} className={`grid grid-cols-3 items-center px-6 py-4 text-sm ${i % 2 ? 'bg-[#F8FAFC]' : 'bg-white'}`}>
                <span className="font-semibold text-[#0A1628]">{l.type}</span>
                <span className="text-center font-bold text-[#1A6FE8]">{l.score}</span>
                <span className="text-right text-[#64748B] hidden sm:block">{l.note}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-[#64748B] mt-4 text-center">Indicative ranges only. Each lender applies its own credit policy — FinMatrix AI™ matches you against actual lender criteria.</p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-[#0A1628] via-[#0E2240] to-[#123A6E] relative overflow-hidden">
        <div className="absolute inset-0 fm-matrix-grid" />
        <div className="container mx-auto px-4 relative text-center max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">Protect Your Score. Match Before You Apply.</h2>
          <p className="mt-4 text-slate-300">FinMatrix AI™ finds lenders suited to your score band — so you avoid rejections and unnecessary hard enquiries.</p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/eligibility"><Button size="lg" className="h-12 px-8 font-semibold bg-[#1A6FE8] hover:bg-[#1559c4] rounded-lg">Find My Loan Match <ArrowRight className="ml-2 h-5 w-5" /></Button></Link>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer"><Button size="lg" variant="outline" className="h-12 px-8 font-semibold rounded-lg border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"><MessageCircle className="mr-2 h-5 w-5" /> Talk to an Advisor</Button></a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
