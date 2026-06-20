'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getSupabaseBrowser } from '@/lib/supabase-browser'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, LogOut, User, FileText, CheckCircle2, Clock, ArrowRight, Plus, MessageCircle, AlertCircle } from 'lucide-react'

const ACTIVE_STATUSES = ['draft','submitted','docs_pending','sent_to_lender','under_review','New','Qualified','Hot','Applied']
const CLOSED_STATUSES = ['approved','rejected','disbursed','expired','withdrawn']

const STAGE_FLOW = [
  { key: 'submitted', label: 'Submitted', icon: FileText },
  { key: 'docs_pending', label: 'Docs Pending', icon: FileText },
  { key: 'sent_to_lender', label: 'Sent to Lender', icon: ArrowRight },
  { key: 'under_review', label: 'Under Review', icon: Clock },
  { key: 'approved', label: 'Approved', icon: CheckCircle2 },
]

const legacyToNew = (s) => {
  if (['New','submitted','Qualified'].includes(s)) return 'submitted'
  if (['Hot','Applied'].includes(s)) return 'sent_to_lender'
  return s
}
const stageIndex = (status) => {
  const norm = legacyToNew(status || 'submitted')
  const i = STAGE_FLOW.findIndex(s => s.key === norm)
  return i === -1 ? 0 : i
}
const fmtINR = (n) => '₹' + Number(n || 0).toLocaleString('en-IN')

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [applications, setApplications] = useState([])
  const [error, setError] = useState('')

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    try {
      const sb = getSupabaseBrowser()
      const { data: { session } } = await sb.auth.getSession()
      if (!session) {
        router.replace('/login?redirect=/dashboard')
        return
      }
      setUser(session.user)
      const res = await fetch('/api/me/applications', {
        headers: { Authorization: `Bearer ${session.access_token}` }
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load')
      setProfile(data.profile)
      setApplications(data.applications || [])
    } catch (e) { setError(e.message) } finally { setLoading(false) }
  }

  const logout = async () => {
    const sb = getSupabaseBrowser()
    await sb.auth.signOut()
    router.replace('/')
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-blue-600" /></div>

  const active = applications.find(a => ACTIVE_STATUSES.includes(a.lead_status))
  const closed = applications.filter(a => CLOSED_STATUSES.includes(a.lead_status))

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b sticky top-0 z-30">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <span className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-lg w-8 h-8 flex items-center justify-center">L</span>
            Loan<span className="text-blue-600">Laabh</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="text-sm text-slate-600 hidden sm:block">{user?.email}</div>
            <Button variant="ghost" size="sm" onClick={logout}><LogOut className="h-4 w-4 mr-1" /> Logout</Button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Welcome back{profile?.full_name ? ', ' + profile.full_name.split(' ')[0] : ''}</h1>
          <p className="text-slate-600 mt-1">Track your loan applications and manage your profile.</p>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded">{error}</div>}

        {/* Active Application */}
        {active ? (
          <Card className="border-2 border-blue-200 shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-5">
              <div className="flex items-center justify-between">
                <div>
                  <Badge className="bg-white/20 hover:bg-white/20 mb-2">⚡ Active Application</Badge>
                  <h2 className="text-2xl font-bold capitalize">{active.loan_type} Loan</h2>
                  <p className="text-blue-100 mt-1">{fmtINR(active.requested_amount || active.loan_amount)} requested</p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-blue-100">Status</div>
                  <div className="font-bold text-lg capitalize">{(active.lead_status || '').replace(/_/g, ' ')}</div>
                </div>
              </div>
            </div>
            <CardContent className="p-6">
              <ProgressTracker currentIndex={stageIndex(active.lead_status)} />
              <div className="grid sm:grid-cols-3 gap-4 mt-6 text-sm">
                <div><div className="text-slate-500">Application ID</div><div className="font-mono text-xs mt-1">{active.id.slice(0,8)}</div></div>
                <div><div className="text-slate-500">Submitted</div><div className="mt-1">{new Date(active.created_at).toLocaleDateString()}</div></div>
                <div><div className="text-slate-500">Est. Eligible</div><div className="font-medium mt-1">{fmtINR(active.estimated_eligible_amount)}</div></div>
              </div>
              {active.admin_notes && (
                <div className="mt-4 bg-amber-50 border border-amber-200 rounded p-3 text-sm">
                  <div className="font-medium text-amber-900">Note from our team:</div>
                  <div className="text-amber-800 mt-1">{active.admin_notes}</div>
                </div>
              )}
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <a href={`https://wa.me/919999999999?text=${encodeURIComponent(`Hi, I'd like an update on my application ${active.id.slice(0,8)}`)}`} target="_blank" rel="noopener noreferrer" className="flex-1">
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700"><MessageCircle className="mr-2 h-4 w-4" /> Chat with Loan Expert</Button>
                </a>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-2 border-dashed">
            <CardContent className="p-8 text-center">
              <div className="text-5xl mb-3">🚀</div>
              <h2 className="text-xl font-bold mb-2">Ready to check your eligibility?</h2>
              <p className="text-slate-600 mb-5">Start a new loan application and get pre-qualified in 60 seconds.</p>
              <Link href="/eligibility"><Button size="lg" className="bg-blue-600 hover:bg-blue-700"><Plus className="mr-2 h-4 w-4" /> Start New Application</Button></Link>
            </CardContent>
          </Card>
        )}

        {/* Profile */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><User className="h-5 w-5" /> Your Profile</CardTitle></CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-4 text-sm">
            <ProfileField label="Email" value={user?.email} />
            <ProfileField label="Full Name" value={profile?.full_name || '—'} />
            <ProfileField label="Mobile" value={profile?.phone || '—'} />
            <ProfileField label="City" value={profile?.city || '—'} />
          </CardContent>
        </Card>

        {/* History */}
        {closed.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-lg">Application History</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {closed.map(a => (
                <div key={a.id} className="border rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <div className="font-medium capitalize">{a.loan_type} Loan · {fmtINR(a.requested_amount || a.loan_amount)}</div>
                    <div className="text-xs text-slate-500">Submitted {new Date(a.created_at).toLocaleDateString()}</div>
                  </div>
                  <Badge variant={a.lead_status === 'approved' || a.lead_status === 'disbursed' ? 'default' : 'secondary'} className={a.lead_status === 'approved' || a.lead_status === 'disbursed' ? 'bg-emerald-600' : ''}>{a.lead_status}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}

function ProgressTracker({ currentIndex }) {
  return (
    <div className="flex items-center">
      {STAGE_FLOW.map((s, i) => {
        const Icon = s.icon
        const done = i <= currentIndex
        const current = i === currentIndex
        return (
          <div key={s.key} className="flex-1 flex flex-col items-center relative">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center z-10 ${done ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-400'} ${current ? 'ring-4 ring-blue-200' : ''}`}>
              <Icon className="h-4 w-4" />
            </div>
            <div className={`text-[10px] sm:text-xs mt-2 text-center ${done ? 'text-slate-900 font-medium' : 'text-slate-400'}`}>{s.label}</div>
            {i < STAGE_FLOW.length - 1 && (
              <div className={`absolute top-[18px] left-1/2 w-full h-0.5 ${i < currentIndex ? 'bg-blue-600' : 'bg-slate-200'}`} style={{ zIndex: 1 }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function ProfileField({ label, value }) {
  return (
    <div>
      <div className="text-slate-500 text-xs">{label}</div>
      <div className="font-medium text-slate-900 mt-1">{value}</div>
    </div>
  )
}
