'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { getSupabaseBrowser } from '@/lib/supabase-browser'
import { Button } from '@/components/ui/button'
import { Menu, X, ArrowRight, ChevronDown, Gauge, Briefcase, TrendingUp, Home as HomeIcon, Building2, Car, RefreshCcw, LineChart, Calculator, CreditCard, Phone } from 'lucide-react'

const HELPLINE = '7770024242'

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
  const [menu, setMenu] = useState(null)
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
    <header ref={navRef} className={`sticky top-0 z-50 bg-white/95 backdrop-blur-md transition-shadow ${scrolled ? 'shadow-[0_4px_18px_rgba(7,30,65,0.07)]' : 'border-b border-[#E3ECFA]'}`}>
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" onClick={closeAll} className="flex items-center font-bold text-xl text-[#071E41] shrink-0">
          {/* Desktop: horizontal logo */}
          <img src="/logo-horizontal.png" alt="LoanLaabh — Apply Smarter. Borrow Better." className="hidden sm:block h-11 md:h-12 w-auto object-contain" />
          {/* Mobile: icon + text */}
          <span className="sm:hidden flex items-center gap-2">
            <img src="/logo-icon.png" alt="LoanLaabh logo" className="w-9 h-9 object-contain" />
            <span className="leading-none">
              Loan<span className="text-[#1261E8]">Laabh</span>
            </span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-[#071E41]">
          <div className="relative">
            <button onClick={() => setMenu(menu === 'cibil' ? null : 'cibil')} className={`flex items-center gap-1 hover:text-[#1261E8] transition-colors py-2 ${menu === 'cibil' ? 'text-[#1261E8]' : ''}`}>
              CIBIL Score <ChevronDown className={`h-4 w-4 transition-transform ${menu === 'cibil' ? 'rotate-180' : ''}`} />
            </button>
            {menu === 'cibil' && (
              <div className="absolute left-0 top-full mt-1 w-80 bg-white rounded-2xl shadow-[0_12px_40px_rgba(7,30,65,0.12)] border border-[#E3ECFA] p-2 fm-pop">
                <div className="bg-[#EAF2FF] border border-[#E3ECFA] rounded-xl p-3.5 mb-2 flex items-center gap-3">
                  <div className="bg-white text-[#1261E8] rounded-lg w-10 h-10 flex items-center justify-center shadow-sm"><Gauge className="h-5 w-5" /></div>
                  <div>
                    <div className="text-[#071E41] text-sm font-semibold">Free CIBIL Insights</div>
                    <div className="text-[#42526B] text-xs">No impact on your score</div>
                  </div>
                </div>
                {CIBIL_ITEMS.map(it => (
                  <Link key={it.label} href={it.href} onClick={closeAll} className="flex flex-col px-3.5 py-2.5 rounded-lg hover:bg-[#F7FAFF]">
                    <span className="font-semibold text-[#071E41] text-sm">{it.label}</span>
                    <span className="text-xs text-[#6B7280]">{it.desc}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <button onClick={() => setMenu(menu === 'loans' ? null : 'loans')} className={`flex items-center gap-1 hover:text-[#1261E8] transition-colors py-2 ${menu === 'loans' ? 'text-[#1261E8]' : ''}`}>
              Loans <ChevronDown className={`h-4 w-4 transition-transform ${menu === 'loans' ? 'rotate-180' : ''}`} />
            </button>
            {menu === 'loans' && (
              <div className="absolute left-0 top-full mt-1 w-72 bg-white rounded-2xl shadow-[0_12px_40px_rgba(7,30,65,0.12)] border border-[#E3ECFA] p-2 fm-pop">
                {LOAN_ITEMS.map(it => (
                  <Link key={it.label} href={it.href} onClick={closeAll} className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg hover:bg-[#F7FAFF]">
                    <span className="bg-[#EAF2FF] text-[#1261E8] rounded-lg w-8 h-8 flex items-center justify-center shrink-0"><it.icon className="h-4 w-4" /></span>
                    <span className="font-medium text-[#071E41] text-sm">{it.label}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link href="/calculators" onClick={closeAll} className="hover:text-[#1261E8] transition-colors">Calculators</Link>

          <Link href="/credit-cards" onClick={closeAll} className="flex items-center gap-1.5 hover:text-[#1261E8] transition-colors">
            Credit Cards <span className="text-[9px] font-bold bg-amber-100 text-amber-700 rounded-full px-1.5 py-0.5">SOON</span>
          </Link>
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <a href={`tel:${HELPLINE}`} className="flex items-center gap-1.5 text-sm font-semibold text-[#071E41] hover:text-[#1261E8] transition-colors px-3 py-1.5 rounded-lg hover:bg-[#EAF2FF]">
            <Phone className="h-3.5 w-3.5 text-[#1261E8]" />
            <span className="text-[11px] text-[#6B7280] font-medium leading-none">Need help?</span>
            <span className="tabular-nums">{HELPLINE}</span>
          </a>
          {authed ? (
            <Link href="/dashboard"><Button variant="ghost" size="sm" className="text-[#071E41] font-semibold hover:text-[#1261E8] hover:bg-[#EAF2FF]">Dashboard</Button></Link>
          ) : (
            <Link href="/login"><Button variant="ghost" size="sm" className="text-[#071E41] font-semibold hover:text-[#1261E8] hover:bg-[#EAF2FF]">Login</Button></Link>
          )}
          <Link href="/eligibility">
            <Button size="sm" className="bg-[#1261E8] hover:bg-[#0B4FC4] rounded-xl h-10 px-5 font-semibold shadow-md shadow-blue-200">
              Check Free Eligibility <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <button className="lg:hidden p-2 text-[#071E41]" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden bg-white border-t border-[#E3ECFA] shadow-lg max-h-[80vh] overflow-y-auto">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-1">
            <button onClick={() => setMobileGroup(mobileGroup === 'cibil' ? null : 'cibil')} className="flex items-center justify-between py-2.5 px-2 rounded-lg font-medium text-[#071E41] hover:bg-[#F7FAFF]">
              CIBIL Score <ChevronDown className={`h-4 w-4 transition-transform ${mobileGroup === 'cibil' ? 'rotate-180' : ''}`} />
            </button>
            {mobileGroup === 'cibil' && (
              <div className="pl-4 flex flex-col">
                {CIBIL_ITEMS.map(it => (
                  <Link key={it.label} href={it.href} onClick={closeAll} className="py-2 px-2 rounded-lg text-sm text-[#42526B] hover:bg-[#F7FAFF]">{it.label}</Link>
                ))}
              </div>
            )}
            <button onClick={() => setMobileGroup(mobileGroup === 'loans' ? null : 'loans')} className="flex items-center justify-between py-2.5 px-2 rounded-lg font-medium text-[#071E41] hover:bg-[#F7FAFF]">
              Loans <ChevronDown className={`h-4 w-4 transition-transform ${mobileGroup === 'loans' ? 'rotate-180' : ''}`} />
            </button>
            {mobileGroup === 'loans' && (
              <div className="pl-4 flex flex-col">
                {LOAN_ITEMS.map(it => (
                  <Link key={it.label} href={it.href} onClick={closeAll} className="py-2 px-2 rounded-lg text-sm text-[#42526B] hover:bg-[#F7FAFF]">{it.label}</Link>
                ))}
              </div>
            )}
            <Link href="/calculators" onClick={closeAll} className="flex items-center gap-2 py-2.5 px-2 rounded-lg font-medium text-[#071E41] hover:bg-[#F7FAFF]"><Calculator className="h-4 w-4 text-[#1261E8]" /> Calculators</Link>
            <Link href="/credit-cards" onClick={closeAll} className="flex items-center gap-2 py-2.5 px-2 rounded-lg font-medium text-[#071E41] hover:bg-[#F7FAFF]"><CreditCard className="h-4 w-4 text-[#1261E8]" /> Credit Cards <span className="text-[9px] font-bold bg-amber-100 text-amber-700 rounded-full px-1.5 py-0.5">SOON</span></Link>
            <div className="flex flex-col gap-2 pt-3 border-t border-[#E3ECFA] mt-2">
              <a href={`tel:${HELPLINE}`} className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[#EAF2FF] border border-[#D6E6FF] text-[#071E41] font-semibold text-sm hover:bg-[#DDE9FF]">
                <Phone className="h-4 w-4 text-[#1261E8]" /> Call: {HELPLINE}
              </a>
              <Link href="/eligibility" onClick={closeAll}>
                <Button className="w-full bg-[#1261E8] hover:bg-[#0B4FC4] rounded-xl h-11 font-semibold">Check Free Eligibility <ArrowRight className="ml-1.5 h-4 w-4" /></Button>
              </Link>
              {authed ? (
                <Link href="/dashboard" onClick={closeAll}><Button variant="outline" className="w-full rounded-xl h-11 font-semibold border-[#1261E8] text-[#1261E8] hover:bg-[#EAF2FF] hover:text-[#1261E8]">Dashboard</Button></Link>
              ) : (
                <Link href="/login" onClick={closeAll}><Button variant="outline" className="w-full rounded-xl h-11 font-semibold border-[#1261E8] text-[#1261E8] hover:bg-[#EAF2FF] hover:text-[#1261E8]">Login</Button></Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
