'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { getSupabaseBrowser } from '@/lib/supabase-browser'
import Navbar from '@/components/site/navbar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2, Mail, ArrowLeft, ArrowRight, Phone, User, ShieldCheck, BadgeCheck, Brain, HeartHandshake, Sparkles, CheckCircle2 } from 'lucide-react'

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-[#1261E8]" /></div>}>
      <LoginInner />
    </Suspense>
  )
}

const TRUST_POINTS = [
  { icon: BadgeCheck, text: 'Free eligibility check' },
  { icon: ShieldCheck, text: 'No direct CIBIL impact' },
  { icon: Brain, text: 'AI-powered lender matching' },
  { icon: HeartHandshake, text: 'Guided support from LoanLaabh advisor' },
]

const CREDIBILITY = [
  { num: '92%', label: 'Smart Match' },
  { num: '10K+', label: 'Borrowers Guided' },
  { num: '39+', label: 'Lending Partners' },
]

function LoginInner() {
  const router = useRouter()
  const search = useSearchParams()
  const redirect = search.get('redirect') || '/eligibility'

  const [step, setStep] = useState('info') // 'info' | 'otp'
  const [mobile, setMobile] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [consent, setConsent] = useState(false)

  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resendIn, setResendIn] = useState(0)

  useEffect(() => {
    const sb = getSupabaseBrowser()
    sb.auth.getSession().then(({ data }) => {
      if (data.session) router.replace(redirect)
    })
  }, [router, redirect])

  useEffect(() => {
    if (resendIn > 0) {
      const t = setTimeout(() => setResendIn(r => r - 1), 1000)
      return () => clearTimeout(t)
    }
  }, [resendIn])

  const isMobileValid = /^[6-9]\d{9}$/.test(mobile.replace(/\s|\D/g, ''))
  const isNameValid = name.trim().length >= 2
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const canSubmit = isMobileValid && isNameValid && isEmailValid && consent && !loading

  const sendOtp = async () => {
    setError(''); setLoading(true)
    try {
      const sb = getSupabaseBrowser()
      const { error } = await sb.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true, data: { full_name: name.trim(), phone: mobile.replace(/\s|\D/g, '') } },
      })
      if (error) throw error
      setStep('otp')
      setResendIn(45)
    } catch (e) {
      setError(e.message || 'Failed to send code')
    } finally { setLoading(false) }
  }

  const verifyOtp = async () => {
    setError(''); setLoading(true)
    try {
      const sb = getSupabaseBrowser()
      const { data, error } = await sb.auth.verifyOtp({ email, token: otp, type: 'email' })
      if (error) throw error
      if (!data.session) throw new Error('Verification failed')

      // Best-effort save of lead capture details (do not block redirect if it fails)
      try {
        await sb.from('profiles').upsert({
          id: data.session.user.id,
          email,
          full_name: name.trim(),
          phone: mobile.replace(/\s|\D/g, ''),
        }, { onConflict: 'id' })
      } catch (_) { /* non-blocking */ }

      // Log capture event
      try {
        await fetch('/api/leads/capture', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            full_name: name.trim(),
            mobile: mobile.replace(/\s|\D/g, ''),
            email,
            consent: true,
            source_cta: redirect,
          }),
        })
      } catch (_) { /* non-blocking */ }

      router.replace(redirect)
    } catch (e) {
      setError(e.message || 'Invalid code')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#F7FAFF] to-[#EAF2FF]">
      <Navbar />

      <section className="py-4 lg:py-14 px-4">
        <div className="container mx-auto max-w-6xl grid lg:grid-cols-2 gap-8 lg:gap-14 items-center">

          {/* ===== LEFT: Trust / brand content (DESKTOP ONLY) ===== */}
          <div className="hidden lg:block">
            <div className="inline-flex items-center gap-2 bg-white border border-[#D6E6FF] rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#1261E8] mb-6 shadow-sm">
              <Sparkles className="h-3.5 w-3.5" /> Free Eligibility Check
            </div>
            <h1 className="text-4xl xl:text-5xl font-extrabold text-[#071E41] tracking-tight leading-[1.1]">
              Don&apos;t Risk Your CIBIL. <span className="text-[#1261E8]">Find Your Best Loan Match First.</span>
            </h1>
            <p className="mt-5 text-lg text-[#42526B] leading-relaxed">
              LoanLaabh uses FinMatrix AI&trade; to understand your profile and guide you toward better-fit loan options before you apply.
            </p>

            <ul className="mt-7 space-y-3">
              {TRUST_POINTS.map((t, i) => (
                <li key={i} className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-xl bg-[#EAF2FF] border border-[#D6E6FF] text-[#1261E8] flex items-center justify-center shrink-0"><t.icon className="h-4 w-4" /></span>
                  <span className="text-[#071E41] font-medium">{t.text}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 grid grid-cols-3 gap-3">
              {CREDIBILITY.map((c, i) => (
                <div key={i} className="bg-white border border-[#D6E6FF] rounded-2xl p-4 text-center shadow-[0_2px_10px_rgba(18,97,232,0.05)]">
                  <div className="text-xl xl:text-2xl font-extrabold text-[#071E41]">{c.num}</div>
                  <div className="text-[11px] text-[#5B6B82] font-medium mt-1">{c.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ===== RIGHT: Form card (also used as single mobile card) ===== */}
          <Card className="w-full max-w-md mx-auto lg:mx-0 border border-[#D6E6FF] rounded-3xl shadow-[0_20px_60px_rgba(18,97,232,0.12)] overflow-hidden">
            <CardContent className="p-4 md:p-8">
              {step === 'info' ? (
                <>
                  {/* Compact mobile-only header (badge + credibility strip inside card) */}
                  <div className="lg:hidden mb-3">
                    <div className="flex items-center justify-between">
                      <div className="inline-flex items-center gap-1.5 bg-[#EAF2FF] border border-[#D6E6FF] rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#1261E8]">
                        <Sparkles className="h-3 w-3" /> Free Check
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-semibold text-[#16A34A]">
                        <ShieldCheck className="h-3 w-3" /> No CIBIL impact
                      </div>
                    </div>
                  </div>

                  <div className="mb-3 md:mb-5">
                    <h2 className="text-lg md:text-2xl font-extrabold text-[#071E41] tracking-tight leading-tight">Check Your Free <span className="text-[#1261E8]">Loan Eligibility</span></h2>
                    <p className="mt-1 text-xs md:text-sm text-[#5B6B82]">Start with your basic details.</p>
                  </div>

                  {/* Compact credibility strip - mobile inside card, desktop hidden here */}
                  <div className="lg:hidden grid grid-cols-3 gap-1.5 mb-4 pb-3 border-b border-[#EAF2FF]">
                    {CREDIBILITY.map((c, i) => (
                      <div key={i} className="text-center">
                        <div className="text-sm font-extrabold text-[#1261E8] leading-none">{c.num}</div>
                        <div className="text-[9px] text-[#5B6B82] font-medium mt-0.5 leading-tight">{c.label}</div>
                      </div>
                    ))}
                  </div>

                  <form
                    onSubmit={(e) => { e.preventDefault(); if (canSubmit) sendOtp() }}
                    className="space-y-2.5 md:space-y-4"
                  >
                    {/* Mobile Number */}
                    <div>
                      <Label className="text-[#071E41] font-semibold text-xs md:text-sm">Mobile Number</Label>
                      <div className="relative mt-0.5 md:mt-1">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-[#42526B] text-sm font-semibold pointer-events-none">
                          <Phone className="h-4 w-4 text-[#1261E8]" /> +91
                        </div>
                        <Input
                          type="tel"
                          inputMode="numeric"
                          maxLength={10}
                          value={mobile}
                          onChange={e => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                          placeholder="10-digit mobile number"
                          className="pl-[68px] h-10 md:h-11 border-[#D6E6FF] focus-visible:ring-[#1261E8]"
                          autoFocus
                          required
                        />
                      </div>
                      {mobile && !isMobileValid && <p className="text-red-500 text-[11px] mt-0.5">Enter a valid 10-digit mobile number</p>}
                    </div>

                    {/* Full Name */}
                    <div>
                      <Label className="text-[#071E41] font-semibold text-xs md:text-sm">Full Name</Label>
                      <div className="relative mt-0.5 md:mt-1">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1261E8]" />
                        <Input
                          type="text"
                          value={name}
                          onChange={e => setName(e.target.value)}
                          placeholder="As per PAN card"
                          className="pl-9 h-10 md:h-11 border-[#D6E6FF] focus-visible:ring-[#1261E8]"
                          required
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <Label className="text-[#071E41] font-semibold text-xs md:text-sm">Email ID</Label>
                      <div className="relative mt-0.5 md:mt-1">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1261E8]" />
                        <Input
                          type="email"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="pl-9 h-10 md:h-11 border-[#D6E6FF] focus-visible:ring-[#1261E8]"
                          required
                        />
                      </div>
                      {email && !isEmailValid && <p className="text-red-500 text-[11px] mt-0.5">Enter a valid email</p>}
                    </div>

                    {/* Consent */}
                    <div className="flex items-start gap-2 pt-0.5">
                      <Checkbox id="consent" checked={consent} onCheckedChange={setConsent} className="mt-0.5 border-[#D6E6FF] data-[state=checked]:bg-[#1261E8] data-[state=checked]:border-[#1261E8]" />
                      <label htmlFor="consent" className="text-[11px] md:text-xs text-[#42526B] leading-snug cursor-pointer">
                        I agree to the <a href="#" className="text-[#1261E8] font-semibold">Terms</a> &amp; <a href="#" className="text-[#1261E8] font-semibold">Privacy Policy</a>, and to receive updates via WhatsApp/SMS.
                      </label>
                    </div>

                    {error && <div className="text-red-600 text-xs bg-red-50 border border-red-100 rounded-lg px-2.5 py-1.5">{error}</div>}

                    <Button
                      type="submit"
                      className="w-full h-11 md:h-12 bg-[#1261E8] hover:bg-[#0B4FC4] rounded-2xl font-semibold text-sm md:text-base shadow-md shadow-blue-200 disabled:opacity-50 disabled:hover:bg-[#1261E8]"
                      disabled={!canSubmit}
                    >
                      {loading ? <Loader2 className="animate-spin h-4 w-4" /> : (<>Next <ArrowRight className="ml-1.5 h-4 w-4" /></>)}
                    </Button>

                    <p className="text-[10px] md:text-[11px] text-[#16A34A] font-semibold text-center flex items-center justify-center gap-1">
                      <ShieldCheck className="h-3 w-3 md:h-3.5 md:w-3.5" /> 100% free · No direct CIBIL impact
                    </p>
                  </form>
                </>
              ) : (
                <>
                  <div className="mb-4 md:mb-5">
                    <button type="button" onClick={() => { setStep('info'); setOtp(''); setError('') }} className="text-[#6B7280] hover:text-[#071E41] flex items-center gap-1 text-xs md:text-sm mb-2 md:mb-3">
                      <ArrowLeft className="h-3.5 w-3.5" /> Edit details
                    </button>
                    <div className="w-12 md:w-14 h-12 md:h-14 mx-auto mb-2 md:mb-3 rounded-2xl bg-[#EAF2FF] border border-[#D6E6FF] flex items-center justify-center">
                      <Mail className="h-5 md:h-6 w-5 md:w-6 text-[#1261E8]" />
                    </div>
                    <h2 className="text-lg md:text-2xl font-extrabold text-[#071E41] tracking-tight text-center">Verify Your Email ID</h2>
                    <p className="mt-1 text-xs md:text-sm text-[#5B6B82] text-center">
                      6-digit OTP sent to<br /><span className="font-semibold text-[#071E41]">{email}</span>
                    </p>
                  </div>

                  <form
                    onSubmit={(e) => { e.preventDefault(); if (otp.length >= 6) verifyOtp() }}
                    className="space-y-3 md:space-y-4"
                  >
                    <div>
                      <Label className="text-[#071E41] font-semibold text-xs md:text-sm">Enter OTP</Label>
                      <Input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={otp}
                        onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                        placeholder="123456"
                        className="mt-1 text-xl md:text-2xl tracking-[0.4em] md:tracking-[0.5em] text-center font-bold h-12 md:h-14 text-[#071E41] border-[#D6E6FF] focus-visible:ring-[#1261E8]"
                        autoFocus
                      />
                    </div>

                    {error && <div className="text-red-600 text-xs bg-red-50 border border-red-100 rounded-lg px-2.5 py-1.5 text-center">{error}</div>}

                    <Button
                      type="submit"
                      className="w-full h-11 md:h-12 bg-[#1261E8] hover:bg-[#0B4FC4] rounded-2xl font-semibold text-sm md:text-base shadow-md shadow-blue-200"
                      disabled={loading || otp.length < 6}
                    >
                      {loading ? <Loader2 className="animate-spin h-4 w-4" /> : (<>Verify &amp; Continue <ArrowRight className="ml-1.5 h-4 w-4" /></>)}
                    </Button>

                    <div className="text-center">
                      <button
                        type="button"
                        onClick={sendOtp}
                        disabled={resendIn > 0 || loading}
                        className="text-xs md:text-sm text-[#1261E8] hover:underline font-semibold disabled:text-[#B7C7DC] disabled:no-underline disabled:cursor-not-allowed"
                      >
                        {resendIn > 0 ? `Resend OTP in ${resendIn}s` : 'Resend OTP'}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Compliance disclaimer */}
        <p className="mt-4 lg:mt-10 text-[10px] md:text-[11px] text-[#6B7280] leading-relaxed text-center max-w-3xl mx-auto px-4">
          Initial eligibility check is based on your self-declared profile and does not directly affect your CIBIL score. Final approval, loan amount, and disbursal are decided only by the lending institution.
        </p>
      </section>
    </div>
  )
}
