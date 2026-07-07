'use client'
import Link from 'next/link'
import Navbar from '@/components/site/navbar'
import Footer from '@/components/site/footer'
import { Button } from '@/components/ui/button'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import {
  ArrowRight, CheckCircle2, ShieldCheck, Lock, BadgeCheck, Sparkles,
  Ban, TrendingDown, HelpCircle, Shuffle,
  Brain, Eye, Landmark, Activity, HeartHandshake, ShieldAlert,
  Briefcase, TrendingUp, Home as HomeIcon, Building2, Car, RefreshCcw, LineChart,
  FileSearch, ListChecks, Target, Compass,
  BookOpen, Scale, MessageCircle, User, Cpu, GitCompareArrows, ThumbsUp,
} from 'lucide-react'

const WHATSAPP_URL = 'https://wa.me/919999999999'

const TRUST_BADGES = [
  { icon: BadgeCheck, label: 'Free Eligibility Check' },
  { icon: Cpu, label: 'AI-Powered Lender Matching' },
  { icon: Lock, label: 'Secure & Encrypted' },
  { icon: ShieldCheck, label: 'DSA Partner Platform' },
]

const PROBLEMS = [
  { icon: Shuffle, title: 'Different Rules Everywhere', desc: 'Different lenders have different approval rules.' },
  { icon: Ban, title: 'Rejections Cause Delays', desc: 'A rejected application can delay your financial plans.' },
  { icon: HelpCircle, title: 'No Eligibility Clarity', desc: "Customers often don't know where they are eligible." },
  { icon: TrendingDown, title: 'CIBIL Score Drops', desc: 'Unnecessary inquiries can drop your CIBIL score.' },
  { icon: FileSearch, title: 'Random Applications', desc: 'Traditional agents may send applications randomly.' },
]

const TIMELINE = [
  { icon: User, title: 'Tell us about yourself' },
  { icon: Brain, title: 'FinMatrix AI\u2122 analyzes your profile' },
  { icon: GitCompareArrows, title: 'Compares lender policies' },
  { icon: ListChecks, title: 'Shows suitable loan matches' },
  { icon: ThumbsUp, title: 'Apply with confidence' },
]

const FM_PARAMS = [
  'Income', 'Employment Type', 'Salary Mode', 'Company Category',
  'CIBIL Score Band', 'Existing EMI', 'FOIR', 'City',
  'Age', 'Loan Amount', 'Lender Eligibility Rules',
]

const WHY_US = [
  { icon: Brain, title: 'AI-Powered Loan Matching', desc: 'Find lenders based on your profile, not guesswork.' },
  { icon: Eye, title: 'Transparent Eligibility Insights', desc: 'Understand why a lender may suit your profile.' },
  { icon: Landmark, title: 'Multiple Lending Partners', desc: 'Access loan options across banks and NBFCs.' },
  { icon: Activity, title: 'Application Tracking', desc: 'Track every stage of your application in one place.' },
  { icon: HeartHandshake, title: 'Expert Guidance', desc: 'Talk to a LoanLaabh advisor whenever you need help.' },
  { icon: ShieldAlert, title: 'No False Promises', desc: 'We believe in clarity, not unrealistic guarantees.' },
]

const PRODUCTS = [
  { icon: Briefcase, title: 'Personal Loan', desc: 'Quick financing for salaried professionals.' },
  { icon: TrendingUp, title: 'Business Loan', desc: 'Funding for business growth and working capital.' },
  { icon: HomeIcon, title: 'Home Loan', desc: 'Purchase, construction, and refinancing options.' },
  { icon: Building2, title: 'Loan Against Property', desc: 'Unlock the value of your property.' },
  { icon: Car, title: 'Used Car Loan', desc: 'Finance for pre-owned vehicles.' },
  { icon: RefreshCcw, title: 'Balance Transfer', desc: 'Transfer your existing loan to explore better terms.' },
  { icon: LineChart, title: 'Credit Improvement Guidance', desc: 'Resources to strengthen your credit profile.' },
]

