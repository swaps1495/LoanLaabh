import Link from 'next/link'
import { MessageCircle, Mail } from 'lucide-react'

const WHATSAPP_URL = 'https://wa.me/917770024242'

export default function Footer() {
  return (
    <footer className="bg-[#071E41] text-slate-200">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3">
              <span className="bg-white rounded-xl w-12 h-12 flex items-center justify-center p-1.5 shrink-0"><img src="/logo-icon.png" alt="LoanLaabh logo" className="w-full h-full object-contain" /></span>
              <div>
                <div className="font-bold text-xl text-white leading-tight">Loan<span className="text-[#8BC0FF]">Laabh</span></div>
                <div className="text-xs text-[#8BC0FF] font-medium">Apply Smarter. Borrow Better.</div>
              </div>
            </div>
            <p className="mt-3 text-xs text-[#B7C7DC]">Powered by FinMatrix AI&trade;</p>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="mt-5 flex items-center gap-2 text-sm text-[#7BD891] hover:text-white font-medium w-fit">
              <MessageCircle className="h-4 w-4" /> WhatsApp: +91 77700 24242
            </a>
            <a href="mailto:help@loanlaabh.com" className="mt-2 flex items-center gap-2 text-sm text-[#B7C7DC] hover:text-white font-medium w-fit">
              <Mail className="h-4 w-4" /> help@loanlaabh.com
            </a>
          </div>
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
              <li><a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Legal</h4>
            <ul className="space-y-2.5 text-sm text-[#B7C7DC]">
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-white/10">
          <p className="text-xs leading-relaxed text-[#B7C7DC] max-w-4xl">
            <strong className="text-white">Disclaimer:</strong> LoanLaabh is an AI-powered loan discovery platform. We do not lend money directly. Loan approval, interest rates, loan amount, processing fees, and disbursal are determined solely by the lending institution after its own assessment and verification. FinMatrix AI&trade; provides eligibility insights only and does not guarantee loan approval.
          </p>
          <p className="text-xs text-[#6B7F9E] mt-6">&copy; 2025 LoanLaabh. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
