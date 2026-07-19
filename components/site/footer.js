import Link from 'next/link'
import { Phone, Mail, Instagram, Facebook, ShieldCheck, Users, Heart } from 'lucide-react'

const HELPLINE = '7770024242'
const INSTAGRAM_URL = 'https://www.instagram.com/loanlaabh'
const FACEBOOK_URL = 'https://www.facebook.com/LoanLaabh'

export default function Footer() {
  return (
    <footer className="bg-[#071E41] text-slate-200">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-3 gap-4 md:gap-8">
          {/* COLUMN 1: Brand */}
          <div className="min-w-0">
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
              <span className="bg-white rounded-lg md:rounded-xl w-8 h-8 md:w-12 md:h-12 flex items-center justify-center p-1 md:p-1.5 shrink-0"><img src="/logo-icon.png" alt="LoanLaabh logo" className="w-full h-full object-contain" /></span>
              <div className="min-w-0">
                <div className="font-bold text-sm md:text-xl text-white leading-tight">Loan<span className="text-[#8BC0FF]">Laabh</span></div>
                <div className="text-[10px] md:text-xs text-[#8BC0FF] font-medium leading-tight">Apply Smarter.<br className="md:hidden" /> Borrow Better.</div>
              </div>
            </div>
            <p className="mt-3 text-[10px] md:text-xs text-[#B7C7DC]">Powered by FinMatrix AI&trade;</p>
            <a href={`tel:${HELPLINE}`} className="mt-4 md:mt-5 flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-[#8BC0FF] hover:text-white font-semibold w-fit">
              <Phone className="h-3.5 w-3.5 md:h-4 md:w-4 shrink-0" /> <span className="break-all">{HELPLINE}</span>
            </a>
            <a href="mailto:help@loanlaabh.com" className="mt-1.5 md:mt-2 flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-[#B7C7DC] hover:text-white font-medium w-fit break-all">
              <Mail className="h-3.5 w-3.5 md:h-4 md:w-4 shrink-0" /> <span className="break-all">help@loanlaabh.com</span>
            </a>
            {/* Social Media */}
            <div className="mt-4 md:mt-5 flex items-center gap-2 md:gap-3">
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow LoanLaabh on Instagram"
                className="w-8 h-8 md:w-9 md:h-9 rounded-full border border-white/20 flex items-center justify-center text-[#B7C7DC] hover:text-white hover:border-[#8BC0FF] hover:bg-white/5 transition-all"
              >
                <Instagram className="h-3.5 w-3.5 md:h-4 md:w-4" />
              </a>
              <a
                href={FACEBOOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow LoanLaabh on Facebook"
                className="w-8 h-8 md:w-9 md:h-9 rounded-full border border-white/20 flex items-center justify-center text-[#B7C7DC] hover:text-white hover:border-[#8BC0FF] hover:bg-white/5 transition-all"
              >
                <Facebook className="h-3.5 w-3.5 md:h-4 md:w-4" />
              </a>
            </div>
            {/* Trust badges (moved from bottom) */}
            <div className="mt-4 md:mt-5 flex flex-col gap-2 text-[11px] md:text-xs">
              <span className="inline-flex items-center gap-1.5 text-[#B7C7DC]">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span className="font-medium">100% Secure</span>
              </span>
              <span className="inline-flex items-center gap-1.5 text-[#B7C7DC]">
                <Users className="h-3.5 w-3.5 text-[#8BC0FF] shrink-0" />
                <span className="font-medium">Trusted by Millions</span>
              </span>
            </div>
          </div>

          {/* COLUMN 2: Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-3 md:mb-4 text-xs md:text-sm uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2 md:space-y-2.5 text-xs md:text-sm text-[#B7C7DC]">
              <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/eligibility" className="hover:text-white transition-colors">Eligibility</Link></li>
              <li><Link href="/cibil-score" className="hover:text-white transition-colors">CIBIL Score</Link></li>
              <li><Link href="/calculators" className="hover:text-white transition-colors">EMI Calculator</Link></li>
              <li><Link href="/credit-cards" className="hover:text-white transition-colors">Credit Cards</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
              <li><Link href="/#insights" className="hover:text-white transition-colors">Insights</Link></li>
              <li><a href={`tel:${HELPLINE}`} className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* COLUMN 3: Legal */}
          <div>
            <h4 className="font-semibold text-white mb-3 md:mb-4 text-xs md:text-sm uppercase tracking-wider">Legal</h4>
            <ul className="space-y-2 md:space-y-2.5 text-xs md:text-sm text-[#B7C7DC]">
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-white/10">
          <p className="text-xs leading-relaxed text-[#B7C7DC] max-w-4xl">
            <strong className="text-white">Disclaimer:</strong> LoanLaabh is an AI-powered loan discovery platform. We do not lend money directly. Loan approval, interest rates, loan amount, processing fees, and disbursal are determined solely by the lending institution after its own assessment and verification. FinMatrix AI&trade; provides eligibility insights only and does not guarantee loan approval.
          </p>
          <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <p className="text-xs text-[#6B7F9E]">&copy; 2025 LoanLaabh. All rights reserved.</p>
            {/* Made in India badge stays in copyright row */}
            <span className="inline-flex items-center gap-1.5 text-xs text-[#B7C7DC]">
              <Heart className="h-3.5 w-3.5 text-rose-400 fill-rose-400 shrink-0" />
              <span className="font-medium">Built with Love — Made in India</span>
              <span aria-label="India flag" className="ml-0.5 text-sm leading-none">🇮🇳</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
