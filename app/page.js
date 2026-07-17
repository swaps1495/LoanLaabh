'use client'
import { useState } from 'react'
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
  UserCircle2, Radar, Headphones,
  Users, IndianRupee, TrendingUp as TrendUp,
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

const JOURNEY_STEPS = [
  {
    icon: UserCircle2,
    title: 'Share Your Profile',
    desc: 'Tell us your loan need, income, employment type, city, existing EMIs, and approximate CIBIL score band.',
    chips: ['Income', 'City', 'CIBIL Band'],
  },
  {
    icon: Radar,
    title: 'AI Eligibility Review',
    desc: 'FinMatrix AI\u2122 checks your profile across key lending factors like FOIR, age, salary mode, latest enquiries, PF/PT status, and obligations.',
    chips: ['FOIR', 'Enquiries', 'PF/PT'],
  },
  {
    icon: Cpu,
    title: 'Policy Matching',
    desc: 'Your profile is compared with bank/NBFC eligibility rules, including salary, age, CIBIL, city, and lender-specific conditions.',
    chips: ['Bank Rules', 'NBFC Criteria', 'Policy Matrix'],
    highlight: true,
  },
  {
    icon: Target,
    title: 'Suitable Loan Matches',
    desc: 'You get indicative better-fit loan options instead of applying randomly and risking unnecessary rejections.',
    chips: ['Better Fit', 'Risky Fit', 'Avoid Random Apply'],
  },
  {
    icon: Headphones,
    title: 'Guided Application',
    desc: 'A LoanLaabh advisor helps with the next steps, lender coordination, documentation guidance, and application tracking.',
    chips: ['Advisor Support', 'Documents', 'Tracking'],
  },
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

const LENDERS = [
  { name: 'HDFC Bank', domain: 'hdfcbank.com', slug: 'hdfc-bank' },
  { name: 'ICICI Bank', domain: 'icicibank.com', slug: 'icici-bank' },
  { name: 'State Bank of India', domain: 'sbi.co.in', slug: 'sbi' },
  { name: 'Axis Bank', domain: 'axisbank.com', slug: 'axis-bank' },
  { name: 'Kotak Mahindra Bank', domain: 'kotak.com', slug: 'kotak' },
  { name: 'IDFC First Bank', domain: 'idfcfirstbank.com', slug: 'idfc-first' },
  { name: 'Yes Bank', domain: 'yesbank.in', slug: 'yes-bank' },
  { name: 'IndusInd Bank', domain: 'indusind.com', slug: 'indusind' },
  { name: 'Federal Bank', domain: 'federalbank.co.in', slug: 'federal-bank' },
  { name: 'RBL Bank', domain: 'rblbank.com', slug: 'rbl-bank' },
  { name: 'Bank of Baroda', domain: 'bankofbaroda.in', slug: 'bob' },
  { name: 'Canara Bank', domain: 'canarabank.com', slug: 'canara-bank' },
  { name: 'Punjab National Bank', domain: 'pnbindia.in', slug: 'pnb' },
  { name: 'Union Bank of India', domain: 'unionbankofindia.co.in', slug: 'union-bank' },
  { name: 'Bank of India', domain: 'bankofindia.co.in', slug: 'bank-of-india' },
  { name: 'Indian Bank', domain: 'indianbank.in', slug: 'indian-bank' },
  { name: 'HSBC India', domain: 'hsbc.co.in', slug: 'hsbc' },
  { name: 'Citi India', domain: 'citibank.co.in', slug: 'citi' },
  { name: 'Standard Chartered', domain: 'sc.com', slug: 'standard-chartered' },
  { name: 'Bajaj Finserv', domain: 'bajajfinserv.in', slug: 'bajaj-finserv' },
  { name: 'Tata Capital', domain: 'tatacapital.com', slug: 'tata-capital' },
  { name: 'Piramal Finance', domain: 'piramalfinance.com', slug: 'piramal' },
  { name: 'L&T Finance', domain: 'ltfs.com', slug: 'lt-finance' },
  { name: 'Aditya Birla Capital', domain: 'adityabirlacapital.com', slug: 'aditya-birla' },
  { name: 'SMFG India Credit', domain: 'smfgindiacredit.com', slug: 'smfg' },
  { name: 'Poonawalla Fincorp', domain: 'poonawallafincorp.com', slug: 'poonawalla' },
  { name: 'Hero FinCorp', domain: 'herofincorp.com', slug: 'hero-fincorp' },
  { name: 'Muthoot Finance', domain: 'muthootfinance.com', slug: 'muthoot' },
  { name: 'InCred', domain: 'incred.com', slug: 'incred' },
  { name: 'Cholamandalam', domain: 'cholamandalam.com', slug: 'chola' },
  { name: 'HomeFirst Finance', domain: 'homefirstindia.com', slug: 'homefirst' },
  { name: 'LIC Housing Finance', domain: 'lichousing.com', slug: 'lic-housing' },
  { name: 'PNB Housing Finance', domain: 'pnbhousing.com', slug: 'pnb-housing' },
  { name: 'IIFL Finance', domain: 'iiflfinance.com', slug: 'iifl' },
  { name: 'Manappuram Finance', domain: 'manappuram.com', slug: 'manappuram' },
  { name: 'UGRO Capital', domain: 'ugrocapital.com', slug: 'ugro' },
]

function LenderPill({ name, domain }) {
  const [stage, setStage] = useState(0)
  const key = process.env.NEXT_PUBLIC_LOGO_DEV_KEY
  const sources = [
    key ? `https://img.logo.dev/${domain}?token=${key}&size=200&format=png` : null,
    `https://logo.clearbit.com/${domain}`,
  ].filter(Boolean)
  return (
    <div className="shrink-0 flex items-center gap-2.5 bg-white border border-[#E3ECFA] rounded-2xl px-3.5 py-2.5 shadow-sm hover:border-[#1261E8]/40 hover:shadow-md transition-all min-w-max">
      <div className="w-9 h-9 flex items-center justify-center shrink-0 rounded-lg bg-[#F7FAFF] overflow-hidden">
        {stage >= sources.length ? (
          <span className="text-[10px] font-black text-[#1261E8]">{name.slice(0, 2).toUpperCase()}</span>
        ) : (
          <img
            key={stage}
            src={sources[stage]}
            alt=""
            className="max-w-full max-h-full object-contain"
            onError={() => setStage(s => s + 1)}
          />
        )}
      </div>
      <span className="text-sm font-semibold text-[#071E41] whitespace-nowrap pr-1">{name}</span>
    </div>
  )
}


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
              Don&apos;t Risk Your CIBIL. <span className="text-[#1261E8]">Check Your Loan Eligibility Before Applying</span>
            </h1>
            <p className="mt-5 text-lg md:text-xl font-semibold text-[#071E41]">
              Multiple Credit Inquiries Can Reduce Your Score
            </p>
            <p className="mt-4 text-lg text-[#42526B] max-w-xl leading-relaxed">
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

      {/* ===== SECTION 1.5: TRUST NETWORK / STATS ===== */}
      <section className="relative py-10 md:py-20 bg-gradient-to-b from-white via-[#F7FAFF] to-[#EAF2FF] overflow-hidden">
        <div className="absolute -top-24 right-1/4 w-[420px] h-[420px] bg-[#1261E8]/6 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 left-1/4 w-[380px] h-[380px] bg-[#16A34A]/6 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 relative">
          <div className="text-center max-w-2xl mx-auto mb-6 md:mb-14">
            <div className="inline-flex items-center gap-1.5 md:gap-2 bg-white border border-[#D6E6FF] rounded-full px-3 py-1 md:px-3.5 md:py-1.5 text-[10px] md:text-xs font-semibold tracking-wider uppercase text-[#1261E8] mb-3 md:mb-4 shadow-sm">
              <Sparkles className="h-3 w-3 md:h-3.5 md:w-3.5" /> LoanLaabh Trust Network
            </div>
            <h2 className="text-2xl md:text-4xl xl:text-5xl font-extrabold text-[#071E41] tracking-tight leading-[1.15]">
              Numbers That Build <span className="text-[#1261E8]">Borrower Confidence</span>
            </h2>
            <p className="hidden md:block mt-4 text-base md:text-lg text-[#5B6B82] leading-relaxed">
              LoanLaabh combines FinMatrix AI&trade; with lending partner criteria to help customers discover suitable loan options before applying.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 md:gap-5 lg:gap-6">
            {[
              { icon: Target, num: '92%', title: 'Smart Match Success Rate', shortTitle: 'Match Success', desc: 'Eligible profiles matched with suitable lending partners.', accent: 'from-[#1261E8] to-[#0B4FC4]' },
              { icon: Users, num: '10K+', title: 'Borrowers Guided', shortTitle: 'Borrowers Guided', desc: 'Customers assisted across eligibility checks and application support.', accent: 'from-[#0B4FC4] to-[#1261E8]' },
              { icon: IndianRupee, num: '₹1B+', title: 'Loan Value Processed', shortTitle: 'Loan Value', desc: 'Loan applications processed through partner lending journeys.', accent: 'from-[#16A34A] to-[#059669]' },
              { icon: Landmark, num: '39+', title: 'Trusted Lending Partners', shortTitle: 'Lending Partners', desc: 'Banks, NBFCs, and finance partners mapped in the LoanLaabh network.', accent: 'from-[#1261E8] to-[#0B4FC4]' },
            ].map((s, i) => (
              <div
                key={i}
                className="group relative bg-white rounded-2xl md:rounded-3xl p-3.5 md:p-7 border border-[#D6E6FF] shadow-[0_2px_10px_rgba(18,97,232,0.05)] md:shadow-[0_4px_18px_rgba(18,97,232,0.06)] hover:shadow-[0_16px_40px_rgba(18,97,232,0.12)] md:hover:-translate-y-1 hover:border-[#1261E8]/30 transition-all duration-300 fm-fade-up"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className={`absolute top-0 left-4 md:left-6 right-4 md:right-6 h-1 bg-gradient-to-r ${s.accent} rounded-b-full opacity-80`} />

                <div className="mb-2.5 md:mb-5 inline-flex items-center justify-center w-9 md:w-14 h-9 md:h-14 rounded-xl md:rounded-2xl bg-gradient-to-br from-[#EAF2FF] to-white border border-[#D6E6FF] shadow-sm">
                  <s.icon className="h-4 md:h-6 w-4 md:w-6 text-[#1261E8]" />
                </div>

                <div className="text-2xl md:text-5xl xl:text-6xl font-extrabold text-[#071E41] tracking-tight leading-none">
                  {s.num}
                </div>

                {/* Mobile: short label only */}
                <div className="md:hidden mt-1.5 text-[13px] font-bold text-[#071E41] leading-tight">
                  {s.shortTitle}
                </div>

                {/* Desktop: full title + description */}
                <div className="hidden md:block mt-3 md:mt-4 text-sm md:text-base font-bold text-[#071E41] leading-snug">
                  {s.title}
                </div>
                <p className="hidden md:block mt-2 text-xs md:text-sm text-[#5B6B82] leading-relaxed">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-5 md:mt-10 text-[10px] md:text-[11px] text-[#6B7280] leading-relaxed text-center max-w-3xl mx-auto">
            Figures shown reflect cumulative platform activity and are indicative of LoanLaabh&apos;s AI-matching and advisory reach. Loan approval, amount, and interest rate are determined solely by the lending institution.
          </p>
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

      {/* ===== SECTION 3: THE LOANLAABH WAY — Smart Eligibility Journey ===== */}
      <section id="how-it-works" className="relative py-20 md:py-28 bg-[#EAF2FF] overflow-hidden scroll-mt-16">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-[#1261E8]/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 fm-matrix-grid opacity-40 pointer-events-none" />

        <div className="container mx-auto px-4 relative">
          <div className="text-center max-w-3xl mx-auto mb-6 md:mb-8">
            <div className="text-sm font-semibold tracking-widest uppercase mb-3 text-[#1261E8]">The LoanLaabh Way</div>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-[#071E41] leading-[1.15]">
              From Guesswork to <span className="text-[#1261E8]">Guided Loan Matching</span>
            </h2>
            <p className="mt-5 text-lg text-[#42526B] leading-relaxed">
              Loan applications should not depend on guesswork. LoanLaabh uses FinMatrix AI&trade; to study your profile, compare it with lender criteria, and guide you toward loan options that may be more suitable before you apply.
            </p>
          </div>

          {/* ============ DESKTOP: 5-step curved journey ============ */}
          <div className="hidden lg:block relative mt-24 pb-4">
            {/* Curved dashed connector — behind the circles */}
            <svg className="absolute top-8 left-0 w-full h-40 pointer-events-none" viewBox="0 0 1200 160" preserveAspectRatio="none" fill="none">
              <path
                d="M 90 100 Q 260 20 360 90 Q 480 160 600 60 Q 720 -30 840 90 Q 960 200 1110 100"
                stroke="#1261E8"
                strokeWidth="2.5"
                strokeDasharray="7 9"
                strokeLinecap="round"
                opacity="0.55"
              />
              {/* Small dot markers along the path */}
              <circle cx="90" cy="100" r="4" fill="#1261E8" />
              <circle cx="360" cy="90" r="4" fill="#1261E8" />
              <circle cx="600" cy="60" r="6" fill="#0B4FC4" />
              <circle cx="840" cy="90" r="4" fill="#1261E8" />
              <circle cx="1110" cy="100" r="4" fill="#1261E8" />
            </svg>

            <div className="grid grid-cols-5 gap-4 relative">
              {JOURNEY_STEPS.map((s, i) => {
                const isCenter = !!s.highlight
                const yOffset = isCenter ? '-translate-y-6' : ''
                return (
                  <div key={i} className={`flex flex-col items-center text-center ${yOffset} fm-fade-up`} style={{ animationDelay: `${i * 0.12}s` }}>
                    {/* FinMatrix AI ribbon (center step only) */}
                    {isCenter && (
                      <div className="mb-3 inline-flex items-center gap-1.5 bg-gradient-to-r from-[#1261E8] to-[#0B4FC4] text-white text-[11px] font-bold tracking-wider uppercase px-3 py-1.5 rounded-full shadow-lg shadow-blue-200">
                        <Sparkles className="h-3.5 w-3.5" /> FinMatrix AI&trade; Core
                      </div>
                    )}

                    {/* Icon node */}
                    <div className={`relative ${isCenter ? 'w-24 h-24' : 'w-20 h-20'} rounded-3xl flex items-center justify-center shrink-0 mb-5 ${isCenter ? 'bg-gradient-to-br from-[#1261E8] to-[#0B4FC4] text-white shadow-[0_20px_40px_rgba(18,97,232,0.35)]' : 'bg-white text-[#1261E8] border-2 border-[#1261E8]/25 shadow-[0_10px_28px_rgba(18,97,232,0.15)]'}`}>
                      {isCenter && <div className="absolute inset-0 rounded-3xl bg-[#1261E8]/40 blur-2xl -z-10 fm-pulse-dot" />}
                      <s.icon className={isCenter ? 'h-10 w-10' : 'h-8 w-8'} />
                      <span className={`absolute -top-2.5 -right-2.5 ${isCenter ? 'bg-white text-[#1261E8] border-2 border-[#1261E8]' : 'bg-[#1261E8] text-white'} text-xs font-bold rounded-full w-7 h-7 flex items-center justify-center shadow-md`}>
                        {i + 1}
                      </span>
                    </div>

                    {/* Card */}
                    <div className={`w-full rounded-2xl p-5 text-left ${isCenter ? 'bg-white border-2 border-[#1261E8]/30 shadow-[0_20px_60px_rgba(18,97,232,0.15)]' : 'bg-white/80 backdrop-blur border border-[#E3ECFA] shadow-[0_2px_12px_rgba(7,30,65,0.04)]'}`}>
                      <h3 className={`font-bold text-[#071E41] ${isCenter ? 'text-lg' : 'text-base'} leading-tight`}>{s.title}</h3>
                      <p className="text-[#42526B] mt-2 text-xs leading-relaxed">{s.desc}</p>
                      <div className="mt-3.5 flex flex-wrap gap-1.5">
                        {s.chips.map(chip => (
                          <span key={chip} className="inline-flex items-center text-[10px] font-semibold bg-[#EAF2FF] text-[#1261E8] rounded-full px-2 py-0.5 border border-[#E3ECFA]">{chip}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* ============ MOBILE: vertical timeline ============ */}
          <div className="lg:hidden mt-10 relative">
            <div className="absolute left-8 top-4 bottom-4 w-px border-l-2 border-dashed border-[#1261E8]/40" />
            <div className="space-y-5">
              {JOURNEY_STEPS.map((s, i) => {
                const isCenter = !!s.highlight
                return (
                  <div key={i} className="relative flex gap-4 items-start fm-fade-up" style={{ animationDelay: `${i * 0.1}s` }}>
                    {/* Icon node */}
                    <div className={`relative shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center z-10 ${isCenter ? 'bg-gradient-to-br from-[#1261E8] to-[#0B4FC4] text-white shadow-[0_10px_28px_rgba(18,97,232,0.35)]' : 'bg-white text-[#1261E8] border-2 border-[#1261E8]/25 shadow-md'}`}>
                      <s.icon className="h-6 w-6" />
                      <span className={`absolute -top-2 -right-2 ${isCenter ? 'bg-white text-[#1261E8] border-2 border-[#1261E8]' : 'bg-[#1261E8] text-white'} text-[10px] font-bold rounded-full w-6 h-6 flex items-center justify-center`}>
                        {i + 1}
                      </span>
                    </div>

                    {/* Card */}
                    <div className={`flex-1 rounded-2xl p-4 ${isCenter ? 'bg-white border-2 border-[#1261E8]/30 shadow-[0_12px_32px_rgba(18,97,232,0.12)]' : 'bg-white border border-[#E3ECFA] shadow-[0_2px_10px_rgba(7,30,65,0.04)]'}`}>
                      {isCenter && (
                        <div className="mb-2 inline-flex items-center gap-1 bg-gradient-to-r from-[#1261E8] to-[#0B4FC4] text-white text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full">
                          <Sparkles className="h-3 w-3" /> FinMatrix AI&trade; Core
                        </div>
                      )}
                      <h3 className="font-bold text-[#071E41] text-base leading-tight">{s.title}</h3>
                      <p className="text-[#42526B] mt-1.5 text-sm leading-relaxed">{s.desc}</p>
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {s.chips.map(chip => (
                          <span key={chip} className="inline-flex items-center text-[10px] font-semibold bg-[#EAF2FF] text-[#1261E8] rounded-full px-2 py-0.5 border border-[#E3ECFA]">{chip}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* CTAs */}
          <div className="mt-14 md:mt-16 flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link href="/eligibility">
              <Button size="lg" className="w-full sm:w-auto h-12 px-8 text-base font-semibold bg-[#1261E8] hover:bg-[#0B4FC4] rounded-2xl shadow-lg shadow-blue-200">
                Check Free Eligibility <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 px-8 text-base font-semibold rounded-2xl border-[#16A34A] bg-white text-[#16A34A] hover:bg-emerald-50 hover:text-[#16A34A]">
                <MessageCircle className="mr-2 h-5 w-5" /> Talk on WhatsApp
              </Button>
            </a>
          </div>

          {/* Compliance line */}
          <p className="text-xs text-[#42526B] leading-relaxed text-center mt-6 max-w-3xl mx-auto px-4">
            Initial eligibility check is based on your self-declared profile and does not directly affect your CIBIL score. Final approval, loan amount, interest rate, and disbursal are decided only by the lending institution.
          </p>
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
                  Check Free Eligibility <ArrowRight className="ml-2 h-5 w-5" />
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
                <Button size="sm" className="mt-4 bg-[#1261E8] hover:bg-[#0B4FC4] rounded-xl font-semibold w-fit">Check Free Eligibility <ArrowRight className="ml-1.5 h-4 w-4" /></Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SECTION 7: TRUSTED PARTNERS ===== */}
      <section className="relative py-16 md:py-20 bg-[#EAF2FF] overflow-hidden">
        <div className="absolute -top-32 -right-20 w-[500px] h-[500px] bg-[#1261E8]/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-20 w-[400px] h-[400px] bg-[#16A34A]/8 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 relative">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="text-sm font-semibold tracking-widest uppercase mb-3 text-[#1261E8]">Our Trusted Partners</div>
            <h2 className="text-3xl md:text-4xl xl:text-5xl font-extrabold text-[#071E41] tracking-tight leading-[1.1]">
              Compared Across <span className="text-[#1261E8]">{LENDERS.length}+ Trusted</span> Banks &amp; NBFCs
            </h2>
            <p className="mt-4 text-base md:text-lg text-[#42526B] leading-relaxed">
              FinMatrix AI&trade; evaluates your profile against eligibility rules from India&apos;s leading banks and RBI-regulated NBFCs.
            </p>

            <div className="mt-5 flex flex-wrap gap-2 justify-center">
              {['RBI-Regulated Lenders', 'Banks & NBFCs', 'AI-Matched'].map(chip => (
                <span key={chip} className="inline-flex items-center gap-1.5 bg-white border border-[#E3ECFA] rounded-full px-3 py-1.5 text-xs font-semibold text-[#071E41] shadow-sm">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#16A34A]" /> {chip}
                </span>
              ))}
            </div>
          </div>

          {/* Two-row marquee */}
          <div className="marquee-track relative marquee-mask">
            <div className="flex gap-3 animate-marquee-left w-max mb-3">
              {[...LENDERS.slice(0, 18), ...LENDERS.slice(0, 18)].map((l, i) => (
                <LenderPill key={`r1-${i}`} name={l.name} domain={l.domain} />
              ))}
            </div>
            <div className="flex gap-3 animate-marquee-right w-max">
              {[...LENDERS.slice(18), ...LENDERS.slice(18)].map((l, i) => (
                <LenderPill key={`r2-${i}`} name={l.name} domain={l.domain} />
              ))}
            </div>
          </div>

          <p className="mt-8 text-xs text-[#6B7280] leading-relaxed text-center max-w-3xl mx-auto">
            Logos shown are for informational purposes and represent well-known lenders operating in India. LoanLaabh does not lend directly &mdash; final approval decisions are made by the lending institution.
          </p>
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