const PROCESS = [
  { icon: FileSearch, title: 'Profile Analysis', desc: 'Understand your financial profile.' },
  { icon: ListChecks, title: 'Eligibility Intelligence', desc: 'Compare your details with lender criteria.' },
  { icon: Target, title: 'Suitability Matching', desc: 'Identify lenders aligned with your profile.' },
  { icon: Compass, title: 'Guided Application', desc: 'Proceed with confidence and support.' },
]

const INSIGHTS = [
  { tag: 'Credit Score', title: 'How to Improve Your CIBIL Score' },
  { tag: 'Eligibility', title: 'Understanding FOIR and Why It Matters' },
  { tag: 'Banking', title: 'How Banks Evaluate Loan Applications' },
  { tag: 'Approvals', title: 'Common Reasons for Loan Rejection' },
  { tag: 'Planning', title: 'Salary Required for Different Loan Amounts' },
  { tag: 'Guides', title: 'How to Choose the Right Loan Type' },
]

const TRUST_CARDS = [
  { icon: Lock, title: 'Secure Data Handling', desc: 'Your information is protected and shared only as needed.' },
  { icon: Eye, title: 'Transparent Process', desc: 'No hidden eligibility charges.' },
  { icon: HeartHandshake, title: 'Responsible Matching', desc: 'We help you discover suitable options, not make approval promises.' },
  { icon: Scale, title: 'Compliance', desc: 'LoanLaabh is a DSA partner platform. We do not lend money directly.' },
]

const FAQS = [
  { q: 'Does LoanLaabh provide loans directly?', a: 'No. LoanLaabh is a DSA partner platform. We help you discover suitable lenders based on your profile. Loans are disbursed directly by the lending institution.' },
  { q: 'Is the eligibility check free?', a: 'Yes. Checking your eligibility on LoanLaabh is completely free.' },
  { q: 'Will checking eligibility affect my CIBIL score?', a: 'Basic eligibility checks on LoanLaabh do not impact your CIBIL score. If you proceed with a lender application, the lender may perform a credit bureau check as part of their own process.' },
  { q: 'How does FinMatrix AI\u2122 work?', a: 'FinMatrix AI\u2122 evaluates your profile across multiple eligibility parameters such as income, employment, city, CIBIL score band, and existing obligations, and compares them with lender criteria to identify suitable loan options.' },
  { q: 'Is loan approval guaranteed?', a: "No. LoanLaabh helps you discover suitable lenders based on your profile. Final approval depends on the lender's internal policies, documentation, and credit assessment." },
  { q: 'How does LoanLaabh earn revenue?', a: 'LoanLaabh earns a referral fee from lending partners when a loan is successfully disbursed. This service is completely free for customers.' },
  { q: 'How long does the application process take?', a: "The eligibility check takes under 60 seconds. The overall loan process depends on the lender's timeline and documentation requirements." },
  { q: 'Can I track my application?', a: 'Yes. Once you submit your application, you can track its status in real time from your LoanLaabh dashboard.' },
]

