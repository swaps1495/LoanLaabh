'use client'
import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, LogOut, Lock, Users, TrendingUp, Download, Settings, ChevronDown } from 'lucide-react'

const STATUSES = ['New','Qualified','Hot','Applied','Approved','Rejected','Disbursed']
const PRIORITIES = ['Hot','Warm','Cold']
const LOAN_TYPES_LBL = { personal:'Personal', business:'Business', home:'Home', lap:'LAP', car:'Car' }
const fmtINR = (n) => '₹' + Number(n || 0).toLocaleString('en-IN')

export default function AdminPage() {
  const [authed, setAuthed] = useState(null)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [leads, setLeads] = useState([])
  const [openLead, setOpenLead] = useState(null)
  const [filters, setFilters] = useState({ status: 'all', loanType: 'all', city: '', priority: 'all', dateFrom: '', dateTo: '' })

  useEffect(() => { fetch('/api/admin/check').then(r => r.json()).then(d => setAuthed(d.authenticated)) }, [])
  useEffect(() => { if (authed) loadLeads() }, [authed])

  const login = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      const res = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setAuthed(true)
    } catch (e) { setError(e.message) } finally { setLoading(false) }
  }
  const logout = async () => { await fetch('/api/admin/logout', { method: 'POST' }); setAuthed(false) }
  const loadLeads = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/leads')
      const data = await res.json()
      if (res.ok) setLeads(data.leads || []); else setError(data.error)
    } finally { setLoading(false) }
  }
  const updateStatus = async (id, status) => {
    await fetch(`/api/leads/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ lead_status: status }) })
    setLeads(prev => prev.map(l => l.id === id ? { ...l, lead_status: status } : l))
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
            <div className="mx-auto bg-blue-600 text-white rounded-2xl w-14 h-14 flex items-center justify-center mb-2"><Lock /></div>
            <CardTitle className="text-2xl">LoanLaabh Admin</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={login} className="space-y-4">
              <div><Label>Password</Label><Input type="password" value={password} onChange={e => setPassword(e.target.value)} autoFocus /></div>
              {error && <div className="text-red-600 text-sm">{error}</div>}
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>{loading ? <Loader2 className="animate-spin h-4 w-4" /> : 'Sign in'}</Button>
            </form>
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
            <span className="bg-blue-600 text-white rounded-lg w-8 h-8 flex items-center justify-center">L</span>
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
