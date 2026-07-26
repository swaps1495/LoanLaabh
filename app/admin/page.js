'use client'
import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getSupabaseBrowser } from '@/lib/supabase-browser'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, LogOut, Lock, Users, TrendingUp, Download, Settings, ChevronDown, Mail, ShieldCheck } from 'lucide-react'

const STATUSES = ['New','submitted','docs_pending','sent_to_lender','under_review','approved','rejected','disbursed','expired','withdrawn']
const PRIORITIES = ['Hot','Warm','Cold']
const LOAN_TYPES_LBL = { personal:'Personal', business:'Business', home:'Home', lap:'LAP', car:'Car' }
const fmtINR = (n) => '₹' + Number(n || 0).toLocaleString('en-IN')

export default function AdminPage() {
  const router = useRouter()
  const [authed, setAuthed] = useState(null)
  const [authSource, setAuthSource] = useState(null) // 'auth' | 'legacy_cookie'
  const [session, setSession] = useState(null)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [leads, setLeads] = useState([])
  const [leadCaptures, setLeadCaptures] = useState([])
  const [activeTab, setActiveTab] = useState('leads') // 'leads' | 'captures'
  const [openLead, setOpenLead] = useState(null)
  const [editingNote, setEditingNote] = useState(null)
  const [noteDraft, setNoteDraft] = useState('')
  const [filters, setFilters] = useState({ status: 'all', loanType: 'all', city: '', priority: 'all', dateFrom: '', dateTo: '' })

  // On mount: check Supabase session AND legacy cookie
  useEffect(() => {
    (async () => {
      const sb = getSupabaseBrowser()
      const { data: { session: s } } = await sb.auth.getSession()
      if (s) {
        setSession(s)
        // Check if this email is in admins table
        const res = await fetch('/api/admin/check', { headers: { Authorization: `Bearer ${s.access_token}` } })
        const data = await res.json()
        if (data.authenticated) { setAuthed(true); setAuthSource(data.source); return }
      }
      // Fallback: legacy cookie check
      const res = await fetch('/api/admin/check')
      const data = await res.json()
      setAuthed(data.authenticated)
      setAuthSource(data.source)
    })()
  }, [])

  const authHeaders = useMemo(() => session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}, [session])

  useEffect(() => { if (authed) { loadLeads(); loadLeadCaptures() } }, [authed, session])

  const login = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      const res = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setAuthed(true); setAuthSource('legacy_cookie')
    } catch (e) { setError(e.message) } finally { setLoading(false) }
  }

  const logout = async () => {
    if (session) { const sb = getSupabaseBrowser(); await sb.auth.signOut() }
    await fetch('/api/admin/logout', { method: 'POST' })
    setAuthed(false); setSession(null); setAuthSource(null)
  }

  const loadLeads = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/leads', { headers: authHeaders })
      let data = null
      try { data = await res.json() } catch { data = { error: 'Server returned invalid response' } }
      if (res.ok) setLeads(data.leads || [])
      else if (data?.code === 'SUPABASE_UNREACHABLE') setError('⚠️ ' + data.error)
      else setError(data?.error || `Failed to load leads (HTTP ${res.status})`)
    } catch (e) {
      setError('⚠️ Network error: unable to reach the server. If this persists, your Supabase project may be paused — visit https://app.supabase.com to restore it.')
    } finally { setLoading(false) }
  }

  const loadLeadCaptures = async () => {
    try {
      const res = await fetch('/api/lead-captures', { headers: authHeaders })
      let data = null
      try { data = await res.json() } catch { data = null }
      if (res.ok) setLeadCaptures(data?.lead_captures || [])
    } catch (_) { /* non-blocking */ }
  }

  const updateStatus = async (id, status) => {
    await fetch(`/api/leads/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', ...authHeaders }, body: JSON.stringify({ lead_status: status }) })
    setLeads(prev => prev.map(l => l.id === id ? { ...l, lead_status: status } : l))
  }

  const saveNote = async (id) => {
    await fetch(`/api/leads/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', ...authHeaders }, body: JSON.stringify({ admin_notes: noteDraft }) })
    setLeads(prev => prev.map(l => l.id === id ? { ...l, admin_notes: noteDraft } : l))
    setEditingNote(null); setNoteDraft('')
  }

  const filtered = useMemo(() => leads.filter(l => {
    if (filters.status !== 'all' && l.lead_status !== filters.status) return false
    if (filters.loanType !== 'all' && l.loan_type !== filters.loanType) return false
    if (filters.priority !== 'all' && l.sales_priority !== filters.priority) return false
    if (filters.city && !(l.city || '').toLowerCase().includes(filters.city.toLowerCase())) return false
    if (filters.dateFrom && new Date(l.created_at) < new Date(filters.dateFrom)) return false
    if (filters.dateTo && new Date(l.created_at) > new Date(filters.dateTo + 'T23:59:59')) return false
    return true
  }), [leads, filters])

  const exportCSV = () => {
    const cols = ['created_at','full_name','mobile','pan','city','pincode','age','residence_type','employment_type','company_name','designation','total_experience_years','net_monthly_salary','existing_emi','foir','pf_deducted','pt_deducted','loan_type','loan_amount','loan_purpose','credit_band','recent_enquiries','lead_score','approval_probability','estimated_eligible_amount','sales_priority','risk_flags','internal_notes','lead_status']
    const escape = (v) => `"${String(v ?? '').replace(/"/g,'""')}"`
    const rows = [cols.join(',')]
    filtered.forEach(l => rows.push(cols.map(c => escape(Array.isArray(l[c]) ? l[c].join('; ') : l[c])).join(',')))
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `loanlaabh-leads-${new Date().toISOString().slice(0,10)}.csv`; a.click()
  }

  if (authed === null) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-blue-600" /></div>
  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-blue-50 p-4">
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto bg-blue-600 text-white rounded-2xl w-14 h-14 flex items-center justify-center mb-2"><ShieldCheck /></div>
            <CardTitle className="text-2xl">LoanLaabh Admin</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/login?redirect=/admin">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 h-11"><Mail className="mr-2 h-4 w-4" /> Sign in with Email OTP</Button>
            </Link>
            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
              <div className="relative text-center text-xs text-slate-400 bg-white px-3 inline-block left-1/2 -translate-x-1/2">or use legacy password</div>
            </div>
            <form onSubmit={login} className="space-y-3">
              <div><Label className="text-sm">Admin Password (legacy)</Label><Input type="password" value={password} onChange={e => setPassword(e.target.value)} /></div>
              {error && <div className="text-red-600 text-sm">{error}</div>}
              <Button type="submit" variant="outline" className="w-full" disabled={loading}>{loading ? <Loader2 className="animate-spin h-4 w-4" /> : 'Sign in with password'}</Button>
            </form>
            <p className="text-xs text-slate-500 text-center pt-2">Email OTP login requires your email to be in the admins whitelist.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const totalLoanReq = filtered.reduce((s, l) => s + Number(l.loan_amount || 0), 0)
  const hot = filtered.filter(l => l.sales_priority === 'Hot').length

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2 font-bold">
            <img src="/logo-icon.png" alt="LoanLaabh logo" className="w-9 h-9 object-contain" />
            <span>LoanLaabh <span className="text-slate-400 font-normal text-sm">/ Admin</span></span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin/lenders"><Button variant="ghost" size="sm"><Settings className="h-4 w-4 mr-1" /> Lenders</Button></Link>
            <Button variant="ghost" size="sm" onClick={logout}><LogOut className="h-4 w-4 mr-1" /> Logout</Button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Leads Dashboard</h1>
          <Button onClick={exportCSV} className="bg-emerald-600 hover:bg-emerald-700"><Download className="mr-2 h-4 w-4" /> Export CSV</Button>
        </div>

        {/* TAB SWITCHER */}
        <div className="flex gap-2 mb-6 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('leads')}
            className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-px transition ${activeTab === 'leads' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            Full Leads <span className="ml-1 text-xs bg-slate-100 rounded-full px-2 py-0.5">{leads.length}</span>
          </button>
          <button
            onClick={() => setActiveTab('captures')}
            className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-px transition ${activeTab === 'captures' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            Lead Captures (Pre-Eligibility) <span className="ml-1 text-xs bg-slate-100 rounded-full px-2 py-0.5">{leadCaptures.length}</span>
          </button>
        </div>

        {activeTab === 'captures' ? (
          <LeadCapturesTable rows={leadCaptures} />
        ) : (
        <>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <StatCard icon={<Users />} label="Total Leads" value={filtered.length} />
          <StatCard icon={<TrendingUp />} label="🔥 Hot Leads" value={hot} />
          <StatCard icon={<TrendingUp />} label="Total Requested" value={fmtINR(totalLoanReq)} />
          <StatCard icon={<TrendingUp />} label="Avg Loan" value={fmtINR(filtered.length ? Math.round(totalLoanReq/filtered.length) : 0)} />
        </div>

        <Card className="mb-4">
          <CardContent className="p-4 grid grid-cols-2 md:grid-cols-6 gap-3">
            <Filter label="Status" value={filters.status} options={['all',...STATUSES]} onChange={v => setFilters({...filters, status: v})} />
            <Filter label="Loan Type" value={filters.loanType} options={['all',...Object.keys(LOAN_TYPES_LBL)]} onChange={v => setFilters({...filters, loanType: v})} />
            <Filter label="Priority" value={filters.priority} options={['all',...PRIORITIES]} onChange={v => setFilters({...filters, priority: v})} />
            <div><Label className="text-xs">City</Label><Input value={filters.city} onChange={e => setFilters({...filters, city: e.target.value})} placeholder="Search..." className="h-9" /></div>
            <div><Label className="text-xs">From</Label><Input type="date" value={filters.dateFrom} onChange={e => setFilters({...filters, dateFrom: e.target.value})} className="h-9" /></div>
            <div><Label className="text-xs">To</Label><Input type="date" value={filters.dateTo} onChange={e => setFilters({...filters, dateTo: e.target.value})} className="h-9" /></div>
          </CardContent>
        </Card>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-4">{error}</div>}

        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="text-left p-3">Lead</th>
                  <th className="text-left p-3">Loan</th>
                  <th className="text-right p-3">Amount</th>
                  <th className="text-right p-3">Salary</th>
                  <th className="text-center p-3">FOIR</th>
                  <th className="text-center p-3">CIBIL</th>
                  <th className="text-center p-3">Score</th>
                  <th className="text-center p-3">Priority</th>
                  <th className="text-center p-3">Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {loading && <tr><td colSpan={10} className="p-10 text-center"><Loader2 className="animate-spin h-6 w-6 mx-auto text-blue-600" /></td></tr>}
                {!loading && filtered.length === 0 && <tr><td colSpan={10} className="p-10 text-center text-slate-500">No leads match the filters</td></tr>}
                {filtered.map(l => (
                  <LeadRow key={l.id} l={l} open={openLead === l.id} onToggle={() => setOpenLead(openLead === l.id ? null : l.id)} onStatus={s => updateStatus(l.id, s)} />
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
        </>
        )}
      </main>
    </div>
  )
}

function LeadRow({ l, open, onToggle, onStatus }) {
  const priColor = l.sales_priority === 'Hot' ? 'bg-red-500' : l.sales_priority === 'Warm' ? 'bg-amber-500' : 'bg-slate-400'
  const apColor = l.approval_probability === 'High' ? 'bg-emerald-600' : l.approval_probability === 'Medium' ? 'bg-amber-500' : 'bg-slate-500'
  return (
    <>
      <tr className="border-t hover:bg-slate-50 cursor-pointer" onClick={onToggle}>
        <td className="p-3">
          <div className="font-medium">{l.full_name}</div>
          <div className="text-xs text-slate-500">{l.mobile} · {l.city || '—'}</div>
        </td>
        <td className="p-3"><Badge variant="outline" className="capitalize">{LOAN_TYPES_LBL[l.loan_type] || l.loan_type}</Badge><div className="text-xs text-slate-500 mt-1">{l.loan_purpose}</div></td>
        <td className="p-3 text-right font-medium">{fmtINR(l.loan_amount)}</td>
        <td className="p-3 text-right">{fmtINR(l.net_monthly_salary)}</td>
        <td className="p-3 text-center"><span className={Number(l.foir||0) > 65 ? 'text-red-600 font-medium' : ''}>{l.foir || 0}%</span></td>
        <td className="p-3 text-center text-xs capitalize">{l.credit_band}</td>
        <td className="p-3 text-center"><Badge className={apColor}>{l.lead_score ?? '—'}</Badge></td>
        <td className="p-3 text-center">{l.sales_priority && <Badge className={priColor}>{l.sales_priority}</Badge>}</td>
        <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
          <Select value={l.lead_status || 'New'} onValueChange={onStatus}>
            <SelectTrigger className="h-8 w-28 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </td>
        <td className="p-3"><ChevronDown className={`h-4 w-4 transition ${open ? 'rotate-180' : ''}`} /></td>
      </tr>
      {open && (
        <tr className="bg-blue-50/50"><td colSpan={10} className="p-5">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-bold mb-3 text-slate-700">Profile Details</h4>
              <Detail k="PAN" v={l.pan} /><Detail k="Pincode" v={l.pincode} /><Detail k="Age" v={l.age} />
              <Detail k="Residence" v={l.residence_type} /><Detail k="Employment" v={l.employment_type} />
              <Detail k="Company" v={l.company_name} /><Detail k="Designation" v={l.designation} />
              <Detail k="Experience" v={l.total_experience_years ? `${l.total_experience_years} yrs (${l.current_company_experience_years}y current)` : '—'} />
              <Detail k="Salary Bank" v={l.salary_account_bank} />
              <Detail k="Existing EMI" v={fmtINR(l.existing_emi)} />
              <Detail k="PF/PT" v={`${l.pf_deducted ? 'PF ✓' : 'PF ✗'} · ${l.pt_deducted ? 'PT ✓' : 'PT ✗'}`} />
              <Detail k="Recent Enquiries" v={l.recent_enquiries} />
            </div>
            <div>
              <h4 className="font-bold mb-3 text-slate-700">AI Analysis ({l.ai_provider})</h4>
              <Detail k="Approval Probability" v={l.approval_probability} />
              <Detail k="Est. Eligible Amount" v={fmtINR(l.estimated_eligible_amount)} />
              <Detail k="Risk Flags" v={(l.risk_flags || []).join(', ') || 'None'} />
              <div className="mt-3">
                <div className="text-xs text-slate-500 mb-1">Internal Notes</div>
                <div className="text-sm bg-white p-2 rounded border">{l.internal_notes || '—'}</div>
              </div>
              {l.matches?.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-bold mb-2 text-slate-700 text-sm">Matched Lenders (internal)</h4>
                  <div className="space-y-1">
                    {l.matches.sort((a,b) => b.match_score - a.match_score).slice(0,6).map(m => (
                      <div key={m.id} className="flex justify-between bg-white px-3 py-2 rounded border text-xs">
                        <span className="font-medium">{m.lender_criteria?.name}</span>
                        <span className="text-slate-600">EMI {fmtINR(m.estimated_emi)} @ {m.estimated_interest_rate}% · Score {m.match_score}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </td></tr>
      )}
    </>
  )
}

function Detail({ k, v }) {
  return <div className="flex justify-between text-sm py-1 border-b border-slate-100"><span className="text-slate-500">{k}</span><span className="font-medium text-slate-800 capitalize">{v || '—'}</span></div>
}
function Filter({ label, value, options, onChange }) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-9 text-sm capitalize"><SelectValue /></SelectTrigger>
        <SelectContent>{options.map(o => <SelectItem key={o} value={o} className="capitalize">{o}</SelectItem>)}</SelectContent>
      </Select>
    </div>
  )
}
function StatCard({ icon, label, value }) {
  return <Card><CardContent className="p-5 flex items-center gap-4">
    <div className="bg-blue-100 text-blue-700 rounded-xl p-3">{icon}</div>
    <div><div className="text-sm text-slate-500">{label}</div><div className="text-2xl font-bold">{value}</div></div>
  </CardContent></Card>
}

function LeadCapturesTable({ rows }) {
  const [q, setQ] = useState('')
  const [sourceFilter, setSourceFilter] = useState('all')
  const sources = useMemo(() => {
    const set = new Set()
    rows.forEach(r => { if (r.original_source_type) set.add(r.original_source_type) })
    return ['all', ...Array.from(set).sort()]
  }, [rows])
  const filtered = useMemo(() => rows.filter(r => {
    if (sourceFilter !== 'all' && r.original_source_type !== sourceFilter) return false
    if (!q) return true
    const s = q.toLowerCase()
    return (r.full_name || '').toLowerCase().includes(s) ||
      (r.mobile || '').includes(s) ||
      (r.email || '').toLowerCase().includes(s) ||
      (r.original_utm_campaign || '').toLowerCase().includes(s)
  }), [rows, q, sourceFilter])

  const fmtDate = (d) => d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'

  const exportCSV = () => {
    if (!filtered.length) return
    const headers = ['Full Name','Mobile','Email','Source','UTM Source','UTM Campaign','UTM Medium','Landing Page','Referrer','Device','Browser','Retry Count','Tags','Latest Source','Latest Campaign','Source CTA','First Visit','Last Activity','Consent','OTP Verified']
    const rows2 = filtered.map(r => [
      r.full_name, r.mobile, r.email,
      r.original_source_type || 'Direct',
      r.original_utm_source || '', r.original_utm_campaign || '', r.original_utm_medium || '',
      r.original_landing_page || '', r.original_referrer || '',
      r.original_device_type || '', r.original_browser || '',
      r.retry_count || 0,
      Array.isArray(r.tags) ? r.tags.join('|') : '',
      r.latest_source_type || '', r.latest_utm_campaign || '',
      r.latest_source_cta || r.source_cta || '',
      r.first_visit_at || r.created_at || '', r.last_activity_at || r.updated_at || r.created_at || '',
      r.consent ? 'Yes' : 'No', r.otp_verified ? 'Yes' : 'No',
    ])
    const csv = [headers, ...rows2].map(row => row.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `lead-captures-${new Date().toISOString().split('T')[0]}.csv`
    a.click(); URL.revokeObjectURL(url)
  }

  return (
    <>
      <Card className="mb-4">
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
          <div>
            <Label className="text-xs">Search</Label>
            <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Name, mobile, email, campaign..." className="h-9" />
          </div>
          <Filter label="Source Type" value={sourceFilter} options={sources} onChange={setSourceFilter} />
          <Button onClick={exportCSV} size="sm" className="bg-emerald-600 hover:bg-emerald-700 h-9"><Download className="mr-2 h-4 w-4" /> Export CSV ({filtered.length})</Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="text-left p-3">Name / Contact</th>
                <th className="text-left p-3">Source</th>
                <th className="text-left p-3">Campaign</th>
                <th className="text-left p-3">Landing Page</th>
                <th className="text-center p-3">Device</th>
                <th className="text-center p-3">Retries</th>
                <th className="text-left p-3">Tags</th>
                <th className="text-left p-3">First Visit</th>
                <th className="text-left p-3">Last Activity</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={9} className="p-10 text-center text-slate-500">No lead captures yet</td></tr>}
              {filtered.map(r => (
                <tr key={r.id} className="border-t hover:bg-slate-50">
                  <td className="p-3">
                    <div className="font-medium">{r.full_name}</div>
                    <div className="text-xs text-slate-500">{r.mobile}</div>
                    <div className="text-xs text-slate-500 break-all">{r.email}</div>
                  </td>
                  <td className="p-3">
                    <Badge className={sourceBadgeColor(r.original_source_type)}>{r.original_source_type || 'Direct'}</Badge>
                    {r.original_utm_source && <div className="text-xs text-slate-500 mt-1">{r.original_utm_source}{r.original_utm_medium ? ' · ' + r.original_utm_medium : ''}</div>}
                  </td>
                  <td className="p-3 max-w-[180px]">
                    <div className="text-xs truncate" title={r.original_utm_campaign}>{r.original_utm_campaign || '—'}</div>
                    {r.original_utm_content && <div className="text-[10px] text-slate-400 truncate" title={r.original_utm_content}>{r.original_utm_content}</div>}
                  </td>
                  <td className="p-3 max-w-[200px]">
                    <div className="text-xs truncate" title={r.original_landing_page}>{r.original_landing_page || '—'}</div>
                    {r.original_referrer && <div className="text-[10px] text-slate-400 truncate" title={r.original_referrer}>via {r.original_referrer}</div>}
                  </td>
                  <td className="p-3 text-center text-xs">
                    <div>{r.original_device_type || '—'}</div>
                    <div className="text-[10px] text-slate-400">{r.original_browser}</div>
                  </td>
                  <td className="p-3 text-center">
                    {r.retry_count > 0
                      ? <Badge className="bg-amber-500">{r.retry_count}</Badge>
                      : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="p-3 max-w-[160px]">
                    <div className="flex flex-wrap gap-1">
                      {(r.tags || []).slice(0, 3).map(t => (
                        <span key={t} className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">{t}</span>
                      ))}
                    </div>
                  </td>
                  <td className="p-3 text-xs text-slate-600 whitespace-nowrap">{fmtDate(r.first_visit_at || r.created_at)}</td>
                  <td className="p-3 text-xs text-slate-600 whitespace-nowrap">{fmtDate(r.last_activity_at || r.updated_at || r.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </>
  )
}

function sourceBadgeColor(src) {
  const map = {
    'Meta Ads': 'bg-blue-600',
    'Google Ads': 'bg-red-500',
    'Organic Search': 'bg-emerald-600',
    'Direct': 'bg-slate-500',
    'Referral': 'bg-purple-500',
    'WhatsApp': 'bg-green-600',
    'Chatbot': 'bg-indigo-500',
    'Email Campaign': 'bg-amber-500',
    'SMS Campaign': 'bg-cyan-500',
    'RCS Campaign': 'bg-teal-500',
    'Partner Referral': 'bg-fuchsia-500',
  }
  return map[src] || 'bg-slate-400'
}

