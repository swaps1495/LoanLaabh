'use client'
import { useMemo, useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/site/navbar'
import Footer from '@/components/site/footer'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowRight, Calculator, IndianRupee, Percent, CalendarClock, Sparkles } from 'lucide-react'

const fmtINR = (n) => '\u20b9' + Math.round(Number(n || 0)).toLocaleString('en-IN')

export default function CalculatorsPage() {
  const [amount, setAmount] = useState(500000)
  const [rate, setRate] = useState(12)
  const [years, setYears] = useState(5)

  const { emi, totalInterest, totalPayment, principalPct } = useMemo(() => {
    const P = Number(amount) || 0
    const r = (Number(rate) || 0) / 12 / 100
    const n = (Number(years) || 0) * 12
    if (!P || !r || !n) return { emi: 0, totalInterest: 0, totalPayment: 0, principalPct: 100 }
    const pow = Math.pow(1 + r, n)
    const e = (P * r * pow) / (pow - 1)
    const total = e * n
    return {
      emi: e,
      totalInterest: total - P,
      totalPayment: total,
      principalPct: Math.round((P / total) * 100),
    }
  }, [amount, rate, years])

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <section className="bg-gradient-to-br from-[#0A1628] via-[#0E2240] to-[#123A6E] relative overflow-hidden">
        <div className="absolute inset-0 fm-matrix-grid" />
        <div className="container mx-auto px-4 relative py-14 md:py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-4 py-1.5 text-sm text-blue-100 mb-5">
            <Calculator className="h-4 w-4 text-[#5B9BF3]" /> LoanLaabh Calculators
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">EMI Calculator</h1>
          <p className="mt-4 text-lg text-slate-300 max-w-2xl mx-auto">Plan your loan smartly. See your monthly EMI, total interest, and repayment breakdown instantly.</p>
        </div>
      </section>

      <section className="py-14 md:py-20 bg-[#F8FAFC]">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid lg:grid-cols-5 gap-8">
            {/* Inputs */}
            <div className="lg:col-span-3 bg-white rounded-xl border border-slate-100 fm-card-shadow p-7 space-y-8">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="flex items-center gap-2 text-[#0A1628] font-semibold"><IndianRupee className="h-4 w-4 text-[#1A6FE8]" /> Loan Amount</Label>
                  <Input type="number" value={amount} onChange={e => setAmount(Math.max(0, Math.min(20000000, Number(e.target.value))))} className="w-40 text-right font-bold text-[#1A6FE8]" />
                </div>
                <Slider value={[amount]} min={50000} max={20000000} step={50000} onValueChange={([v]) => setAmount(v)} />
                <div className="flex justify-between text-xs text-[#64748B] mt-2"><span>{'\u20b9'}50K</span><span>{'\u20b9'}2Cr</span></div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="flex items-center gap-2 text-[#0A1628] font-semibold"><Percent className="h-4 w-4 text-[#1A6FE8]" /> Interest Rate (p.a.)</Label>
                  <Input type="number" step="0.1" value={rate} onChange={e => setRate(Math.max(1, Math.min(36, Number(e.target.value))))} className="w-40 text-right font-bold text-[#1A6FE8]" />
                </div>
                <Slider value={[rate]} min={6} max={30} step={0.25} onValueChange={([v]) => setRate(v)} />
                <div className="flex justify-between text-xs text-[#64748B] mt-2"><span>6%</span><span>30%</span></div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="flex items-center gap-2 text-[#0A1628] font-semibold"><CalendarClock className="h-4 w-4 text-[#1A6FE8]" /> Tenure (Years)</Label>
                  <Input type="number" value={years} onChange={e => setYears(Math.max(1, Math.min(30, Number(e.target.value))))} className="w-40 text-right font-bold text-[#1A6FE8]" />
                </div>
                <Slider value={[years]} min={1} max={30} step={1} onValueChange={([v]) => setYears(v)} />
                <div className="flex justify-between text-xs text-[#64748B] mt-2"><span>1 yr</span><span>30 yrs</span></div>
              </div>
            </div>

            {/* Results */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-gradient-to-br from-[#0A1628] to-[#123A6E] rounded-xl p-7 text-white">
                <div className="text-sm text-slate-300 uppercase tracking-wider">Monthly EMI</div>
                <div className="text-4xl font-extrabold mt-2 text-[#5B9BF3]">{fmtINR(emi)}</div>
                <div className="mt-5 h-3 rounded-full bg-white/15 overflow-hidden flex">
                  <div className="h-full bg-[#1A6FE8]" style={{ width: `${principalPct}%` }} />
                  <div className="h-full bg-[#F59E0B]" style={{ width: `${100 - principalPct}%` }} />
                </div>
                <div className="flex justify-between mt-2 text-xs">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#1A6FE8]" /> Principal {principalPct}%</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" /> Interest {100 - principalPct}%</span>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-slate-100 fm-card-shadow p-6">
                <div className="flex justify-between py-2.5 border-b border-slate-100 text-sm"><span className="text-[#64748B]">Principal Amount</span><span className="font-bold text-[#0A1628]">{fmtINR(amount)}</span></div>
                <div className="flex justify-between py-2.5 border-b border-slate-100 text-sm"><span className="text-[#64748B]">Total Interest</span><span className="font-bold text-[#F59E0B]">{fmtINR(totalInterest)}</span></div>
                <div className="flex justify-between py-2.5 text-sm"><span className="text-[#64748B]">Total Payment</span><span className="font-bold text-[#1A6FE8]">{fmtINR(totalPayment)}</span></div>
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
                <div className="flex items-center gap-2 font-semibold text-[#0A1628] text-sm"><Sparkles className="h-4 w-4 text-[#1A6FE8]" /> Can you actually get this loan?</div>
                <p className="text-xs text-[#64748B] mt-1.5">EMI is only half the story. Let FinMatrix AI™ check which lenders would approve your profile.</p>
                <Link href="/eligibility"><Button size="sm" className="mt-3 w-full bg-[#1A6FE8] hover:bg-[#1559c4] rounded-lg font-semibold">Find My Loan Match <ArrowRight className="ml-1.5 h-4 w-4" /></Button></Link>
              </div>
            </div>
          </div>
          <p className="text-xs text-[#64748B] mt-6 text-center">Calculations are indicative. Actual EMI depends on the interest rate, processing fees, and terms offered by the lender.</p>
        </div>
      </section>

      <Footer />
    </div>
  )
}
