'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { getSupabaseBrowser } from '@/lib/supabase-browser'
import { Button } from '@/components/ui/button'
import { Menu, X, ArrowRight, ChevronDown, Gauge, Briefcase, TrendingUp, Home as HomeIcon, Building2, Car, RefreshCcw, LineChart, Calculator, CreditCard } from 'lucide-react'

const CIBIL_ITEMS = [
  { label: 'Check CIBIL Score Free', href: '/cibil-score', desc: 'Know where you stand' },
  { label: 'What is CIBIL Score?', href: '/cibil-score#what', desc: 'Basics explained simply' },
  { label: 'CIBIL Score Range', href: '/cibil-score#range', desc: '300\u2013900 bands decoded' },
  { label: 'Factors Affecting CIBIL', href: '/cibil-score#factors', desc: 'What moves your score' },
  { label: 'Improve CIBIL Score', href: '/cibil-score#improve', desc: 'Practical tips that work' },
  { label: 'CIBIL Score for Loans', href: '/cibil-score#loans', desc: 'Scores lenders look for' },
]

const LOAN_ITEMS = [
  { label: 'Personal Loan', href: '/eligibility', icon: Briefcase },
  { label: 'Business Loan', href: '/eligibility', icon: TrendingUp },
  { label: 'Home Loan', href: '/eligibility', icon: HomeIcon },
  { label: 'Loan Against Property', href: '/eligibility', icon: Building2 },
  { label: 'Used Car Loan', href: '/eligibility', icon: Car },
  { label: 'Balance Transfer', href: '/eligibility', icon: RefreshCcw },
  { label: 'Credit Improvement', href: '/cibil-score#improve', icon: LineChart },
]

