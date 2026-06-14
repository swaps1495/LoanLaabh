import { createClient } from '@supabase/supabase-js'

let cachedServerClient = null
export function getSupabaseServer() {
  if (cachedServerClient) return cachedServerClient
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) return null
  cachedServerClient = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  return cachedServerClient
}

export function isSupabaseConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
}

// Validate Authorization: Bearer <jwt> header and return user data
export async function getUserFromAuthHeader(request) {
  const auth = request.headers.get('authorization') || request.headers.get('Authorization')
  if (!auth?.startsWith('Bearer ')) return null
  const token = auth.slice(7)
  const sb = getSupabaseServer()
  if (!sb) return null
  const { data, error } = await sb.auth.getUser(token)
  if (error || !data?.user) return null
  return data.user
}

export async function isUserAdmin(user) {
  if (!user?.email) return false
  const sb = getSupabaseServer()
  if (!sb) return false
  const { data } = await sb.from('admins').select('email').eq('email', user.email).maybeSingle()
  return !!data
}
