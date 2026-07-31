/**
 * Meta Conversions API (CAPI) helper for LoanLaabh
 * -----------------------------------------------------
 * Server-side event forwarding to Meta's Graph API. Works alongside
 * the browser Pixel using shared `event_id` for deduplication.
 *
 * Required env vars:
 *   META_PIXEL_ID              — same as NEXT_PUBLIC_META_PIXEL_ID
 *   META_CAPI_ACCESS_TOKEN     — server-only secret (long EAAB... token)
 *   META_CAPI_TEST_EVENT_CODE  — optional, set to TESTxxxxx while testing
 *   META_GRAPH_API_VERSION     — optional, defaults to v18.0
 *
 * PII hashing: em/ph/fn/ln are SHA-256 hashed per Meta's requirement.
 * NEVER hash: client_ip_address, client_user_agent, fbp, fbc, fbclid.
 */

import crypto from 'crypto'

const API_VERSION = process.env.META_GRAPH_API_VERSION || 'v18.0'
const PIXEL_ID = process.env.META_PIXEL_ID
const ACCESS_TOKEN = process.env.META_CAPI_ACCESS_TOKEN
const TEST_EVENT_CODE = process.env.META_CAPI_TEST_EVENT_CODE || null

export function isCapiConfigured() {
  return !!(PIXEL_ID && ACCESS_TOKEN)
}

const sha256 = (v) => crypto.createHash('sha256').update(String(v)).digest('hex')
const normEmail = (v) => String(v).trim().toLowerCase()
const normName = (v) => String(v).trim().toLowerCase()

/** Normalize Indian mobile numbers for Meta hashing (E.164 without '+'). */
function normPhone(v) {
  const digits = String(v).replace(/\D/g, '')
  if (!digits) return null
  // 10-digit Indian mobile → prepend 91 country code
  if (digits.length === 10) return '91' + digits
  return digits
}

function firstIp(v) {
  if (!v) return undefined
  const first = String(v).split(',')[0].trim()
  return first || undefined
}

/**
 * Build the user_data block for a CAPI event.
 * @param {Request} request       Next.js Request (has headers)
 * @param {Object}  input         { email, phone, fullName, fbp, fbc, fbclid, external_id }
 */
export function buildUserData(request, input = {}) {
  const h = request?.headers
  const get = (k) => (h?.get ? h.get(k) : null)

  const nameParts = String(input.fullName || '').trim().split(/\s+/)
  const firstName = nameParts[0] || null
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : null

  const phoneN = input.phone ? normPhone(input.phone) : null

  const out = {
    client_ip_address: firstIp(get('x-forwarded-for')) || firstIp(get('x-real-ip')) || undefined,
    client_user_agent: get('user-agent') || undefined,
  }
  if (input.fbp) out.fbp = String(input.fbp)
  if (input.fbc) out.fbc = String(input.fbc)
  if (input.email) out.em = [sha256(normEmail(input.email))]
  if (phoneN) out.ph = [sha256(phoneN)]
  if (firstName) out.fn = [sha256(normName(firstName))]
  if (lastName) out.ln = [sha256(normName(lastName))]
  if (input.external_id) out.external_id = [sha256(String(input.external_id))]
  if (input.city) out.ct = [sha256(normName(input.city))]
  if (input.country) out.country = [sha256(normName(input.country))]
  return out
}

/**
 * Build fbc from fbclid if fbc cookie missing. Format: fb.1.<timestamp_ms>.<fbclid>
 */
export function fbcFromFbclid(fbclid, timestampMs = Date.now()) {
  if (!fbclid) return null
  return `fb.1.${timestampMs}.${fbclid}`
}

/**
 * Fire a single Meta CAPI event.
 * @param {Object} params
 * @param {Request} params.request           Next.js Request object
 * @param {string} params.event_name         'Lead' | 'CompleteRegistration' | 'ViewContent' | ...
 * @param {string} params.event_id           Same UUID as browser Pixel eventID for dedupe
 * @param {string} params.event_source_url   Full page URL where event happened
 * @param {Object} params.user               user_data (from buildUserData)
 * @param {Object} [params.custom_data]      Optional { value, currency, content_name, content_category, ...}
 * @returns {Promise<{ok: boolean, response?: any, error?: string}>}
 */
export async function sendMetaCapiEvent({ request, event_name, event_id, event_source_url, user, custom_data }) {
  if (!isCapiConfigured()) {
    return { ok: false, error: 'CAPI not configured (missing META_PIXEL_ID or META_CAPI_ACCESS_TOKEN)' }
  }
  try {
    const eventPayload = {
      event_name,
      event_time: Math.floor(Date.now() / 1000),
      event_id,
      event_source_url,
      action_source: 'website',
      user_data: user,
    }
    if (custom_data) eventPayload.custom_data = custom_data

    const body = { data: [eventPayload] }
    if (TEST_EVENT_CODE) body.test_event_code = TEST_EVENT_CODE

    const url = `https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events?access_token=${encodeURIComponent(ACCESS_TOKEN)}`
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const text = await res.text()
    let json = null
    try { json = text ? JSON.parse(text) : {} } catch { json = { raw: text } }
    if (!res.ok) {
      console.warn('[Meta CAPI] failed', res.status, text?.slice(0, 300))
      return { ok: false, status: res.status, error: json?.error?.message || text }
    }
    return { ok: true, response: json }
  } catch (e) {
    console.warn('[Meta CAPI] exception', e?.message)
    return { ok: false, error: e?.message || 'unknown' }
  }
}

/**
 * Fire a CAPI event but never throw — use inside API handlers so
 * marketing failures don't break user-facing flows.
 */
export async function sendMetaCapiEventSafe(params) {
  try {
    return await sendMetaCapiEvent(params)
  } catch (e) {
    console.warn('[Meta CAPI safe] swallowed', e?.message)
    return { ok: false, error: e?.message }
  }
}
