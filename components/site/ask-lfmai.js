'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseBrowser } from '@/lib/supabase-browser'
import { MessageCircle, X, Send, Sparkles, Loader2, CheckCircle2 } from 'lucide-react'

const HELPLINE = '7770024242'

const SUGGESTIONS = [
  'Check my loan eligibility',
  'What is CIBIL score?',
  'How to improve CIBIL?',
  'What is FOIR?',
]

const GREETING = "Hi! I'm LFMai — LoanLaabh's FinMatrix AI assistant 🤖\n\nI can help you check your free loan eligibility or answer questions about loans, CIBIL, EMI & more. How can I help you today?"

// Detect loan/eligibility intent in user's message
const LOAN_INTENT_KEYWORDS = [
  'loan', 'eligib', 'apply', 'borrow', 'personal loan', 'business loan',
  'home loan', 'car loan', 'used car', 'balance transfer', 'against property',
  'lap', 'need money', 'want loan', 'need loan', 'help me get', 'want a loan',
  'check my', 'not sure which loan',
]
const hasLoanIntent = (txt) => {
  const t = (txt || '').toLowerCase()
  return LOAN_INTENT_KEYWORDS.some(k => t.includes(k))
}

const validMobile = (m) => /^[6-9]\d{9}$/.test((m || '').replace(/\D/g, ''))
const validEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((e || '').trim())

