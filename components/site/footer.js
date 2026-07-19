import Link from 'next/link'
import { Phone, Mail, Instagram, Facebook, ShieldCheck, Users, Heart } from 'lucide-react'

const HELPLINE = '7770024242'
const INSTAGRAM_URL = 'https://www.instagram.com/loanlaabh'
const FACEBOOK_URL = 'https://www.facebook.com/LoanLaabh'

export default function Footer() {
  return (
    <footer className="bg-[#071E41] text-slate-200">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
          {/* COLUMN 1: Brand */}
          <div>
            <div className="flex items-center gap-3">
              <span className="bg-white rounded-xl w-12 h-12 flex items-center justify-center p-1.5 shrink-0"><img src="/logo-icon.png" alt="LoanLaabh logo" className="w-full h-full object-contain" /></span>
              <div>
                <div className="font-bold text-xl text-white leading-tight">Loan<span className="text-[#8BC0FF]">Laabh</span></div>
                <div className="text-xs text-[#8BC0FF] font-medium">Apply Smarter. Borrow Better.</div>
              </div>
            </div>
            <p className="mt-3 text-xs text-[#B7C7DC]">Powered by FinMatrix AI&trade;</p>
            <a href={`tel:${HELPLINE}`} className="mt-5 flex items-center gap-2 text-sm text-[#8BC0FF] hover:text-white font-semibold w-fit">
              <Phone className="h-4 w-4" /> Helpline: {HELPLINE}
            </a>
            <a href="mailto:help@loanlaabh.com" className="mt-2 flex items-center gap-2 text-sm text-[#B7C7DC] hover:text-white font-medium w-fit break-all">
              <Mail className="h-4 w-4 shrink-0" /> help@loanlaabh.com
            </a>
            {/* Social Media */}
            <div className="mt-5 flex items-center gap-3">
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow LoanLaabh on Instagram"
                className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-[#B7C7DC] hover:text-white hover:border-[#8BC0FF] hover:bg-white/5 transition-all"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href={FACEBOOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow LoanLaabh on Facebook"
                className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-[#B7C7DC] hover:text-white hover:border-[#8BC0FF] hover:bg-white/5 transition-all"
              >
                <Facebook className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/*
            Wrapper: on mobile behaves as single grid cell (col 2)
            containing Quick Links + Legal stacked.
            On desktop uses `md:contents` so children become
            direct grid children → col 2 and col 3.
          */}
          <div className="md:contents">
            {/* COLUMN 2: Quick Links */}
            <div>
              <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Quick Links</h4>
              <ul className="space-y-2.5 text-sm text-[#B7C7DC]">
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
            {/* COLUMN 3 (desktop) / Below Quick Links (mobile): Legal */}
            <div className="mt-8 md:mt-0">
              <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Legal</h4>
              <ul className="space-y-2.5 text-sm text-[#B7C7DC]">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-white/10">
          <p className="text-xs leading-relaxed text-[#B7C7DC] max-w-4xl">
            <strong className="text-white">Disclaimer:</strong> LoanLaabh is an AI-powered loan discovery platform. We do not lend money directly. Loan approval, interest rates, loan amount, processing fees, and disbursal are determined solely by the lending institution after its own assessment and verification. FinMatrix AI&trade; provides eligibility insights only and does not guarantee loan approval.
          </p>
          <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <p className="text-xs text-[#6B7F9E]">&copy; 2025 LoanLaabh. All rights reserved.</p>
            {/* Trust Badges */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
              <span className="inline-flex items-center gap-1.5 text-[#B7C7DC]">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span className="font-medium">100% Secure</span>
              </span>
              <span className="hidden md:inline text-white/10">|</span>
              <span className="inline-flex items-center gap-1.5 text-[#B7C7DC]">
                <Users className="h-3.5 w-3.5 text-[#8BC0FF]" />
                <span className="font-medium">Trusted by Millions</span>
              </span>
              <span className="hidden md:inline text-white/10">|</span>
              <span className="inline-flex items-center gap-1.5 text-[#B7C7DC]">
                <Heart className="h-3.5 w-3.5 text-rose-400 fill-rose-400" />
                <span className="font-medium">Built with Love — Made in India</span>
                <span aria-label="India flag" className="ml-0.5 text-sm leading-none">🇮🇳</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
