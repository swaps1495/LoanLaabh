'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getSupabaseBrowser } from '@/lib/supabase-browser'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Mail, ArrowLeft } from 'lucide-react'

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-[#1261E8]" /></div>}>
      <LoginInner />
    </Suspense>
  )
}

function LoginInner() {
  const router = useRouter()
  const search = useSearchParams()
  const redirect = search.get('redirect') || '/dashboard'
  const [step, setStep] = useState('email')
  const [email, setEmail] = useState('')
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

  const sendOtp = async () => {
    setError(''); setLoading(true)
    try {
      const sb = getSupabaseBrowser()
      const { error } = await sb.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true },
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
      router.replace(redirect)
    } catch (e) {
      setError(e.message || 'Invalid code')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-[#F7FAFF] to-[#EAF2FF] p-4">
      <Card className="w-full max-w-md border border-[#E3ECFA] rounded-2xl shadow-[0_12px_40px_rgba(7,30,65,0.10)]">
        <CardHeader className="text-center">
          <img src="/logo-vertical.png" alt="LoanLaabh — Apply Smarter. Borrow Better." className="mx-auto h-28 w-auto object-contain mb-2" />
          <CardTitle className="text-2xl text-[#071E41]">Welcome back</CardTitle>
          <CardDescription className="text-[#42526B]">
            {step === 'email' ? 'Sign in with your email to continue' : `We sent a 6-digit code to ${email}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'email' ? (
            <form onSubmit={(e) => { e.preventDefault(); if (email) sendOtp() }} className="space-y-4">
              <div>
                <Label className="text-[#071E41]">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1261E8]" />
                  <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="pl-9" autoFocus required />
                </div>
              </div>
              {error && <div className="text-red-600 text-sm">{error}</div>}
              <Button type="submit" className="w-full bg-[#1261E8] hover:bg-[#0B4FC4] rounded-xl h-11 font-semibold" disabled={loading || !email}>
                {loading ? <Loader2 className="animate-spin h-4 w-4" /> : 'Send OTP Code'}
              </Button>
              <p className="text-xs text-[#6B7280] text-center">By continuing, you agree to our Terms &amp; Privacy Policy.</p>
            </form>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); if (otp.length >= 6) verifyOtp() }} className="space-y-4">
              <div>
                <Label className="text-[#071E41]">6-Digit Code</Label>
                <Input type="text" inputMode="numeric" maxLength={6} value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g,''))} placeholder="123456" className="text-2xl tracking-[0.5em] text-center font-bold h-14 text-[#071E41]" autoFocus />
              </div>
              {error && <div className="text-red-600 text-sm text-center">{error}</div>}
              <Button type="submit" className="w-full bg-[#1261E8] hover:bg-[#0B4FC4] rounded-xl h-11 font-semibold" disabled={loading || otp.length < 6}>
                {loading ? <Loader2 className="animate-spin h-4 w-4" /> : 'Verify &amp; Sign In'}
              </Button>
              <div className="flex justify-between items-center text-sm">
                <button type="button" onClick={() => { setStep('email'); setOtp(''); setError('') }} className="text-[#6B7280] hover:text-[#071E41] flex items-center gap-1">
                  <ArrowLeft className="h-3 w-3" /> Change email
                </button>
                <button type="button" onClick={sendOtp} disabled={resendIn > 0 || loading} className="text-[#1261E8] hover:underline disabled:text-[#B7C7DC] disabled:no-underline">
                  {resendIn > 0 ? `Resend in ${resendIn}s` : 'Resend code'}
                </button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