export default function AskLfmai() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([{ role: 'assistant', content: GREETING }])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [flow, setFlow] = useState({ stage: 'idle', name: '', mobile: '', email: '', intent: '' })
  const scrollerRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (open && scrollerRef.current) scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight
  }, [messages, open])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 200)
  }, [open])

  const pushBot = (content) => setMessages(m => [...m, { role: 'assistant', content }])
  const pushUser = (content) => setMessages(m => [...m, { role: 'user', content }])

  const startLeadCapture = (userText) => {
    setFlow(f => ({ ...f, stage: 'asking_name', intent: userText }))
    setTimeout(() => {
      pushBot("Sure, I can help you check your free loan eligibility. Please share a few basic details first. 🙂")
    }, 300)
    setTimeout(() => pushBot("Please enter your full name."), 900)
  }

  const sendOtpToEmail = async (email) => {
    try {
      const sb = getSupabaseBrowser()
      const { error } = await sb.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true, data: { full_name: flow.name, phone: flow.mobile } },
      })
      if (error) throw error
      return true
    } catch (e) {
      pushBot(`Sorry, I couldn't send the OTP right now. Please call our helpline at ${HELPLINE} and we'll help you directly.`)
      return false
    }
  }

  const verifyOtpCode = async (code, email) => {
    try {
      const sb = getSupabaseBrowser()
      const { data, error } = await sb.auth.verifyOtp({ email, token: code, type: 'email' })
      if (error) throw error
      if (!data.session) throw new Error('Verification failed')

      // Best-effort save to profiles + lead_captures
      try {
        await sb.from('profiles').upsert({
          id: data.session.user.id, email, full_name: flow.name, phone: flow.mobile,
        }, { onConflict: 'id' })
      } catch (_) { /* non-blocking */ }
      try {
        await fetch('/api/leads/capture', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            full_name: flow.name, mobile: flow.mobile, email,
            consent: true, source_cta: 'chatbot',
          }),
        })
      } catch (_) { /* non-blocking */ }
      return true
    } catch (e) {
      return false
    }
  }

  const handleFlowInput = async (userText) => {
    const trimmed = userText.trim()
    if (flow.stage === 'asking_name') {
      if (trimmed.length < 2) {
        pushBot("Please share your full name (at least 2 characters).")
        return
      }
      setFlow(f => ({ ...f, name: trimmed, stage: 'asking_mobile' }))
      setTimeout(() => pushBot(`Nice to meet you, ${trimmed.split(' ')[0]}! 👋\n\nPlease enter your 10-digit mobile number.`), 400)
      return
    }
    if (flow.stage === 'asking_mobile') {
      if (!validMobile(trimmed)) {
        pushBot("Please enter a valid 10-digit Indian mobile number (starting with 6, 7, 8, or 9).")
        return
      }
      const mobileClean = trimmed.replace(/\D/g, '')
      setFlow(f => ({ ...f, mobile: mobileClean, stage: 'asking_email' }))
      setTimeout(() => pushBot("Please enter your email ID to receive OTP verification."), 400)
      return
    }
    if (flow.stage === 'asking_email') {
      if (!validEmail(trimmed)) {
        pushBot("Please enter a valid email ID.")
        return
      }
      const emailClean = trimmed.toLowerCase()
      setFlow(f => ({ ...f, email: emailClean, stage: 'sending_otp' }))
      pushBot("Sending OTP to your email…")
      setSending(true)
      const ok = await sendOtpToEmail(emailClean)
      setSending(false)
      if (ok) {
        setFlow(f => ({ ...f, stage: 'asking_otp' }))
        pushBot(`We have sent a 6-digit OTP to ${emailClean}. Please enter the OTP to continue.\n\n_Initial eligibility check is based on your self-declared profile and does not directly affect your CIBIL score. Final approval is decided only by the lending institution._`)
      } else {
        setFlow(f => ({ ...f, stage: 'idle' }))
      }
      return
    }
    if (flow.stage === 'asking_otp') {
      if (/^resend/i.test(trimmed)) {
        pushBot("Sending a new OTP…")
        setSending(true)
        const ok = await sendOtpToEmail(flow.email)
        setSending(false)
        if (ok) pushBot(`A new OTP has been sent to ${flow.email}. Please enter it below.`)
        return
      }
      const code = trimmed.replace(/\D/g, '')
      if (code.length !== 6) {
        pushBot("Please enter the 6-digit OTP sent to your email. Type 'resend' if you'd like a new code.")
        return
      }
      setSending(true)
      const ok = await verifyOtpCode(code, flow.email)
      setSending(false)
      if (ok) {
        setFlow(f => ({ ...f, stage: 'done' }))
        pushBot("✅ Your email is verified successfully. Taking you to the eligibility page now…")
        setTimeout(() => {
          setOpen(false)
          router.push('/eligibility')
        }, 1500)
      } else {
        pushBot("The OTP entered is incorrect. Please try again, or type 'resend' to get a new one.")
      }
      return
    }
  }

  const sendMessage = async (text) => {
    const content = (text ?? input).trim()
    if (!content || sending) return
    pushUser(content)
    setInput('')

    // In-flow: user is providing name/mobile/email/otp
    if (flow.stage !== 'idle' && flow.stage !== 'done') {
      await handleFlowInput(content)
      return
    }

    // Detect loan intent at chatbot idle — kick off lead capture
    if (flow.stage === 'idle' && hasLoanIntent(content)) {
      startLeadCapture(content)
      return
    }

    // Otherwise: general Q&A via GPT-4o
    setSending(true)
    try {
      const res = await fetch('/api/lfmai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content }]
            .filter(m => m.role !== 'assistant' || m.content !== GREETING),
        }),
      })
      const data = await res.json()
      const reply = data?.message?.content || "Please try again."
      pushBot(reply)
    } catch (e) {
      pushBot(`Network hiccup — please try again or call our helpline at ${HELPLINE}.`)
    } finally {
      setSending(false)
    }
  }

  const onKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const showResendChip = flow.stage === 'asking_otp' && !sending
  const isNumericPrompt = flow.stage === 'asking_mobile' || flow.stage === 'asking_otp'

  const placeholder = flow.stage === 'asking_name' ? 'Your full name…'
    : flow.stage === 'asking_mobile' ? '10-digit mobile number…'
    : flow.stage === 'asking_email' ? 'you@example.com'
    : flow.stage === 'asking_otp' ? '6-digit OTP'
    : 'Ask about loans, CIBIL, eligibility…'

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Ask LFMai"
          className="fixed z-[60] bottom-24 lg:bottom-6 right-4 lg:right-6 flex items-center gap-2 bg-[#1261E8] hover:bg-[#0B4FC4] text-white pl-3.5 pr-4 py-3 rounded-full shadow-[0_10px_28px_rgba(18,97,232,0.35)] transition-all hover:scale-105"
        >
          <span className="relative flex h-8 w-8 items-center justify-center bg-white/15 rounded-full">
            <span className="absolute inset-0 rounded-full bg-white/25 animate-ping opacity-60" />
            <Sparkles className="h-4 w-4 relative" />
          </span>
          <span className="font-semibold text-sm whitespace-nowrap">Ask LFMai</span>
        </button>
      )}

      {open && (
        <div className="fixed z-[60] inset-x-0 bottom-0 lg:inset-auto lg:bottom-6 lg:right-6 lg:w-[400px] lg:h-[600px] lg:max-h-[85vh]">
          <div className="bg-white lg:rounded-3xl shadow-[0_20px_60px_rgba(7,30,65,0.25)] border border-[#E3ECFA] flex flex-col h-[85vh] lg:h-full overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-br from-[#1261E8] to-[#0B4FC4] text-white p-4 flex items-center gap-3 shrink-0">
              <div className="bg-white/15 rounded-xl w-11 h-11 flex items-center justify-center relative">
                <Sparkles className="h-5 w-5" />
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-[#1261E8] rounded-full" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm leading-tight">LFMai</div>
                <div className="text-[11px] text-blue-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" /> Online · Powered by FinMatrix AI™
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white p-1.5 hover:bg-white/10 rounded-lg transition-colors" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollerRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F7FAFF]">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${m.role === 'user' ? 'bg-[#1261E8] text-white rounded-br-md' : 'bg-white border border-[#E3ECFA] text-[#071E41] rounded-bl-md shadow-sm'}`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {sending && (
                <div className="flex justify-start">
                  <div className="bg-white border border-[#E3ECFA] rounded-2xl rounded-bl-md px-3.5 py-3 shadow-sm flex items-center gap-2 text-[#42526B] text-sm">
                    <Loader2 className="h-4 w-4 animate-spin text-[#1261E8]" /> LFMai is working…
                  </div>
                </div>
              )}

              {/* Suggestion chips (only at idle greeting) */}
              {messages.length <= 1 && !sending && flow.stage === 'idle' && (
                <div className="pt-2">
                  <div className="text-[11px] text-[#6B7280] uppercase tracking-wider font-semibold mb-2 px-1">Try asking</div>
                  <div className="flex flex-wrap gap-2">
                    {SUGGESTIONS.map(s => (
                      <button key={s} onClick={() => sendMessage(s)} className="text-left text-xs bg-white border border-[#E3ECFA] text-[#1261E8] rounded-xl px-3 py-2 hover:bg-[#EAF2FF] transition-colors">
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Resend OTP chip */}
              {showResendChip && (
                <div className="pt-1">
                  <button onClick={() => sendMessage('resend')} className="text-xs bg-white border border-[#1261E8] text-[#1261E8] rounded-xl px-3 py-1.5 hover:bg-[#EAF2FF] font-semibold">
                    ↻ Resend OTP
                  </button>
                </div>
              )}

              {/* Done state */}
              {flow.stage === 'done' && (
                <div className="flex justify-start">
                  <div className="bg-emerald-50 border border-emerald-100 rounded-2xl px-3.5 py-2.5 text-sm text-emerald-700 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" /> Verified · Redirecting…
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-[#E3ECFA] bg-white p-3 shrink-0 pb-safe">
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  rows={1}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={onKey}
                  placeholder={placeholder}
                  inputMode={isNumericPrompt ? 'numeric' : 'text'}
                  className="flex-1 resize-none rounded-2xl border border-[#E3ECFA] bg-[#F7FAFF] focus:bg-white focus:border-[#1261E8] focus:ring-1 focus:ring-[#1261E8] outline-none text-sm px-3.5 py-2.5 text-[#071E41] placeholder:text-[#9AA5B8] max-h-24"
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || sending}
                  className="bg-[#1261E8] hover:bg-[#0B4FC4] disabled:opacity-40 disabled:hover:bg-[#1261E8] text-white w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-colors"
                  aria-label="Send"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
              <p className="text-[10px] text-[#9AA5B8] mt-2 text-center px-2">
                {flow.stage === 'idle'
                  ? `LFMai gives guidance only. Need urgent help? Call ${HELPLINE}`
                  : 'Your details are used only for eligibility assistance and advisor follow-up.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
