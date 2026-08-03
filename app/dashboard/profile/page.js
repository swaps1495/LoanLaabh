'use client'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getSupabaseBrowser } from '@/lib/supabase-browser'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import {
  ArrowLeft, User, Briefcase, Bell, Shield, LogOut, Trash2, Pencil, Check, X,
  Mail, Phone, MapPin, Calendar, Building2, CreditCard, Loader2, CheckCircle2,
  AlertCircle, TrendingUp, FileText, ChevronRight,
} from 'lucide-react'

const PERSONAL_FIELDS = ['full_name','phone','email','dob','gender','pan','address','city','pin_code']
const WORK_FIELDS = ['occupation_type','employer_name','work_email','office_number','work_address','total_experience_years']

const HELPLINE = '7770024242'

function initials(name) {
  if (!name) return 'U'
  return name.trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() || '').join('') || 'U'
}
function fmtDate(v) {
  if (!v) return '—'
  try { return new Date(v).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) } catch { return v }
}
function fmtGender(v) {
  if (!v) return '—'
  return v.charAt(0).toUpperCase() + v.slice(1)
}
function completion(profile, fields) {
  if (!profile) return 0
  const total = fields.length
  const filled = fields.filter(f => {
    const v = profile[f]
    return v !== null && v !== undefined && String(v).trim() !== ''
  }).length
  return Math.round((filled / total) * 100)
}

