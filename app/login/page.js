'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getSupabaseBrowser } from '@/lib/supabase-browser'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Mail, ShieldCheck, ArrowLeft } from 'lucide-react'

export default function LoginPage() {
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
      <Card className="w-full max-w-md shadow-2xl border-blue-100">
        <CardHeader className="text-center">
          <div className="mx-auto bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl w-14 h-14 flex items-center justify-center mb-3 shadow-lg">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <CardTitle className="text-2xl">Welcome to <span className="text-blue-600">LoanLaabh</span></CardTitle>
          <CardDescription>
            {step === 'email' ? 'Sign in with your email to continue' : `We sent a 6-digit code to ${email}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'email' ? (
            <form onSubmit={(e) => { e.preventDefault(); if (email) sendOtp() }} className="space-y-4">
              <div>
                <Label>Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="pl-9" autoFocus required />
                </div>
              </div>
              {error && <div className="text-red-600 text-sm">{error}</div>}
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 h-11" disabled={loading || !email}>
                {loading ? <Loader2 className="animate-spin h-4 w-4" /> : 'Send OTP Code'}
              </Button>
              <p className="text-xs text-slate-500 text-center">By continuing, you agree to our Terms &amp; Privacy Policy.</p>
            </form>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); if (otp.length >= 6) verifyOtp() }} className="space-y-4">
              <div>
                <Label>6-Digit Code</Label>
                <Input type="text" inputMode="numeric" maxLength={6} value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g,''))} placeholder="123456" className="text-2xl tracking-[0.5em] text-center font-bold h-14" autoFocus />
              </div>
              {error && <div className="text-red-600 text-sm text-center">{error}</div>}
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 h-11" disabled={loading || otp.length < 6}>
                {loading ? <Loader2 className="animate-spin h-4 w-4" /> : 'Verify &amp; Sign In'}
              </Button>
              <div className="flex justify-between items-center text-sm">
                <button type="button" onClick={() => { setStep('email'); setOtp(''); setError('') }} className="text-slate-500 hover:text-slate-900 flex items-center gap-1">
                  <ArrowLeft className="h-3 w-3" /> Change email
                </button>
                <button type="button" onClick={sendOtp} disabled={resendIn > 0 || loading} className="text-blue-600 hover:underline disabled:text-slate-400 disabled:no-underline">
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