function SectionHeading({ eyebrow, title, subtitle, dark }) {
  return (
    <div className="text-center max-w-3xl mx-auto mb-14">
      {eyebrow && <div className={`text-sm font-semibold tracking-widest uppercase mb-3 ${dark ? 'text-[#5B9BF3]' : 'text-[#1A6FE8]'}`}>{eyebrow}</div>}
      <h2 className={`text-3xl md:text-4xl font-bold tracking-tight ${dark ? 'text-white' : 'text-[#0A1628]'}`}>{title}</h2>
      {subtitle && <p className={`mt-4 text-lg ${dark ? 'text-slate-300' : 'text-[#64748B]'}`}>{subtitle}</p>}
    </div>
  )
}

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* ===== SECTION 1: HERO ===== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0A1628] via-[#0E2240] to-[#123A6E]">
        <div className="absolute inset-0 fm-matrix-grid" />
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-[#1A6FE8]/20 rounded-full blur-3xl" />
        <div className="container mx-auto px-4 relative py-20 md:py-28 grid lg:grid-cols-2 gap-14 items-center">
          <div className="fm-fade-up">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-4 py-1.5 text-sm text-blue-100 mb-6">
              <Sparkles className="h-4 w-4 text-[#5B9BF3]" /> Powered by FinMatrix AI&trade;
            </div>
            <h1 className="text-4xl md:text-5xl xl:text-6xl font-extrabold text-white leading-[1.1] tracking-tight">
              Don&apos;t Risk Your CIBIL. <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5B9BF3] to-[#8BC0FF]">Find Your Best Loan Match First.</span>
            </h1>
            <p className="mt-6 text-lg text-slate-300 max-w-xl leading-relaxed">
              LoanLaabh uses FinMatrix AI&trade; to analyze your profile and compare it with lender eligibility criteria &mdash; helping you discover suitable loan options before you apply.
            </p>
            <div className="mt-9 flex flex-col sm:flex-row gap-4">
              <Link href="/eligibility">
                <Button size="lg" className="w-full sm:w-auto h-13 px-8 text-base font-semibold bg-[#1A6FE8] hover:bg-[#1559c4] rounded-lg shadow-xl shadow-blue-900/40 h-12">
                  Find My Loan Match <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <a href="#finmatrix">
                <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 px-8 text-base font-semibold rounded-lg border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white">
                  How FinMatrix AI&trade; Works
                </Button>
              </a>
            </div>
            <div className="mt-10 grid grid-cols-2 md:flex md:flex-wrap gap-x-6 gap-y-3 text-sm text-slate-200">
              {TRUST_BADGES.map((b, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#22C55E] shrink-0" /> {b.label}
                </div>
              ))}
            </div>
          </div>

          {/* Abstract AI dashboard visual */}
          <div className="relative hidden lg:block fm-fade-up" style={{ animationDelay: '0.2s' }}>
            <div className="fm-float relative bg-white/[0.06] backdrop-blur-xl border border-white/15 rounded-2xl p-6 shadow-2xl overflow-hidden">
              <div className="fm-scanline" />
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="bg-[#1A6FE8] rounded-lg w-9 h-9 flex items-center justify-center"><Brain className="h-5 w-5 text-white" /></div>
                  <div>
                    <div className="text-white font-semibold text-sm">FinMatrix AI&trade;</div>
                    <div className="text-[11px] text-slate-400">Live profile analysis</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 fm-pulse-dot" /> ANALYZING
                </div>
              </div>
              <div className="space-y-2.5">
                {[
                  { l: 'Income Range', d: '0.4s' },
                  { l: 'Employment Type', d: '0.8s' },
                  { l: 'CIBIL Score Band', d: '1.2s' },
                  { l: 'FOIR & Obligations', d: '1.6s' },
                  { l: 'City & Lender Policy', d: '2.0s' },
                ].map((row, i) => (
                  <div key={i} className="fm-pop flex items-center justify-between bg-white/[0.05] border border-white/10 rounded-lg px-4 py-2.5" style={{ animationDelay: row.d }}>
                    <span className="text-sm text-slate-200">{row.l}</span>
                    <CheckCircle2 className="h-4 w-4 text-[#22C55E]" />
                  </div>
                ))}
              </div>
              <div className="mt-5">
                <div className="flex justify-between text-[11px] text-slate-400 mb-1.5">
                  <span>Match confidence</span><span className="text-white font-semibold">87%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="fm-fill h-full bg-gradient-to-r from-[#1A6FE8] to-[#22C55E] rounded-full" />
                </div>
              </div>
              <div className="fm-pop mt-5 flex items-center gap-2.5 bg-emerald-500/10 border border-emerald-500/25 rounded-lg px-4 py-3" style={{ animationDelay: '2.6s' }}>
                <BadgeCheck className="h-5 w-5 text-[#22C55E]" />
                <span className="text-sm text-emerald-300 font-medium">3 suitable lender matches identified</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SECTION 2: THE PROBLEM ===== */}
      <section className="py-20 md:py-28 bg-[#F8FAFC]">
        <div className="container mx-auto px-4">
          <SectionHeading eyebrow="The Problem" title="Blind Loan Applications Can Cost You Time, CIBIL Drop and Confidence" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {PROBLEMS.map((p, i) => (
              <div key={i} className="bg-white rounded-xl fm-card-shadow fm-card-shadow-hover p-7 border border-slate-100">
                <div className="bg-red-50 text-red-500 rounded-xl w-12 h-12 flex items-center justify-center mb-5">
                  <p.icon className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-[#0A1628] text-lg">{p.title}</h3>
                <p className="text-[#64748B] mt-2 text-sm leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-14">
            <p className="text-2xl md:text-3xl font-bold text-[#0A1628]">&ldquo;There is a Smarter Way.&rdquo;</p>
            <a href="#how-it-works">
              <Button size="lg" className="mt-6 h-12 px-8 bg-[#1A6FE8] hover:bg-[#1559c4] rounded-lg font-semibold">
                See How LoanLaabh Works <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* ===== SECTION 3: THE LOANLAABH WAY ===== */}
      <section id="how-it-works" className="py-20 md:py-28 bg-white scroll-mt-16">
        <div className="container mx-auto px-4">
          <SectionHeading
            eyebrow="The LoanLaabh Way"
            title="Borrow Smarter with LoanLaabh"
            subtitle={'Instead of applying everywhere, let FinMatrix AI\u2122 identify lenders that better match your financial profile.'}
          />
          <div className="relative">
            <div className="hidden lg:block absolute top-8 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-[#1A6FE8]/20 via-[#1A6FE8] to-[#22C55E]/60" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-4">
              {TIMELINE.map((s, i) => (
                <div key={i} className="relative flex lg:flex-col items-start lg:items-center gap-4 lg:text-center">
                  <div className="relative z-10 bg-white border-2 border-[#1A6FE8] text-[#1A6FE8] rounded-2xl w-16 h-16 flex items-center justify-center shrink-0 shadow-lg shadow-blue-100">
                    <s.icon className="h-7 w-7" />
                    <span className="absolute -top-2 -right-2 bg-[#0A1628] text-white text-[11px] font-bold rounded-full w-6 h-6 flex items-center justify-center">{i + 1}</span>
                  </div>
                  <div className="lg:mt-4">
                    <div className="font-semibold text-[#0A1628] leading-snug">{s.title}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== SECTION 4: FINMATRIX AI ===== */}
      <section id="finmatrix" className="py-20 md:py-28 bg-gradient-to-br from-[#0A1628] via-[#0E2240] to-[#123A6E] relative overflow-hidden scroll-mt-16">
        <div className="absolute inset-0 fm-matrix-grid" />
        <div className="container mx-auto px-4 relative">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-4 py-1.5 text-sm text-blue-100 mb-6">
                <Sparkles className="h-4 w-4 text-[#5B9BF3]" /> Powered by LoanLaabh Intelligence&trade;
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Meet FinMatrix AI&trade;</h2>
              <p className="mt-3 text-xl text-[#5B9BF3] font-semibold">Your Personal Loan Intelligence Engine</p>
              <p className="mt-5 text-slate-300 leading-relaxed max-w-xl">
                FinMatrix AI&trade; evaluates your profile across multiple eligibility parameters and compares them with lender criteria to identify loan options that may be a better fit.
              </p>
              <Link href="/eligibility">
                <Button size="lg" className="mt-8 h-12 px-8 bg-[#1A6FE8] hover:bg-[#1559c4] rounded-lg font-semibold shadow-xl shadow-blue-900/40">
                  Run My Analysis <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
            <div className="bg-white/[0.06] backdrop-blur-xl border border-white/15 rounded-2xl p-7 relative overflow-hidden">
              <div className="fm-scanline" />
              <div className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-5">Parameters analyzed</div>
              <div className="flex flex-wrap gap-2.5">
                {FM_PARAMS.map((p, i) => (
                  <div key={p} className="fm-pop inline-flex items-center gap-2 bg-white/[0.07] border border-white/15 rounded-lg px-3.5 py-2 text-sm text-slate-100" style={{ animationDelay: `${0.15 * i}s` }}>
                    <CheckCircle2 className="h-4 w-4 text-[#22C55E]" /> {p}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SECTION 5: WHY LOANLAABH ===== */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-4">
          <SectionHeading eyebrow="Why Us" title="Why Customers Choose LoanLaabh" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {WHY_US.map((w, i) => (
              <div key={i} className="bg-white rounded-xl fm-card-shadow fm-card-shadow-hover p-7 border border-slate-100">
                <div className="bg-blue-50 text-[#1A6FE8] rounded-xl w-12 h-12 flex items-center justify-center mb-5">
                  <w.icon className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-[#0A1628] text-lg">{w.title}</h3>
                <p className="text-[#64748B] mt-2 text-sm leading-relaxed">{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SECTION 6: LOAN PRODUCTS ===== */}
      <section id="products" className="py-20 md:py-28 bg-[#F8FAFC] scroll-mt-16">
        <div className="container mx-auto px-4">
          <SectionHeading eyebrow="Loan Products" title="Loan Solutions for Every Need" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {PRODUCTS.map((p, i) => (
              <Link key={i} href="/eligibility" className="group bg-white rounded-xl fm-card-shadow fm-card-shadow-hover p-7 border border-slate-100 block">
                <div className="bg-gradient-to-br from-[#1A6FE8] to-[#0A1628] text-white rounded-xl w-12 h-12 flex items-center justify-center mb-5">
                  <p.icon className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-[#0A1628] text-lg group-hover:text-[#1A6FE8] transition-colors">{p.title}</h3>
                <p className="text-[#64748B] mt-2 text-sm leading-relaxed">{p.desc}</p>
                <div className="mt-4 inline-flex items-center text-sm font-semibold text-[#1A6FE8] opacity-0 group-hover:opacity-100 transition-opacity">
                  Check eligibility <ArrowRight className="ml-1 h-4 w-4" />
                </div>
              </Link>
            ))}
            <div className="bg-gradient-to-br from-[#0A1628] to-[#123A6E] rounded-xl p-7 flex flex-col justify-center text-white">
              <h3 className="font-bold text-lg">Not sure which loan fits?</h3>
              <p className="text-slate-300 mt-2 text-sm">Let FinMatrix AI&trade; guide you to the right option.</p>
              <Link href="/eligibility">
                <Button size="sm" className="mt-5 bg-[#1A6FE8] hover:bg-[#1559c4] rounded-lg font-semibold w-fit">Find My Match <ArrowRight className="ml-1.5 h-4 w-4" /></Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SECTION 7: HOW FINMATRIX AI WORKS ===== */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-4">
          <SectionHeading eyebrow="The Process" title={'How FinMatrix AI\u2122 Finds Better Loan Matches'} />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PROCESS.map((p, i) => (
              <div key={i} className="relative bg-[#F8FAFC] rounded-xl p-7 border border-slate-100 fm-card-shadow-hover">
                <div className="text-5xl font-extrabold text-[#1A6FE8]/10 absolute top-4 right-5">{i + 1}</div>
                <div className="bg-white text-[#1A6FE8] rounded-xl w-12 h-12 flex items-center justify-center mb-5 fm-card-shadow">
                  <p.icon className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-[#0A1628] text-lg">{p.title}</h3>
                <p className="text-[#64748B] mt-2 text-sm leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/eligibility">
              <Button size="lg" className="h-12 px-8 bg-[#1A6FE8] hover:bg-[#1559c4] rounded-lg font-semibold">
                Start Free Eligibility Check <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== SECTION 8: LOANLAABH INSIGHTS ===== */}
      <section id="insights" className="py-20 md:py-28 bg-[#F8FAFC] scroll-mt-16">
        <div className="container mx-auto px-4">
          <SectionHeading eyebrow={'LoanLaabh Insights\u2122'} title="Learn Before You Borrow" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {INSIGHTS.map((a, i) => (
              <div key={i} className="group bg-white rounded-xl fm-card-shadow fm-card-shadow-hover border border-slate-100 overflow-hidden cursor-pointer">
                <div className="h-1.5 bg-gradient-to-r from-[#1A6FE8] to-[#22C55E]" />
                <div className="p-7">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-blue-50 text-[#1A6FE8] rounded-lg w-10 h-10 flex items-center justify-center"><BookOpen className="h-5 w-5" /></div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#1A6FE8] bg-blue-50 rounded-full px-3 py-1">{a.tag}</span>
                  </div>
                  <h3 className="font-bold text-[#0A1628] text-lg leading-snug group-hover:text-[#1A6FE8] transition-colors">{a.title}</h3>
                  <div className="mt-4 inline-flex items-center text-sm font-semibold text-[#64748B]">Coming soon <ArrowRight className="ml-1 h-4 w-4" /></div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Button size="lg" variant="outline" className="h-12 px-8 rounded-lg font-semibold border-[#1A6FE8] text-[#1A6FE8] hover:bg-blue-50 hover:text-[#1A6FE8]">
              Explore Insights <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* ===== SECTION 9: TRUST & COMPLIANCE ===== */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-4">
          <SectionHeading eyebrow="Trust & Compliance" title="Built for Responsible Loan Discovery" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TRUST_CARDS.map((t, i) => (
              <div key={i} className="bg-[#F8FAFC] rounded-xl p-7 border border-slate-100 text-center fm-card-shadow-hover">
                <div className="mx-auto bg-emerald-50 text-[#22C55E] rounded-xl w-12 h-12 flex items-center justify-center mb-5">
                  <t.icon className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-[#0A1628]">{t.title}</h3>
                <p className="text-[#64748B] mt-2 text-sm leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SECTION 10: FAQ ===== */}
      <section className="py-20 md:py-28 bg-[#F8FAFC]">
        <div className="container mx-auto px-4 max-w-3xl">
          <SectionHeading eyebrow="FAQ" title="Frequently Asked Questions" />
          <Accordion type="single" collapsible className="space-y-3">
            {FAQS.map((f, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="bg-white rounded-xl fm-card-shadow border border-slate-100 px-6 data-[state=open]:border-blue-200">
                <AccordionTrigger className="text-left font-semibold text-[#0A1628] hover:no-underline py-5">{f.q}</AccordionTrigger>
                <AccordionContent className="text-[#64748B] leading-relaxed pb-5">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ===== SECTION 11: FINAL CTA ===== */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-[#0A1628] via-[#0E2240] to-[#123A6E] relative overflow-hidden">
        <div className="absolute inset-0 fm-matrix-grid" />
        <div className="container mx-auto px-4 relative text-center max-w-3xl">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">Ready to Discover Your Best Loan Match?</h2>
          <p className="mt-5 text-lg text-slate-300">Let FinMatrix AI&trade; analyze your profile and help you explore suitable loan options before you apply.</p>
          <div className="mt-9 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/eligibility">
              <Button size="lg" className="w-full sm:w-auto h-12 px-8 text-base font-semibold bg-[#1A6FE8] hover:bg-[#1559c4] rounded-lg shadow-xl shadow-blue-900/40">
                Find My Loan Match <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 px-8 text-base font-semibold rounded-lg border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white">
                <MessageCircle className="mr-2 h-5 w-5" /> Talk to an Advisor
              </Button>
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
