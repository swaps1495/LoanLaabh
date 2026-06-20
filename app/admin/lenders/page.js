'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getSupabaseBrowser } from '@/lib/supabase-browser'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Loader2, ChevronLeft, Plus, Edit, Trash2 } from 'lucide-react'

const LOAN_TYPES = ['personal','business','home','lap','car']
const EMPLOYMENT = ['salaried','self_employed','business_owner']

const empty = {
  name:'', loan_types: ['personal'], min_cibil: 700, min_age: 21, max_age: 60,
  min_net_salary: 25000, pf_mandatory: false, pt_mandatory: false,
  accepts_employment: ['salaried'], foir_max: 65, foir_max_high_income: 70,
  high_income_threshold: 75000, min_loan_amount: 50000, max_loan_amount: 5000000,
  interest_rate_min: 11, interest_rate_max: 22, city_restrictions: [],
  notes: '', active: true,
}

export default function LendersPage() {
  const [lenders, setLenders] = useState([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(empty)
  const [error, setError] = useState('')
  const [authHeaders, setAuthHeaders] = useState({})

  useEffect(() => {
    (async () => {
      const sb = getSupabaseBrowser()
      const { data: { session } } = await sb.auth.getSession()
      if (session) setAuthHeaders({ Authorization: `Bearer ${session.access_token}` })
      load()
    })()
  }, [])

  const load = async () => {
    setLoading(true)
    try {
      const sb = getSupabaseBrowser()
      const { data: { session } } = await sb.auth.getSession()
      const headers = session ? { Authorization: `Bearer ${session.access_token}` } : {}
      const res = await fetch('/api/lender-criteria', { headers })
      const data = await res.json()
      if (res.ok) setLenders(data.lenders || [])
      else if (res.status === 401) window.location.href = '/admin'
      else setError(data.error)
    } finally { setLoading(false) }
  }

  const openNew = () => { setEditing(null); setForm(empty); setOpenDialog(true) }
  const openEdit = (l) => { setEditing(l.id); setForm({ ...empty, ...l }); setOpenDialog(true) }
  const remove = async (l) => {
    if (!confirm(`Delete ${l.name}?`)) return
    await fetch(`/api/lender-criteria/${l.id}`, { method: 'DELETE', headers: authHeaders })
    load()
  }
  const save = async () => {
    setError('')
    const payload = { ...form,
      min_cibil: Number(form.min_cibil), min_age: Number(form.min_age), max_age: Number(form.max_age),
      min_net_salary: Number(form.min_net_salary), foir_max: Number(form.foir_max),
      foir_max_high_income: Number(form.foir_max_high_income), high_income_threshold: Number(form.high_income_threshold),
      min_loan_amount: Number(form.min_loan_amount), max_loan_amount: Number(form.max_loan_amount),
      interest_rate_min: Number(form.interest_rate_min), interest_rate_max: Number(form.interest_rate_max),
    }
    delete payload.id; delete payload.created_at
    const url = editing ? `/api/lender-criteria/${editing}` : '/api/lender-criteria'
    const res = await fetch(url, { method: editing ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders }, body: JSON.stringify(payload) })
    const data = await res.json()
    if (!res.ok) { setError(data.error || 'Save failed'); return }
    setOpenDialog(false); load()
  }
  const toggleActive = async (l) => {
    await fetch(`/api/lender-criteria/${l.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', ...authHeaders }, body: JSON.stringify({ active: !l.active }) })
    load()
  }

  const toggleArr = (key, val) => setForm(f => {
    const arr = new Set(f[key] || []); arr.has(val) ? arr.delete(val) : arr.add(val); return { ...f, [key]: [...arr] }
  })

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b sticky top-0 z-30">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link href="/admin"><Button variant="ghost" size="sm"><ChevronLeft className="h-4 w-4" /> Back</Button></Link>
            <span className="font-bold">Lender Criteria Manager</span>
          </div>
          <Button onClick={openNew} className="bg-blue-600 hover:bg-blue-700"><Plus className="mr-1 h-4 w-4" /> Add Lender</Button>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-4">{error}</div>}
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="text-left p-3">Name</th>
                  <th className="text-center p-3">CIBIL</th>
                  <th className="text-center p-3">Age</th>
                  <th className="text-right p-3">Min Salary</th>
                  <th className="text-center p-3">PF/PT</th>
                  <th className="text-center p-3">FOIR</th>
                  <th className="text-left p-3">Loan Types</th>
                  <th className="text-center p-3">Active</th>
                  <th className="text-center p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && <tr><td colSpan={9} className="p-10 text-center"><Loader2 className="animate-spin h-6 w-6 mx-auto text-blue-600" /></td></tr>}
                {lenders.map(l => (
                  <tr key={l.id} className="border-t hover:bg-slate-50">
                    <td className="p-3 font-medium">{l.name}<div className="text-xs text-slate-500">{l.notes}</div></td>
                    <td className="p-3 text-center">{l.min_cibil}+</td>
                    <td className="p-3 text-center text-xs">{l.min_age}-{l.max_age}</td>
                    <td className="p-3 text-right">₹{Number(l.min_net_salary).toLocaleString('en-IN')}</td>
                    <td className="p-3 text-center text-xs">{l.pf_mandatory?'PF✓':'—'} {l.pt_mandatory?'PT✓':''}</td>
                    <td className="p-3 text-center text-xs">{l.foir_max}% / {l.foir_max_high_income}%</td>
                    <td className="p-3"><div className="flex gap-1 flex-wrap">{(l.loan_types||[]).map(t => <Badge key={t} variant="outline" className="text-xs capitalize">{t}</Badge>)}</div></td>
                    <td className="p-3 text-center"><Switch checked={l.active} onCheckedChange={() => toggleActive(l)} /></td>
                    <td className="p-3 text-center">
                      <Button size="sm" variant="ghost" onClick={() => openEdit(l)}><Edit className="h-3 w-3" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => remove(l)}><Trash2 className="h-3 w-3 text-red-500" /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </main>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? 'Edit' : 'Add'} Lender</DialogTitle></DialogHeader>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Lender Name"><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></Field>
            <Field label="Notes"><Input value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} /></Field>
            <Field label="Min CIBIL"><Input type="number" value={form.min_cibil} onChange={e => setForm({...form, min_cibil: e.target.value})} /></Field>
            <Field label="Min Salary (₹)"><Input type="number" value={form.min_net_salary} onChange={e => setForm({...form, min_net_salary: e.target.value})} /></Field>
            <Field label="Min Age"><Input type="number" value={form.min_age} onChange={e => setForm({...form, min_age: e.target.value})} /></Field>
            <Field label="Max Age"><Input type="number" value={form.max_age} onChange={e => setForm({...form, max_age: e.target.value})} /></Field>
            <Field label="FOIR Max %"><Input type="number" value={form.foir_max} onChange={e => setForm({...form, foir_max: e.target.value})} /></Field>
            <Field label="FOIR Max (High Income) %"><Input type="number" value={form.foir_max_high_income} onChange={e => setForm({...form, foir_max_high_income: e.target.value})} /></Field>
            <Field label="High Income Threshold (₹)"><Input type="number" value={form.high_income_threshold} onChange={e => setForm({...form, high_income_threshold: e.target.value})} /></Field>
            <Field label="Min Loan (₹)"><Input type="number" value={form.min_loan_amount} onChange={e => setForm({...form, min_loan_amount: e.target.value})} /></Field>
            <Field label="Max Loan (₹)"><Input type="number" value={form.max_loan_amount} onChange={e => setForm({...form, max_loan_amount: e.target.value})} /></Field>
            <Field label="Interest Min %"><Input type="number" step="0.01" value={form.interest_rate_min} onChange={e => setForm({...form, interest_rate_min: e.target.value})} /></Field>
            <Field label="Interest Max %"><Input type="number" step="0.01" value={form.interest_rate_max} onChange={e => setForm({...form, interest_rate_max: e.target.value})} /></Field>
            <div className="sm:col-span-2">
              <Label>Loan Types</Label>
              <div className="flex flex-wrap gap-2 mt-1">{LOAN_TYPES.map(lt => (
                <button key={lt} type="button" onClick={() => toggleArr('loan_types', lt)}
                  className={`px-3 py-1 text-xs rounded-full border capitalize ${(form.loan_types||[]).includes(lt) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-slate-300'}`}>{lt}</button>
              ))}</div>
            </div>
            <div className="sm:col-span-2">
              <Label>Accepted Employment</Label>
              <div className="flex flex-wrap gap-2 mt-1">{EMPLOYMENT.map(emp => (
                <button key={emp} type="button" onClick={() => toggleArr('accepts_employment', emp)}
                  className={`px-3 py-1 text-xs rounded-full border capitalize ${(form.accepts_employment||[]).includes(emp) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-slate-300'}`}>{emp.replace('_',' ')}</button>
              ))}</div>
            </div>
            <Field label="City Restrictions (comma-sep, blank = pan-India)">
              <Input value={(form.city_restrictions || []).join(', ')} onChange={e => setForm({...form, city_restrictions: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} />
            </Field>
            <div className="flex items-center gap-4 sm:col-span-2 mt-2">
              <label className="flex items-center gap-2"><Switch checked={form.pf_mandatory} onCheckedChange={v => setForm({...form, pf_mandatory: v})} /> PF Mandatory</label>
              <label className="flex items-center gap-2"><Switch checked={form.pt_mandatory} onCheckedChange={v => setForm({...form, pt_mandatory: v})} /> PT Mandatory</label>
              <label className="flex items-center gap-2"><Switch checked={form.active} onCheckedChange={v => setForm({...form, active: v})} /> Active</label>
            </div>
          </div>
          {error && <div className="bg-red-50 border border-red-200 text-red-700 p-2 rounded mt-3 text-sm">{error}</div>}
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button onClick={save} className="bg-blue-600 hover:bg-blue-700">{editing ? 'Update' : 'Create'}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
function Field({ label, children }) { return <div><Label>{label}</Label>{children}</div> }