export default function Navbar() {
  const [authed, setAuthed] = useState(false)
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [menu, setMenu] = useState(null) // 'cibil' | 'loans' | null
  const [mobileGroup, setMobileGroup] = useState(null)
  const navRef = useRef(null)

  useEffect(() => {
    const sb = getSupabaseBrowser()
    sb.auth.getSession().then(({ data }) => setAuthed(!!data.session))
    const onScroll = () => setScrolled(window.scrollY > 8)
    const onClickAway = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) setMenu(null)
    }
    window.addEventListener('scroll', onScroll)
    document.addEventListener('click', onClickAway)
    return () => { window.removeEventListener('scroll', onScroll); document.removeEventListener('click', onClickAway) }
  }, [])

  const closeAll = () => { setMenu(null); setOpen(false); setMobileGroup(null) }

  return (
    <header ref={navRef} className={`sticky top-0 z-50 bg-white/95 backdrop-blur-md transition-shadow ${scrolled ? 'shadow-[0_4px_24px_rgba(10,22,40,0.08)]' : 'border-b border-slate-100'}`}>
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" onClick={closeAll} className="flex items-center gap-2.5 font-bold text-xl text-[#0A1628]">
          <span className="bg-gradient-to-br from-[#1A6FE8] to-[#0A1628] text-white rounded-lg w-9 h-9 flex items-center justify-center shadow-md text-lg">L</span>
          <span className="leading-none">
            Loan<span className="text-[#1A6FE8]">Laabh</span>
            <span className="block text-[9px] font-medium tracking-wide text-[#64748B] mt-0.5">Apply Smarter. Borrow Better.</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-[#0A1628]">
          {/* CIBIL Score dropdown */}
          <div className="relative">
            <button onClick={() => setMenu(menu === 'cibil' ? null : 'cibil')} className={`flex items-center gap-1 hover:text-[#1A6FE8] transition-colors py-2 ${menu === 'cibil' ? 'text-[#1A6FE8]' : ''}`}>
              CIBIL Score <ChevronDown className={`h-4 w-4 transition-transform ${menu === 'cibil' ? 'rotate-180' : ''}`} />
            </button>
            {menu === 'cibil' && (
              <div className="absolute left-0 top-full mt-1 w-80 bg-white rounded-xl shadow-[0_12px_40px_rgba(10,22,40,0.15)] border border-slate-100 p-2 fm-pop">
                <div className="bg-gradient-to-r from-[#0A1628] to-[#1A6FE8] rounded-lg p-3.5 mb-2 flex items-center gap-3">
                  <Gauge className="h-6 w-6 text-white" />
                  <div>
                    <div className="text-white text-sm font-semibold">Free CIBIL Insights</div>
                    <div className="text-blue-100 text-xs">No impact on your score</div>
                  </div>
                </div>
                {CIBIL_ITEMS.map(it => (
                  <Link key={it.label} href={it.href} onClick={closeAll} className="flex flex-col px-3.5 py-2.5 rounded-lg hover:bg-slate-50">
                    <span className="font-semibold text-[#0A1628] text-sm">{it.label}</span>
                    <span className="text-xs text-[#64748B]">{it.desc}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Loans dropdown */}
          <div className="relative">
            <button onClick={() => setMenu(menu === 'loans' ? null : 'loans')} className={`flex items-center gap-1 hover:text-[#1A6FE8] transition-colors py-2 ${menu === 'loans' ? 'text-[#1A6FE8]' : ''}`}>
              Loans <ChevronDown className={`h-4 w-4 transition-transform ${menu === 'loans' ? 'rotate-180' : ''}`} />
            </button>
            {menu === 'loans' && (
              <div className="absolute left-0 top-full mt-1 w-72 bg-white rounded-xl shadow-[0_12px_40px_rgba(10,22,40,0.15)] border border-slate-100 p-2 fm-pop">
                {LOAN_ITEMS.map(it => (
                  <Link key={it.label} href={it.href} onClick={closeAll} className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg hover:bg-slate-50">
                    <span className="bg-blue-50 text-[#1A6FE8] rounded-lg w-8 h-8 flex items-center justify-center shrink-0"><it.icon className="h-4 w-4" /></span>
                    <span className="font-medium text-[#0A1628] text-sm">{it.label}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link href="/calculators" onClick={closeAll} className="flex items-center gap-1.5 hover:text-[#1A6FE8] transition-colors">
            Calculators
          </Link>

          <Link href="/credit-cards" onClick={closeAll} className="flex items-center gap-1.5 hover:text-[#1A6FE8] transition-colors">
            Credit Cards <span className="text-[9px] font-bold bg-amber-100 text-amber-700 rounded-full px-1.5 py-0.5">SOON</span>
          </Link>
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          {authed ? (
            <Link href="/dashboard"><Button variant="ghost" size="sm" className="text-[#0A1628] font-semibold">Dashboard</Button></Link>
          ) : (
            <Link href="/login"><Button variant="ghost" size="sm" className="text-[#0A1628] font-semibold">Login</Button></Link>
          )}
          <Link href="/eligibility">
            <Button size="sm" className="bg-[#1A6FE8] hover:bg-[#1559c4] rounded-lg h-10 px-5 font-semibold shadow-md shadow-blue-200">
              Find My Loan Match <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <button className="lg:hidden p-2 text-[#0A1628]" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden bg-white border-t border-slate-100 shadow-lg max-h-[80vh] overflow-y-auto">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-1">
            {/* CIBIL group */}
            <button onClick={() => setMobileGroup(mobileGroup === 'cibil' ? null : 'cibil')} className="flex items-center justify-between py-2.5 px-2 rounded-lg font-medium text-[#0A1628] hover:bg-slate-50">
              CIBIL Score <ChevronDown className={`h-4 w-4 transition-transform ${mobileGroup === 'cibil' ? 'rotate-180' : ''}`} />
            </button>
            {mobileGroup === 'cibil' && (
              <div className="pl-4 flex flex-col">
                {CIBIL_ITEMS.map(it => (
                  <Link key={it.label} href={it.href} onClick={closeAll} className="py-2 px-2 rounded-lg text-sm text-[#334155] hover:bg-slate-50">{it.label}</Link>
                ))}
              </div>
            )}
            {/* Loans group */}
            <button onClick={() => setMobileGroup(mobileGroup === 'loans' ? null : 'loans')} className="flex items-center justify-between py-2.5 px-2 rounded-lg font-medium text-[#0A1628] hover:bg-slate-50">
              Loans <ChevronDown className={`h-4 w-4 transition-transform ${mobileGroup === 'loans' ? 'rotate-180' : ''}`} />
            </button>
            {mobileGroup === 'loans' && (
              <div className="pl-4 flex flex-col">
                {LOAN_ITEMS.map(it => (
                  <Link key={it.label} href={it.href} onClick={closeAll} className="py-2 px-2 rounded-lg text-sm text-[#334155] hover:bg-slate-50">{it.label}</Link>
                ))}
              </div>
            )}
            <Link href="/calculators" onClick={closeAll} className="flex items-center gap-2 py-2.5 px-2 rounded-lg font-medium text-[#0A1628] hover:bg-slate-50"><Calculator className="h-4 w-4 text-[#1A6FE8]" /> Calculators</Link>
            <Link href="/credit-cards" onClick={closeAll} className="flex items-center gap-2 py-2.5 px-2 rounded-lg font-medium text-[#0A1628] hover:bg-slate-50"><CreditCard className="h-4 w-4 text-[#1A6FE8]" /> Credit Cards <span className="text-[9px] font-bold bg-amber-100 text-amber-700 rounded-full px-1.5 py-0.5">SOON</span></Link>
            <div className="flex flex-col gap-2 pt-3 border-t border-slate-100 mt-2">
              <Link href="/eligibility" onClick={closeAll}>
                <Button className="w-full bg-[#1A6FE8] hover:bg-[#1559c4] rounded-lg h-11 font-semibold">Find My Loan Match <ArrowRight className="ml-1.5 h-4 w-4" /></Button>
              </Link>
              {authed ? (
                <Link href="/dashboard" onClick={closeAll}><Button variant="outline" className="w-full rounded-lg h-11 font-semibold">Dashboard</Button></Link>
              ) : (
                <Link href="/login" onClick={closeAll}><Button variant="outline" className="w-full rounded-lg h-11 font-semibold">Login</Button></Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
