import Link from 'next/link'
import Navbar from '@/components/site/navbar'
import Footer from '@/components/site/footer'
import { Button } from '@/components/ui/button'
import { ArrowRight, CreditCard, Bell, MessageCircle, CheckCircle2 } from 'lucide-react'

export const metadata = {
  title: 'Credit Cards — Coming Soon | LoanLaabh',
  description: 'Smart credit card matching is coming soon to LoanLaabh. Meanwhile, check your loan eligibility with FinMatrix AI™.',
}

const WHATSAPP_URL = 'https://wa.me/917770024242'

export default function CreditCardsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <section className="relative overflow-hidden bg-gradient-to-br from-[#0A1628] via-[#0E2240] to-[#123A6E] min-h-[70vh] flex items-center">
        <div className="absolute inset-0 fm-matrix-grid" />
        <div className="container mx-auto px-4 relative py-20 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-amber-500/15 border border-amber-500/30 rounded-full px-4 py-1.5 text-sm text-amber-300 mb-6">
              <Bell className="h-4 w-4" /> Coming Soon
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight tracking-tight">
              Smart Credit Card Matching is <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5B9BF3] to-[#8BC0FF]">On Its Way.</span>
            </h1>
            <p className="mt-5 text-lg text-slate-300 max-w-xl leading-relaxed">
              We are bringing FinMatrix AI™ to credit cards — matching you with cards that fit your spending, income, and credit profile. No more guessing which card you will get approved for.
            </p>
            <div className="mt-7 space-y-2.5">
              {['Cards matched to your CIBIL band', 'Cashback, travel & lifestyle comparisons', 'Approval-chance insights before you apply'].map(f => (
                <div key={f} className="flex items-center gap-2.5 text-slate-200 text-sm"><CheckCircle2 className="h-4 w-4 text-[#22C55E]" /> {f}</div>
              ))}
            </div>
            <div className="mt-9 flex flex-col sm:flex-row gap-4">
              <a href={`${WHATSAPP_URL}?text=${encodeURIComponent('Hi! Please notify me when LoanLaabh Credit Cards launches.')}`} target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="w-full sm:w-auto h-12 px-8 font-semibold bg-[#1A6FE8] hover:bg-[#1559c4] rounded-lg shadow-xl shadow-blue-900/40"><MessageCircle className="mr-2 h-5 w-5" /> Notify Me on WhatsApp</Button>
              </a>
              <Link href="/eligibility">
                <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 px-8 font-semibold rounded-lg border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white">Check Loan Eligibility <ArrowRight className="ml-2 h-5 w-5" /></Button>
              </Link>
            </div>
          </div>
          <div className="relative hidden lg:block">
            <div className="absolute -inset-4 bg-[#1A6FE8]/20 blur-3xl rounded-full" />
            <img src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=900&q=80" alt="Professional with credit card" className="relative rounded-2xl shadow-2xl w-full object-cover aspect-[4/3] border border-white/10" />
            <div className="absolute -bottom-5 -left-5 bg-white rounded-xl fm-card-shadow p-4 flex items-center gap-3">
              <div className="bg-blue-50 text-[#1A6FE8] rounded-lg w-10 h-10 flex items-center justify-center"><CreditCard className="h-5 w-5" /></div>
              <div>
                <div className="text-xs text-[#64748B]">Launching</div>
                <div className="font-bold text-[#0A1628] text-sm">Very Soon</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
