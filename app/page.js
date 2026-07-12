'use client'
import Link from 'next/link'
import Navbar from '@/components/site/navbar'
import Footer from '@/components/site/footer'
import StickyMobileCta from '@/components/site/sticky-mobile-cta'
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

const WHATSAPP_URL = 'https://wa.me/917770024242'

const TRUST_BADGES = [
  { icon: BadgeCheck, label: 'Free Eligibility Check' },
  { icon: ShieldCheck, label: 'No Direct CIBIL Impact' },
  { icon: Cpu, label: 'AI-Powered Matching' },
  { icon: Lock, label: '100% Free Service' },
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
  { icon: Briefcase, title: 'Personal Loan', desc: 'Quick financing for salaried professionals.', img: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=600&q=80' },
  { icon: TrendingUp, title: 'Business Loan', desc: 'Funding for business growth and working capital.', img: 'https://images.pexels.com/photos/26861411/pexels-photo-26861411.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { icon: HomeIcon, title: 'Home Loan', desc: 'Purchase, construction, and refinancing options.', img: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=600&q=80' },
  { icon: Car, title: 'Used Car Loan', desc: 'Finance for pre-owned vehicles.', img: 'https://images.unsplash.com/photo-1671719367451-7bf05ae9549c?auto=format&fit=crop&w=600&q=80' },
  { icon: Building2, title: 'Loan Against Property', desc: 'Unlock the value of your property.' },
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
  { icon: Scale, title: 'Compliance', desc: 'LoanLaabh is an AI-powered loan discovery platform. We do not lend money directly.' },
]

const FAQS = [
  { q: 'Does LoanLaabh provide loans directly?', a: 'No. LoanLaabh is an AI-powered loan discovery platform. We help you discover suitable lenders based on your profile. Loans are disbursed directly by the lending institution.' },
  { q: 'Is the eligibility check free?', a: 'Yes. Checking your eligibility on LoanLaabh is completely free.' },
  { q: 'Will checking eligibility affect my CIBIL score?', a: 'Basic eligibility checks on LoanLaabh do not impact your CIBIL score. If you proceed with a lender application, the lender may perform a credit bureau check as part of their own process.' },
  { q: 'How does FinMatrix AI\u2122 work?', a: 'FinMatrix AI\u2122 evaluates your profile across multiple eligibility parameters such as income, employment, city, CIBIL score band, and existing obligations, and compares them with lender criteria to identify suitable loan options.' },
  { q: 'Is loan approval guaranteed?', a: "No. LoanLaabh helps you discover suitable lenders based on your profile. Final approval depends on the lender's internal policies, documentation, and credit assessment." },
  { q: 'How does LoanLaabh earn revenue?', a: 'LoanLaabh earns a referral fee from lending partners when a loan is successfully disbursed. This service is completely free for customers.' },
  { q: 'How long does the application process take?', a: "The eligibility check takes under 60 seconds. The overall loan process depends on the lender's timeline and documentation requirements." },
  { q: 'Can I track my application?', a: 'Yes. Once you submit your application, you can track its status in real time from your LoanLaabh dashboard.' },
]

function SectionHeading({ eyebrow, title, subtitle }) {
  return (
    <div className="text-center max-w-3xl mx-auto mb-14">
      {eyebrow && <div className="text-sm font-semibold tracking-widest uppercase mb-3 text-[#1261E8]">{eyebrow}</div>}
      <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#071E41]">{title}</h2>
      {subtitle && <p className="mt-4 text-lg text-[#42526B] leading-relaxed">{subtitle}</p>}
    </div>
  )
}

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F7FAFF]">
      <Navbar />

      {/* ===== SECTION 1: HERO ===== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-[#F7FAFF] to-[#EAF2FF]">
        <div className="absolute inset-0 fm-matrix-grid opacity-70" />
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-[#1261E8]/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] bg-[#16A34A]/8 rounded-full blur-3xl" />
        <div className="container mx-auto px-4 relative py-16 md:py-24 grid lg:grid-cols-2 gap-12 items-center">
          <div className="fm-fade-up">
            <div className="inline-flex items-center gap-2 bg-white border border-[#E3ECFA] rounded-full px-4 py-1.5 text-sm text-[#1261E8] mb-6 shadow-sm">
              <Sparkles className="h-4 w-4" /> Powered by FinMatrix AI&trade;
            </div>
            <h1 className="text-4xl md:text-5xl xl:text-6xl font-extrabold text-[#071E41] leading-[1.1] tracking-tight">
              Check Your Loan Eligibility <span className="text-[#1261E8]">Before Applying</span>
            </h1>
            <p className="mt-6 text-lg text-[#42526B] max-w-xl leading-relaxed">
              LoanLaabh uses FinMatrix AI&trade; to match your profile with suitable banks and NBFCs &mdash; so you apply where your chances are stronger.
            </p>
            <div className="mt-9 flex flex-col sm:flex-row gap-4">
              <Link href="/eligibility">
                <Button size="lg" className="w-full sm:w-auto h-12 px-8 text-base font-semibold bg-[#1261E8] hover:bg-[#0B4FC4] rounded-2xl shadow-lg shadow-blue-200">
                  Check Free Eligibility <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <a href="#finmatrix">
                <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 px-8 text-base font-semibold rounded-2xl border-[#1261E8] bg-white text-[#1261E8] hover:bg-[#EAF2FF] hover:text-[#1261E8]">
                  How FinMatrix AI&trade; Works
                </Button>
              </a>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-3">
              {TRUST_BADGES.map((b, i) => (
                <div key={i} className="flex items-center gap-2.5 bg-white border border-[#E3ECFA] rounded-xl px-3.5 py-2.5 text-sm text-[#071E41] font-medium shadow-sm">
                  <b.icon className="h-4 w-4 text-[#16A34A] shrink-0" /> {b.label}
                </div>
              ))}
            </div>
          </div>

          {/* AI dashboard visual - light card */}
          <div className="relative fm-fade-up mt-2 lg:mt-0" style={{ animationDelay: '0.2s' }}>
            <div className="fm-float relative bg-white border border-[#E3ECFA] rounded-3xl p-6 shadow-[0_20px_60px_rgba(18,97,232,0.15)] overflow-hidden">
              <div className="fm-scanline" />
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="bg-[#1261E8] rounded-xl w-10 h-10 flex items-center justify-center shadow-md shadow-blue-200"><Brain className="h-5 w-5 text-white" /></div>
                  <div>
                    <div className="text-[#071E41] font-semibold text-sm">FinMatrix AI&trade;</div>
                    <div className="text-[11px] text-[#6B7280]">Live profile analysis</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-[#16A34A] font-semibold bg-emerald-50 border border-emerald-100 rounded-full px-2.5 py-1">
                  <span className="w-2 h-2 rounded-full bg-[#16A34A] fm-pulse-dot" /> ANALYZING
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
                  <div key={i} className="fm-pop flex items-center justify-between bg-[#F7FAFF] border border-[#E3ECFA] rounded-xl px-4 py-2.5" style={{ animationDelay: row.d }}>
                    <span className="text-sm text-[#071E41] font-medium">{row.l}</span>
                    <CheckCircle2 className="h-4 w-4 text-[#16A34A]" />
                  </div>
                ))}
              </div>
              <div className="mt-5">
                <div className="flex justify-between text-[11px] text-[#42526B] mb-1.5">
                  <span className="font-medium">Match confidence</span><span className="text-[#071E41] font-bold">87%</span>
                </div>
                <div className="h-2 bg-[#EAF2FF] rounded-full overflow-hidden">
                  <div className="fm-fill h-full bg-gradient-to-r from-[#1261E8] to-[#16A34A] rounded-full" />
                </div>
              </div>
              <div className="fm-pop mt-5 flex items-center gap-2.5 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3" style={{ animationDelay: '2.6s' }}>
                <BadgeCheck className="h-5 w-5 text-[#16A34A]" />
                <span className="text-sm text-[#065F46] font-semibold">3 suitable lender matches identified</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SECTION 2: THE PROBLEM ===== */}
      <section className="py-20 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <SectionHeading eyebrow="The Problem" title="Blind Loan Applications Can Cost You Time, CIBIL Drop and Confidence" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {PROBLEMS.map((p, i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#E3ECFA] fm-card-shadow fm-card-shadow-hover p-7">
                <div className="bg-red-50 text-red-500 rounded-xl w-12 h-12 flex items-center justify-center mb-5">
                  <p.icon className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-[#071E41] text-lg">{p.title}</h3>
                <p className="text-[#42526B] mt-2 text-sm leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-14">
            <p className="text-2xl md:text-3xl font-bold text-[#071E41]">&ldquo;There is a Smarter Way.&rdquo;</p>
            <a href="#how-it-works">
              <Button size="lg" className="mt-6 h-12 px-8 bg-[#1261E8] hover:bg-[#0B4FC4] rounded-2xl font-semibold shadow-md shadow-blue-200">
                See How LoanLaabh Works <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* ===== SECTION 3: THE LOANLAABH WAY ===== */}
      <section id="how-it-works" className="py-20 md:py-24 bg-[#EAF2FF] scroll-mt-16">
        <div className="container mx-auto px-4">
          <SectionHeading
            eyebrow="The LoanLaabh Way"
            title="Borrow Smarter with LoanLaabh"
            subtitle={'Instead of applying everywhere, let FinMatrix AI\u2122 identify lenders that better match your financial profile.'}
          />
          <div className="relative">
            <div className="hidden lg:block absolute top-8 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-[#1261E8]/20 via-[#1261E8] to-[#16A34A]/60" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-4">
              {TIMELINE.map((s, i) => (
                <div key={i} className="relative flex lg:flex-col items-start lg:items-center gap-4 lg:text-center bg-white lg:bg-transparent rounded-2xl lg:rounded-none p-5 lg:p-0 border lg:border-0 border-[#E3ECFA]">
                  <div className="relative z-10 bg-white border-2 border-[#1261E8] text-[#1261E8] rounded-2xl w-16 h-16 flex items-center justify-center shrink-0 shadow-lg shadow-blue-100">
                    <s.icon className="h-7 w-7" />
                    <span className="absolute -top-2 -right-2 bg-[#1261E8] text-white text-[11px] font-bold rounded-full w-6 h-6 flex items-center justify-center">{i + 1}</span>
                  </div>
                  <div className="lg:mt-4">
                    <div className="font-semibold text-[#071E41] leading-snug">{s.title}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== SECTION 4: FINMATRIX AI (LIGHT) ===== */}
      <section id="finmatrix" className="py-20 md:py-24 bg-white relative overflow-hidden scroll-mt-16">
        <div className="container mx-auto px-4 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#EAF2FF] border border-[#E3ECFA] rounded-full px-4 py-1.5 text-sm text-[#1261E8] font-medium mb-6">
                <Sparkles className="h-4 w-4" /> Powered by LoanLaabh Intelligence&trade;
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#071E41] tracking-tight">Meet <span className="text-[#1261E8]">FinMatrix AI&trade;</span></h2>
              <p className="mt-3 text-xl text-[#1261E8] font-semibold">Your Personal Loan Intelligence Engine</p>
              <p className="mt-5 text-[#42526B] leading-relaxed max-w-xl">
                FinMatrix AI&trade; evaluates your profile across multiple eligibility parameters and compares them with lender criteria to identify loan options that may be a better fit.
              </p>
              <Link href="/eligibility">
                <Button size="lg" className="mt-8 h-12 px-8 bg-[#1261E8] hover:bg-[#0B4FC4] rounded-2xl font-semibold shadow-lg shadow-blue-200">
                  Run My Analysis <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
            <div className="bg-white border border-[#E3ECFA] rounded-3xl p-7 relative overflow-hidden shadow-[0_20px_60px_rgba(18,97,232,0.10)]">
              <div className="fm-scanline" />
              <div className="text-sm font-semibold text-[#42526B] uppercase tracking-wider mb-5">Parameters analyzed</div>
              <div className="flex flex-wrap gap-2.5">
                {FM_PARAMS.map((p, i) => (
                  <div key={p} className="fm-pop inline-flex items-center gap-2 bg-[#F7FAFF] border border-[#E3ECFA] rounded-xl px-3.5 py-2 text-sm text-[#071E41] font-medium" style={{ animationDelay: `${0.15 * i}s` }}>
                    <CheckCircle2 className="h-4 w-4 text-[#16A34A]" /> {p}
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-5 border-t border-[#E3ECFA]">
                <div className="flex items-center justify-between mb-2 text-xs">
                  <span className="text-[#42526B] font-medium">Analysis progress</span>
                  <span className="text-[#1261E8] font-bold">Live</span>
                </div>
                <div className="h-2 bg-[#EAF2FF] rounded-full overflow-hidden">
                  <div className="fm-fill h-full bg-gradient-to-r from-[#1261E8] to-[#16A34A] rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SECTION 5: WHY LOANLAABH ===== */}
      <section className="py-20 md:py-24 bg-[#F7FAFF]">
        <div className="container mx-auto px-4">
          <SectionHeading eyebrow="Why Us" title="Why Customers Choose LoanLaabh" />
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-[#1261E8]/10 to-[#16A34A]/10 blur-2xl rounded-full" />
              <img src="https://images.pexels.com/photos/19609201/pexels-photo-19609201.jpeg?auto=compress&cs=tinysrgb&w=900" alt="Happy Indian couple planning their finances" className="relative rounded-3xl shadow-[0_20px_60px_rgba(7,30,65,0.15)] w-full object-cover aspect-[4/3] border border-white" />
              <div className="absolute -bottom-6 -right-4 sm:-right-6 bg-white rounded-2xl fm-card-shadow p-4 flex items-center gap-3 border border-[#E3ECFA]">
                <div className="bg-emerald-50 text-[#16A34A] rounded-lg w-11 h-11 flex items-center justify-center"><Brain className="h-5 w-5" /></div>
                <div>
                  <div className="text-xs text-[#42526B]">Matched by</div>
                  <div className="font-bold text-[#071E41] text-sm">FinMatrix AI&trade;</div>
                </div>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              {WHY_US.map((w, i) => (
                <div key={i} className="bg-white rounded-2xl border border-[#E3ECFA] fm-card-shadow fm-card-shadow-hover p-5">
                  <div className="bg-[#EAF2FF] text-[#1261E8] rounded-xl w-11 h-11 flex items-center justify-center mb-4">
                    <w.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-[#071E41]">{w.title}</h3>
                  <p className="text-[#42526B] mt-1.5 text-sm leading-relaxed">{w.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== SECTION 6: LOAN PRODUCTS ===== */}
      <section id="products" className="py-20 md:py-24 bg-white scroll-mt-16">
        <div className="container mx-auto px-4">
          <SectionHeading eyebrow="Loan Products" title="Loan Solutions for Every Need" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {PRODUCTS.filter(p => p.img).map((p, i) => (
              <Link key={i} href="/eligibility" className="group bg-white rounded-2xl border border-[#E3ECFA] fm-card-shadow fm-card-shadow-hover block overflow-hidden">
                <div className="relative h-40 overflow-hidden">
                  <img src={p.img} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#071E41]/40 to-transparent" />
                  <div className="absolute bottom-3 left-4 bg-white text-[#1261E8] rounded-xl w-10 h-10 flex items-center justify-center shadow-md">
                    <p.icon className="h-5 w-5" />
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-[#071E41] text-lg group-hover:text-[#1261E8] transition-colors">{p.title}</h3>
                  <p className="text-[#42526B] mt-1.5 text-sm leading-relaxed">{p.desc}</p>
                  <div className="mt-3 inline-flex items-center text-sm font-semibold text-[#1261E8]">
                    Check eligibility <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PRODUCTS.filter(p => !p.img).map((p, i) => (
              <Link key={i} href="/eligibility" className="group bg-white rounded-2xl border border-[#E3ECFA] fm-card-shadow fm-card-shadow-hover p-6 block">
                <div className="flex items-center gap-4">
                  <div className="bg-[#EAF2FF] text-[#1261E8] rounded-xl w-12 h-12 flex items-center justify-center shrink-0">
                    <p.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#071E41] group-hover:text-[#1261E8] transition-colors">{p.title}</h3>
                    <p className="text-[#42526B] text-sm mt-0.5">{p.desc}</p>
                  </div>
                </div>
              </Link>
            ))}
            <div className="bg-[#EAF2FF] border border-[#E3ECFA] rounded-2xl p-6 flex flex-col justify-center">
              <h3 className="font-bold text-[#071E41]">Not sure which loan fits?</h3>
              <p className="text-[#42526B] mt-1 text-sm">Let FinMatrix AI&trade; guide you to the right option.</p>
              <Link href="/eligibility">
                <Button size="sm" className="mt-4 bg-[#1261E8] hover:bg-[#0B4FC4] rounded-xl font-semibold w-fit">Find My Match <ArrowRight className="ml-1.5 h-4 w-4" /></Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SECTION 7: HOW FINMATRIX AI WORKS ===== */}
      <section className="py-20 md:py-24 bg-[#EAF2FF]">
        <div className="container mx-auto px-4">
          <SectionHeading eyebrow="The Process" title={'How FinMatrix AI\u2122 Finds Better Loan Matches'} />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PROCESS.map((p, i) => (
              <div key={i} className="relative bg-white rounded-2xl p-7 border border-[#E3ECFA] fm-card-shadow fm-card-shadow-hover">
                <div className="text-5xl font-extrabold text-[#1261E8]/12 absolute top-4 right-5">{i + 1}</div>
                <div className="bg-[#1261E8] text-white rounded-2xl w-12 h-12 flex items-center justify-center mb-5 shadow-md shadow-blue-200 relative z-10">
                  <p.icon className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-[#071E41] text-lg">{p.title}</h3>
                <p className="text-[#42526B] mt-2 text-sm leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/eligibility">
              <Button size="lg" className="h-12 px-8 bg-[#1261E8] hover:bg-[#0B4FC4] rounded-2xl font-semibold shadow-lg shadow-blue-200">
                Start Free Eligibility Check <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== SECTION 8: LOANLAABH INSIGHTS ===== */}
      <section id="insights" className="py-20 md:py-24 bg-white scroll-mt-16">
        <div className="container mx-auto px-4">
          <SectionHeading eyebrow={'LoanLaabh Insights\u2122'} title="Learn Before You Borrow" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {INSIGHTS.map((a, i) => (
              <div key={i} className="group bg-white rounded-2xl border border-[#E3ECFA] fm-card-shadow fm-card-shadow-hover overflow-hidden cursor-pointer">
                <div className="h-1.5 bg-gradient-to-r from-[#1261E8] to-[#16A34A]" />
                <div className="p-7">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-[#EAF2FF] text-[#1261E8] rounded-xl w-10 h-10 flex items-center justify-center"><BookOpen className="h-5 w-5" /></div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#1261E8] bg-[#EAF2FF] rounded-full px-3 py-1">{a.tag}</span>
                  </div>
                  <h3 className="font-bold text-[#071E41] text-lg leading-snug group-hover:text-[#1261E8] transition-colors">{a.title}</h3>
                  <div className="mt-4 inline-flex items-center text-sm font-semibold text-[#42526B]">Coming soon <ArrowRight className="ml-1 h-4 w-4" /></div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Button size="lg" variant="outline" className="h-12 px-8 rounded-2xl font-semibold border-[#1261E8] text-[#1261E8] bg-white hover:bg-[#EAF2FF] hover:text-[#1261E8]">
              Explore Insights <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* ===== SECTION 9: TRUST & COMPLIANCE ===== */}
      <section className="py-20 md:py-24 bg-[#F7FAFF]">
        <div className="container mx-auto px-4">
          <SectionHeading eyebrow="Trust & Compliance" title="Built for Responsible Loan Discovery" />
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="grid sm:grid-cols-2 gap-5 order-2 lg:order-1">
              {TRUST_CARDS.map((t, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 border border-[#E3ECFA] fm-card-shadow fm-card-shadow-hover">
                  <div className="bg-emerald-50 text-[#16A34A] rounded-xl w-11 h-11 flex items-center justify-center mb-4">
                    <t.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-[#071E41]">{t.title}</h3>
                  <p className="text-[#42526B] mt-1.5 text-sm leading-relaxed">{t.desc}</p>
                </div>
              ))}
            </div>
            <div className="relative order-1 lg:order-2">
              <div className="absolute -inset-4 bg-[#16A34A]/10 blur-2xl rounded-full" />
              <img src="https://images.unsplash.com/photo-1549923746-c502d488b3ea?auto=format&fit=crop&w=900&q=80" alt="Trusted partnership handshake" className="relative rounded-3xl shadow-[0_20px_60px_rgba(7,30,65,0.15)] w-full object-cover aspect-[4/3] border border-white" />
              <div className="absolute -bottom-6 -left-4 sm:-left-6 bg-white rounded-2xl fm-card-shadow p-4 flex items-center gap-3 border border-[#E3ECFA]">
                <div className="bg-emerald-50 text-[#16A34A] rounded-lg w-11 h-11 flex items-center justify-center"><ShieldCheck className="h-5 w-5" /></div>
                <div>
                  <div className="text-xs text-[#42526B]">100% Free</div>
                  <div className="font-bold text-[#071E41] text-sm">Discovery Platform</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== ADVISOR SECTION (LIGHT) ===== */}
      <section className="py-20 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-br from-[#EAF2FF] to-[#F7FAFF] border border-[#E3ECFA] rounded-3xl overflow-hidden grid lg:grid-cols-2 shadow-[0_12px_40px_rgba(7,30,65,0.06)]">
            <div className="p-10 md:p-14 flex flex-col justify-center">
              <div className="text-sm font-semibold tracking-widest uppercase text-[#1261E8] mb-3">Real Humans. Real Guidance.</div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#071E41] tracking-tight">Talk to a LoanLaabh Advisor</h2>
              <p className="mt-4 text-[#42526B] leading-relaxed">
                FinMatrix AI&trade; finds your matches, and our advisors walk you through documentation, lender processes, and every step until disbursal &mdash; at no cost to you.
              </p>
              <div className="mt-7 flex flex-col sm:flex-row gap-4">
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                  <Button size="lg" className="w-full sm:w-auto h-12 px-7 font-semibold bg-[#16A34A] hover:bg-emerald-700 rounded-2xl shadow-md shadow-emerald-100">
                    <MessageCircle className="mr-2 h-5 w-5" /> WhatsApp: +91 77700 24242
                  </Button>
                </a>
                <a href="mailto:help@loanlaabh.com">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 px-7 font-semibold rounded-2xl border-[#1261E8] bg-white text-[#1261E8] hover:bg-[#EAF2FF] hover:text-[#1261E8]">
                    help@loanlaabh.com
                  </Button>
                </a>
              </div>
            </div>
            <div className="relative min-h-[300px]">
              <img src="https://images.pexels.com/photos/8867631/pexels-photo-8867631.jpeg?auto=compress&cs=tinysrgb&w=900" alt="LoanLaabh advisor ready to help" className="absolute inset-0 w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* ===== SECTION 10: FAQ ===== */}
      <section className="py-20 md:py-24 bg-[#F7FAFF]">
        <div className="container mx-auto px-4 max-w-3xl">
          <SectionHeading eyebrow="FAQ" title="Frequently Asked Questions" />
          <Accordion type="single" collapsible className="space-y-3">
            {FAQS.map((f, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="bg-white rounded-2xl fm-card-shadow border border-[#E3ECFA] px-6 data-[state=open]:border-[#1261E8]/40">
                <AccordionTrigger className="text-left font-semibold text-[#071E41] hover:no-underline py-5">{f.q}</AccordionTrigger>
                <AccordionContent className="text-[#42526B] leading-relaxed pb-5">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ===== SECTION 11: FINAL CTA (LIGHT) ===== */}
      <section className="py-20 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="relative bg-gradient-to-br from-[#EAF2FF] via-white to-[#EAF2FF] border border-[#E3ECFA] rounded-3xl p-10 md:p-16 text-center max-w-4xl mx-auto overflow-hidden shadow-[0_20px_60px_rgba(18,97,232,0.12)]">
            <div className="absolute inset-0 fm-matrix-grid opacity-50" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 bg-white border border-[#E3ECFA] rounded-full px-4 py-1.5 text-sm text-[#1261E8] font-medium mb-6 shadow-sm">
                <Sparkles className="h-4 w-4" /> Free Eligibility Check
              </div>
              <h2 className="text-3xl md:text-5xl font-extrabold text-[#071E41] tracking-tight leading-tight">Ready to Discover Your <span className="text-[#1261E8]">Best Loan Match?</span></h2>
              <p className="mt-5 text-lg text-[#42526B] max-w-2xl mx-auto">Let FinMatrix AI&trade; analyze your profile and help you explore suitable loan options before you apply.</p>
              <div className="mt-9 flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/eligibility">
                  <Button size="lg" className="w-full sm:w-auto h-12 px-8 text-base font-semibold bg-[#1261E8] hover:bg-[#0B4FC4] rounded-2xl shadow-lg shadow-blue-200">
                    Check Free Eligibility <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 px-8 text-base font-semibold rounded-2xl border-[#16A34A] bg-white text-[#16A34A] hover:bg-emerald-50 hover:text-[#16A34A]">
                    <MessageCircle className="mr-2 h-5 w-5" /> Talk to an Advisor
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <StickyMobileCta />
    </div>
  )
}