export default function ProfilePage() {
  const router = useRouter()
  const supabase = getSupabaseBrowser()
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saveState, setSaveState] = useState('idle') // idle | saving | success | error
  const [editSection, setEditSection] = useState(null) // 'personal' | 'work' | 'notifications' | null
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [form, setForm] = useState({})

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login?redirect=dashboard/profile'); return }
      setSession(session)
      await loadProfile(session.access_token)
    })()
  }, [router])

  const loadProfile = async (token) => {
    setLoading(true); setError(null)
    try {
      const res = await fetch('/api/profile', { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load profile')
      setProfile(data.profile)
      setForm(data.profile || {})
    } catch (e) { setError(e.message) } finally { setLoading(false) }
  }

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const saveSection = async (sectionFields) => {
    if (!session) return
    setSaveState('saving')
    try {
      const patch = {}
      sectionFields.forEach(k => { if (k !== 'email') patch[k] = form[k] ?? null })
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify(patch),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Save failed')
      setSaveState('success')
      setEditSection(null)
      await loadProfile(session.access_token)
      setTimeout(() => setSaveState('idle'), 2000)
    } catch (e) {
      setError(e.message); setSaveState('error')
      setTimeout(() => setSaveState('idle'), 3000)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const requestDelete = async () => {
    if (!session) return
    try {
      const res = await fetch('/api/profile/delete-request', {
        method: 'POST', headers: { Authorization: `Bearer ${session.access_token}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setConfirmDelete(false)
      await loadProfile(session.access_token)
    } catch (e) { setError(e.message) }
  }

  const personalPct = useMemo(() => completion(profile, PERSONAL_FIELDS), [profile])
  const workPct = useMemo(() => completion(profile, WORK_FIELDS), [profile])

  if (loading) return (
    <div className="min-h-screen bg-[#F7FAFF] flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-[#1261E8]" />
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F7FAFF] to-white pb-16">
      {/* HEADER */}
      <header className="bg-white border-b border-[#E3ECFA] sticky top-0 z-30">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-[#42526B] hover:text-[#1261E8]">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
          <div className="text-sm font-bold text-[#071E41]">My Profile</div>
        </div>
      </header>

      <div className="container mx-auto px-4 pt-6">
        {error && (
          <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
            <AlertCircle className="h-4 w-4 shrink-0" /> {error}
          </div>
        )}
        {saveState === 'success' && (
          <div className="mb-4 flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 text-sm">
            <CheckCircle2 className="h-4 w-4 shrink-0" /> Profile updated successfully.
          </div>
        )}
        {profile?.deletion_requested_at && (
          <div className="mb-4 flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-3 text-sm">
            <AlertCircle className="h-4 w-4 shrink-0" /> Account deletion requested on {fmtDate(profile.deletion_requested_at)}. Our team will process it within 7 business days.
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* LEFT — SUMMARY CARD */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="border-[#E3ECFA]">
              <CardContent className="p-6 text-center">
                <div className="w-24 h-24 rounded-full mx-auto bg-gradient-to-br from-[#1261E8] to-[#4E8EFF] text-white font-bold text-3xl flex items-center justify-center shadow-lg">
                  {initials(profile?.full_name)}
                </div>
                <h2 className="mt-4 text-xl font-bold text-[#071E41]">{profile?.full_name || 'Complete your profile'}</h2>
                <p className="text-xs text-[#42526B] mt-1 break-all">{profile?.email}</p>
                <p className="text-xs text-[#42526B] mt-0.5">{profile?.phone ? `+91 ${profile.phone}` : ''}</p>
                <div className="mt-4 pt-4 border-t border-[#E3ECFA] text-xs text-[#42526B]">
                  <div className="flex items-center justify-center gap-1"><Calendar className="h-3.5 w-3.5" /> Member since {fmtDate(profile?.created_at)}</div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#E3ECFA]">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Profile Summary</CardTitle>
                <CardDescription className="text-xs">Complete your profile for better loan offers</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <ProgressRow label="Personal Info" pct={personalPct} />
                <ProgressRow label="Work Info" pct={workPct} />
              </CardContent>
            </Card>

            <Card className="border-[#E3ECFA] bg-gradient-to-br from-[#EAF2FF] to-white">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-[#1261E8] text-white rounded-xl w-10 h-10 flex items-center justify-center"><TrendingUp className="h-5 w-5" /></div>
                  <div>
                    <h3 className="font-bold text-[#071E41] text-sm">Check Your Credit Score</h3>
                    <p className="text-xs text-[#42526B]">Score range 300 – 900</p>
                  </div>
                </div>
                <p className="text-xs text-[#42526B] mb-3">Monitor your financial health with our free credit report.</p>
                <Link href="/cibil-score">
                  <Button size="sm" className="w-full bg-[#1261E8] hover:bg-[#0B4FC4] rounded-xl font-semibold h-9 text-xs">Check My Credit Score <ChevronRight className="ml-1 h-3.5 w-3.5" /></Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT — DETAILS */}
          <div className="lg:col-span-2 space-y-4">
            {/* PERSONAL INFORMATION */}
            <Card className="border-[#E3ECFA]">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="text-base flex items-center gap-2"><User className="h-4 w-4 text-[#1261E8]" /> Personal Information</CardTitle>
                  <CardDescription className="text-xs">{personalPct}% complete</CardDescription>
                </div>
                {editSection === 'personal' ? (
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => { setEditSection(null); setForm(profile) }} className="h-8 px-2 text-slate-500"><X className="h-4 w-4" /></Button>
                    <Button size="sm" onClick={() => saveSection(PERSONAL_FIELDS)} disabled={saveState === 'saving'} className="h-8 bg-[#1261E8] hover:bg-[#0B4FC4] text-xs">
                      {saveState === 'saving' ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Check className="mr-1 h-3.5 w-3.5" /> Save</>}
                    </Button>
                  </div>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => setEditSection('personal')} className="h-8 text-xs">
                    <Pencil className="mr-1 h-3.5 w-3.5" /> Edit
                  </Button>
                )}
              </CardHeader>
              <CardContent className="grid sm:grid-cols-2 gap-4">
                {editSection === 'personal' ? (
                  <>
                    <FieldEdit label="Full Name" value={form.full_name} onChange={v => update('full_name', v)} />
                    <FieldReadonly label="Email (locked)" value={profile?.email} note="Email is your login ID" />
                    <FieldEdit label="Phone" value={form.phone} onChange={v => update('phone', v.replace(/\D/g,'').slice(0,10))} maxLength={10} />
                    <FieldEdit label="Date of Birth" value={form.dob || ''} onChange={v => update('dob', v)} type="date" />
                    <div>
                      <Label>Gender</Label>
                      <Select value={form.gender || ''} onValueChange={v => update('gender', v)}>
                        <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <FieldEdit label="PAN" value={form.pan} onChange={v => update('pan', v.toUpperCase().slice(0,10))} maxLength={10} placeholder="ABCDE1234F" />
                    <FieldEdit label="City" value={form.city} onChange={v => update('city', v)} />
                    <FieldEdit label="Pin Code" value={form.pin_code} onChange={v => update('pin_code', v.replace(/\D/g,'').slice(0,6))} maxLength={6} />
                    <div className="sm:col-span-2">
                      <FieldEdit label="Address" value={form.address} onChange={v => update('address', v)} placeholder="House / Building, Street, Area" />
                    </div>
                  </>
                ) : (
                  <>
                    <FieldView icon={<User className="h-3.5 w-3.5" />} label="Full Name" value={profile?.full_name} />
                    <FieldView icon={<Mail className="h-3.5 w-3.5" />} label="Email" value={profile?.email} />
                    <FieldView icon={<Phone className="h-3.5 w-3.5" />} label="Phone" value={profile?.phone ? `+91 ${profile.phone}` : null} />
                    <FieldView icon={<Calendar className="h-3.5 w-3.5" />} label="Date of Birth" value={fmtDate(profile?.dob)} />
                    <FieldView icon={<User className="h-3.5 w-3.5" />} label="Gender" value={fmtGender(profile?.gender)} />
                    <FieldView icon={<CreditCard className="h-3.5 w-3.5" />} label="PAN" value={profile?.pan} />
                    <FieldView icon={<MapPin className="h-3.5 w-3.5" />} label="City" value={profile?.city} />
                    <FieldView icon={<MapPin className="h-3.5 w-3.5" />} label="Pin Code" value={profile?.pin_code} />
                    <div className="sm:col-span-2">
                      <FieldView icon={<MapPin className="h-3.5 w-3.5" />} label="Address" value={profile?.address} />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* WORK INFORMATION */}
            <Card className="border-[#E3ECFA]">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="text-base flex items-center gap-2"><Briefcase className="h-4 w-4 text-[#1261E8]" /> Work Information</CardTitle>
                  <CardDescription className="text-xs">{workPct}% complete</CardDescription>
                </div>
                {editSection === 'work' ? (
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => { setEditSection(null); setForm(profile) }} className="h-8 px-2 text-slate-500"><X className="h-4 w-4" /></Button>
                    <Button size="sm" onClick={() => saveSection(WORK_FIELDS)} disabled={saveState === 'saving'} className="h-8 bg-[#1261E8] hover:bg-[#0B4FC4] text-xs">
                      {saveState === 'saving' ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Check className="mr-1 h-3.5 w-3.5" /> Save</>}
                    </Button>
                  </div>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => setEditSection('work')} className="h-8 text-xs">
                    <Pencil className="mr-1 h-3.5 w-3.5" /> Edit
                  </Button>
                )}
              </CardHeader>
              <CardContent className="grid sm:grid-cols-2 gap-4">
                {editSection === 'work' ? (
                  <>
                    <div>
                      <Label>Occupation Type</Label>
                      <Select value={form.occupation_type || ''} onValueChange={v => update('occupation_type', v)}>
                        <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Salaried">Salaried</SelectItem>
                          <SelectItem value="Self-Employed">Self-Employed</SelectItem>
                          <SelectItem value="Business">Business</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <FieldEdit label="Employer Name" value={form.employer_name} onChange={v => update('employer_name', v)} />
                    <FieldEdit label="Work Email" value={form.work_email} onChange={v => update('work_email', v)} type="email" />
                    <FieldEdit label="Office Number" value={form.office_number} onChange={v => update('office_number', v)} maxLength={15} />
                    <FieldEdit label="Total Experience (years)" value={form.total_experience_years} onChange={v => update('total_experience_years', v)} type="number" />
                    <div className="sm:col-span-2">
                      <FieldEdit label="Work Address" value={form.work_address} onChange={v => update('work_address', v)} placeholder="Company office address" />
                    </div>
                  </>
                ) : (
                  <>
                    <FieldView icon={<Briefcase className="h-3.5 w-3.5" />} label="Occupation Type" value={profile?.occupation_type} />
                    <FieldView icon={<Building2 className="h-3.5 w-3.5" />} label="Employer Name" value={profile?.employer_name} />
                    <FieldView icon={<Mail className="h-3.5 w-3.5" />} label="Work Email" value={profile?.work_email} />
                    <FieldView icon={<Phone className="h-3.5 w-3.5" />} label="Office Number" value={profile?.office_number} />
                    <FieldView icon={<Calendar className="h-3.5 w-3.5" />} label="Total Experience" value={profile?.total_experience_years ? `${profile.total_experience_years} years` : null} />
                    <div className="sm:col-span-2">
                      <FieldView icon={<MapPin className="h-3.5 w-3.5" />} label="Work Address" value={profile?.work_address} />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* NOTIFICATION SETTINGS */}
            <Card className="border-[#E3ECFA]">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2"><Bell className="h-4 w-4 text-[#1261E8]" /> Notification Settings</CardTitle>
                <CardDescription className="text-xs">Choose how you&apos;d like to hear from us</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <NotifRow
                  label="SMS notifications" desc="Loan updates & OTP messages"
                  checked={!!form.notif_sms}
                  onChange={async (v) => { update('notif_sms', v); await saveSection(['notif_sms']) }}
                />
                <NotifRow
                  label="Email notifications" desc="Application status & offers"
                  checked={!!form.notif_email}
                  onChange={async (v) => { update('notif_email', v); await saveSection(['notif_email']) }}
                />
                <NotifRow
                  label="WhatsApp notifications" desc="Quick chat support & reminders"
                  checked={!!form.notif_whatsapp}
                  onChange={async (v) => { update('notif_whatsapp', v); await saveSection(['notif_whatsapp']) }}
                />
              </CardContent>
            </Card>

            {/* ACCOUNT MANAGEMENT */}
            <Card className="border-[#E3ECFA]">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2"><Shield className="h-4 w-4 text-[#1261E8]" /> Account & Policies</CardTitle>
              </CardHeader>
              <CardContent className="divide-y divide-[#E3ECFA]">
                <LinkRow href="/terms" icon={<FileText className="h-4 w-4" />} label="Terms & Conditions" />
                <LinkRow href="/privacy" icon={<Shield className="h-4 w-4" />} label="Privacy Policy" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-between py-3 text-sm text-[#42526B] hover:text-[#1261E8] transition-colors"
                >
                  <span className="flex items-center gap-3"><LogOut className="h-4 w-4" /> Logout</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setConfirmDelete(true)}
                  disabled={!!profile?.deletion_requested_at}
                  className="w-full flex items-center justify-between py-3 text-sm text-red-600 hover:text-red-700 transition-colors disabled:opacity-40"
                >
                  <span className="flex items-center gap-3"><Trash2 className="h-4 w-4" /> Request Account Deletion</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </CardContent>
            </Card>

            <p className="text-center text-xs text-[#42526B] py-4">
              Need help? Call our helpline at <a href={`tel:${HELPLINE}`} className="text-[#1261E8] font-semibold">{HELPLINE}</a>
            </p>
          </div>
        </div>
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto"><Trash2 className="h-6 w-6" /></div>
            <h3 className="text-lg font-bold text-center mt-4 text-[#071E41]">Delete Account?</h3>
            <p className="text-sm text-[#42526B] text-center mt-2">
              This will submit a deletion request. Your data will be anonymized within 7 business days. Loan applications already submitted cannot be recovered.
            </p>
            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={() => setConfirmDelete(false)} className="flex-1">Cancel</Button>
              <Button onClick={requestDelete} className="flex-1 bg-red-600 hover:bg-red-700">Yes, Request Deletion</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ProgressRow({ label, pct }) {
  const color = pct >= 80 ? 'bg-emerald-500' : pct >= 40 ? 'bg-amber-500' : 'bg-red-400'
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-[#42526B] font-medium">{label}</span>
        <span className="font-bold text-[#071E41]">{pct}%</span>
      </div>
      <div className="h-2 bg-[#F7FAFF] rounded-full overflow-hidden">
        <div className={`h-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function FieldView({ icon, label, value }) {
  const empty = !value || value === '—'
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-[#42526B] font-semibold mb-1">{label}</div>
      <div className={`flex items-center gap-2 text-sm ${empty ? 'text-slate-400 italic' : 'text-[#071E41] font-medium'}`}>
        {icon && <span className="text-[#42526B]">{icon}</span>}
        <span className="break-all">{empty ? 'Not provided' : value}</span>
      </div>
    </div>
  )
}

function FieldReadonly({ label, value, note }) {
  return (
    <div>
      <Label className="text-xs text-slate-500">{label}</Label>
      <Input value={value || ''} disabled className="mt-1 bg-slate-50" />
      {note && <p className="text-[10px] text-slate-400 mt-1">{note}</p>}
    </div>
  )
}

function FieldEdit({ label, value, onChange, type = 'text', placeholder, maxLength }) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <Input
        type={type}
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className="mt-1"
      />
    </div>
  )
}

function NotifRow({ label, desc, checked, onChange }) {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <div className="text-sm font-semibold text-[#071E41]">{label}</div>
        <div className="text-xs text-[#42526B]">{desc}</div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  )
}

function LinkRow({ href, icon, label }) {
  return (
    <Link href={href} className="flex items-center justify-between py-3 text-sm text-[#42526B] hover:text-[#1261E8] transition-colors">
      <span className="flex items-center gap-3">{icon} {label}</span>
      <ChevronRight className="h-4 w-4" />
    </Link>
  )
}
