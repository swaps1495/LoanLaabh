'use client'
import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Sparkles, Loader2 } from 'lucide-react'

const SUGGESTIONS = [
  'How does LoanLaabh check my eligibility?',
  'Which CIBIL score do banks prefer?',
  'How can I improve my CIBIL score?',
  'What is FOIR and why does it matter?',
]

const GREETING = "Hi! I'm LFMai — LoanLaabh's FinMatrix AI assistant 🤖\n\nAsk me about loan eligibility, CIBIL scores, EMI, or how LoanLaabh works. How can I help you today?"

export default function AskLfmai() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([{ role: 'assistant', content: GREETING }])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const scrollerRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (open && scrollerRef.current) {
      scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight
    }
  }, [messages, open])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 200)
  }, [open])

  const send = async (text) => {
    const content = (text ?? input).trim()
    if (!content || sending) return
    const nextMessages = [...messages, { role: 'user', content }]
    setMessages(nextMessages)
    setInput('')
    setSending(true)
    try {
      const res = await fetch('/api/lfmai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages.filter(m => m.role !== 'assistant' || m.content !== GREETING) }),
      })
      const data = await res.json()
      const reply = data?.message?.content || "Sorry, I couldn't reply. Please try again."
      setMessages(m => [...m, { role: 'assistant', content: reply }])
    } catch (e) {
      setMessages(m => [...m, { role: 'assistant', content: "Network hiccup — please try again, or WhatsApp us at +91 77700 24242." }])
    } finally {
      setSending(false)
    }
  }

  const onKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <>
      {/* Floating trigger — bottom right, above sticky mobile CTA */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Ask LFMai"
          className="fixed z-[60] bottom-24 lg:bottom-6 right-4 lg:right-6 group flex items-center gap-2 bg-[#1261E8] hover:bg-[#0B4FC4] text-white pl-3.5 pr-4 py-3 rounded-full shadow-[0_10px_28px_rgba(18,97,232,0.35)] transition-all hover:scale-105"
        >
          <span className="relative flex h-8 w-8 items-center justify-center bg-white/15 rounded-full">
            <span className="absolute inset-0 rounded-full bg-white/25 animate-ping opacity-60" />
            <Sparkles className="h-4 w-4 relative" />
          </span>
          <span className="font-semibold text-sm whitespace-nowrap">Ask LFMai</span>
        </button>
      )}

      {/* Chat panel */}
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
              <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white p-1.5 hover:bg-white/10 rounded-lg transition-colors" aria-label="Close chat">
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
                    <Loader2 className="h-4 w-4 animate-spin text-[#1261E8]" /> LFMai is thinking…
                  </div>
                </div>
              )}
              {messages.length <= 1 && !sending && (
                <div className="pt-2">
                  <div className="text-[11px] text-[#6B7280] uppercase tracking-wider font-semibold mb-2 px-1">Try asking</div>
                  <div className="flex flex-wrap gap-2">
                    {SUGGESTIONS.map(s => (
                      <button key={s} onClick={() => send(s)} className="text-left text-xs bg-white border border-[#E3ECFA] text-[#1261E8] rounded-xl px-3 py-2 hover:bg-[#EAF2FF] transition-colors">
                        {s}
                      </button>
                    ))}
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
                  placeholder="Ask about loans, CIBIL, eligibility…"
                  className="flex-1 resize-none rounded-2xl border border-[#E3ECFA] bg-[#F7FAFF] focus:bg-white focus:border-[#1261E8] focus:ring-1 focus:ring-[#1261E8] outline-none text-sm px-3.5 py-2.5 text-[#071E41] placeholder:text-[#9AA5B8] max-h-24"
                />
                <button
                  onClick={() => send()}
                  disabled={!input.trim() || sending}
                  className="bg-[#1261E8] hover:bg-[#0B4FC4] disabled:opacity-40 disabled:hover:bg-[#1261E8] text-white w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-colors"
                  aria-label="Send"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
              <p className="text-[10px] text-[#9AA5B8] mt-2 text-center px-2">LFMai gives guidance only — not loan approvals. Never share OTPs or passwords.</p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
