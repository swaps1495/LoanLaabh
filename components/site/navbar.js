'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getSupabaseBrowser } from '@/lib/supabase-browser'
import { Button } from '@/components/ui/button'
import { Menu, X, ArrowRight } from 'lucide-react'

const WHATSAPP_URL = 'https://wa.me/919999999999'

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'Loan Products', href: '/#products' },
  { label: 'Insights', href: '/#insights' },
  { label: 'Contact', href: WHATSAPP_URL, external: true },
]

export default function Navbar() {
  const [authed, setAuthed] = useState(false)
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const sb = getSupabaseBrowser()
    sb.auth.getSession().then(({ data }) => setAuthed(!!data.session))
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`sticky top-0 z-50 bg-white/90 backdrop-blur-md transition-shadow ${scrolled ? 'shadow-[0_4px_24px_rgba(10,22,40,0.08)]' : 'border-b border-slate-100'}`}>
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 font-bold text-xl text-[#0A1628]">
          <span className="bg-gradient-to-br from-[#1A6FE8] to-[#0A1628] text-white rounded-lg w-9 h-9 flex items-center justify-center shadow-md text-lg">L</span>
          <span className="leading-none">
            Loan<span className="text-[#1A6FE8]">Laabh</span>
            <span className="block text-[9px] font-medium tracking-wide text-[#64748B] mt-0.5">Apply Smarter. Borrow Better.</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-[#0A1628]">
          {NAV_LINKS.map(l => l.external ? (
            <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" className="hover:text-[#1A6FE8] transition-colors">{l.label}</a>
          ) : (
            <Link key={l.label} href={l.href} className="hover:text-[#1A6FE8] transition-colors">{l.label}</Link>
          ))}
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

      {open && (
        <div className="lg:hidden bg-white border-t border-slate-100 shadow-lg">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-1">
            {NAV_LINKS.map(l => l.external ? (
              <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" className="py-2.5 px-2 rounded-lg font-medium text-[#0A1628] hover:bg-slate-50" onClick={() => setOpen(false)}>{l.label}</a>
            ) : (
              <Link key={l.label} href={l.href} className="py-2.5 px-2 rounded-lg font-medium text-[#0A1628] hover:bg-slate-50" onClick={() => setOpen(false)}>{l.label}</Link>
            ))}
            <div className="flex flex-col gap-2 pt-3 border-t border-slate-100 mt-2">
              <Link href="/eligibility" onClick={() => setOpen(false)}>
                <Button className="w-full bg-[#1A6FE8] hover:bg-[#1559c4] rounded-lg h-11 font-semibold">Find My Loan Match <ArrowRight className="ml-1.5 h-4 w-4" /></Button>
              </Link>
              {authed ? (
                <Link href="/dashboard" onClick={() => setOpen(false)}><Button variant="outline" className="w-full rounded-lg h-11 font-semibold">Dashboard</Button></Link>
              ) : (
                <Link href="/login" onClick={() => setOpen(false)}><Button variant="outline" className="w-full rounded-lg h-11 font-semibold">Login</Button></Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
