import Link from 'next/link'
import Navbar from '@/components/site/navbar'
import Footer from '@/components/site/footer'
import StickyMobileCta from '@/components/site/sticky-mobile-cta'
import { Button } from '@/components/ui/button'
import { ArrowRight, CreditCard, Bell, Phone, CheckCircle2 } from 'lucide-react'

export const metadata = {
  title: 'Credit Cards — Coming Soon | LoanLaabh',
  description: 'Smart credit card matching is coming soon to LoanLaabh. Meanwhile, check your loan eligibility with FinMatrix AI™.',
}

const HELPLINE = '7770024242'

export default function CreditCardsPage() {
  return (
    <div className="min-h-screen bg-[#F7FAFF]">
      <Navbar />

      <section className="relative overflow-hidden bg-gradient-to-br from-white via-[#F7FAFF] to-[#EAF2FF] min-h-[70vh] flex items-center">
        <div className="absolute inset-0 fm-matrix-grid opacity-60" />
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-[#1261E8]/10 rounded-full blur-3xl" />
        <div className="container mx-auto px-4 relative py-20 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-4 py-1.5 text-sm text-amber-700 font-medium mb-6 shadow-sm">
              <Bell className="h-4 w-4" /> Coming Soon
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#071E41] leading-tight tracking-tight">
              Smart Credit Card Matching is <span className="text-[#1261E8]">On Its Way.</span>
            </h1>
            <p className="mt-5 text-lg text-[#42526B] max-w-xl leading-relaxed">
              We are bringing FinMatrix AI™ to credit cards — matching you with cards that fit your spending, income, and credit profile. No more guessing which card you will get approved for.
            </p>
            <div className="mt-7 space-y-2.5">
              {['Cards matched to your CIBIL band', 'Cashback, travel & lifestyle comparisons', 'Approval-chance insights before you apply'].map(f => (
                <div key={f} className="flex items-center gap-2.5 text-[#071E41] text-sm font-medium"><CheckCircle2 className="h-4 w-4 text-[#16A34A]" /> {f}</div>
              ))}
            </div>
            <div className="mt-9 flex flex-col sm:flex-row gap-4">
              <a href={`tel:${HELPLINE}`}>
                <Button size="lg" className="w-full sm:w-auto h-12 px-8 font-semibold bg-[#1261E8] hover:bg-[#0B4FC4] rounded-2xl shadow-lg shadow-blue-200"><Phone className="mr-2 h-5 w-5" /> Call Helpline: {HELPLINE}</Button>
              </a>
              <Link href="/eligibility">
                <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 px-8 font-semibold rounded-2xl border-[#1261E8] bg-white text-[#1261E8] hover:bg-[#EAF2FF] hover:text-[#1261E8]">Check Free Eligibility <ArrowRight className="ml-2 h-5 w-5" /></Button>
              </Link>
            </div>
          </div>
          <div className="relative hidden lg:block">
            <div className="absolute -inset-4 bg-[#1261E8]/15 blur-3xl rounded-full" />
            <img src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=900&q=80" alt="Professional with credit card" className="relative rounded-3xl shadow-[0_20px_60px_rgba(7,30,65,0.15)] w-full object-cover aspect-[4/3] border border-white" />
            <div className="absolute -bottom-5 -left-5 bg-white rounded-2xl fm-card-shadow p-4 flex items-center gap-3 border border-[#E3ECFA]">
              <div className="bg-[#EAF2FF] text-[#1261E8] rounded-lg w-10 h-10 flex items-center justify-center"><CreditCard className="h-5 w-5" /></div>
              <div>
                <div className="text-xs text-[#42526B]">Launching</div>
                <div className="font-bold text-[#071E41] text-sm">Very Soon</div>
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
