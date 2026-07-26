/**
 * LoanLaabh Phase-1 Attribution Capture (client-side only)
 *
 * - On first visit to any page: capture original UTM/referrer/landing/device
 *   info and freeze it in localStorage under `ll_attribution_original`.
 * - On every visit: refresh `ll_attribution_latest` (used for returning-user
 *   re-attribution). Original is NEVER overwritten.
 * - Also captures Meta identifiers (_fbp, _fbc cookies + fbclid URL param) and
 *   Google gclid — used to reconcile paid-media conversions server-side.
 *
 * No third-party trackers are called. No PII is captured here.
 */

import { classifySource } from './source-classifier'

const KEY_ORIGINAL = 'll_attribution_original'
const KEY_LATEST = 'll_attribution_latest'

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']
const CLICK_ID_KEYS = ['fbclid', 'gclid', 'msclkid']

function getCookie(name) {
  if (typeof document === 'undefined') return null
  const m = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  return m ? decodeURIComponent(m[2]) : null
}

function detectDevice() {
  if (typeof navigator === 'undefined') return 'unknown'
  const ua = navigator.userAgent || ''
  if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet'
  if (/mobi|android|iphone|ipod|opera mini|iemobile|blackberry|windows phone/i.test(ua)) return 'mobile'
  return 'desktop'
}

function detectBrowser() {
  if (typeof navigator === 'undefined') return null
  const ua = navigator.userAgent || ''
  if (/edg\//i.test(ua)) return 'Edge'
  if (/chrome|crios/i.test(ua)) return 'Chrome'
  if (/firefox|fxios/i.test(ua)) return 'Firefox'
  if (/safari/i.test(ua)) return 'Safari'
  if (/opera|opr\//i.test(ua)) return 'Opera'
  return 'Other'
}

function detectPlatform() {
  if (typeof navigator === 'undefined') return null
  const ua = navigator.userAgent || ''
  if (/windows/i.test(ua)) return 'Windows'
  if (/macintosh|mac os x/i.test(ua)) return 'macOS'
  if (/android/i.test(ua)) return 'Android'
  if (/iphone|ipad|ipod/i.test(ua)) return 'iOS'
  if (/linux/i.test(ua)) return 'Linux'
  return null
}

function readUrlParams() {
  if (typeof window === 'undefined') return {}
  const params = new URLSearchParams(window.location.search)
  const out = {}
  UTM_KEYS.forEach(k => { const v = params.get(k); if (v) out[k] = v.slice(0, 200) })
  CLICK_ID_KEYS.forEach(k => { const v = params.get(k); if (v) out[k] = v.slice(0, 300) })
  return out
}

function snapshot() {
  if (typeof window === 'undefined') return null
  const url = new URL(window.location.href)
  const urlParams = readUrlParams()
  const referrer = (document && document.referrer) || ''

  const data = {
    ...urlParams,
    // Meta browser identifiers from cookies (set by Meta Pixel if present)
    _fbp: getCookie('_fbp'),
    _fbc: getCookie('_fbc'),
    referrer: referrer.slice(0, 500),
    landing_page: `${url.origin}${url.pathname}${url.search}`.slice(0, 500),
    device_type: detectDevice(),
    browser: detectBrowser(),
    platform: detectPlatform(),
    captured_at: new Date().toISOString(),
  }
  data.source_type = classifySource(data)
  return data
}

/**
 * Runs on every page-mount. Captures original attribution on first visit and
 * refreshes latest attribution on every visit.
 */
export function captureAttributionOnLoad() {
  if (typeof window === 'undefined') return
  try {
    const current = snapshot()
    if (!current) return

    // Original — set once and never overwrite
    const existing = localStorage.getItem(KEY_ORIGINAL)
    if (!existing) {
      localStorage.setItem(KEY_ORIGINAL, JSON.stringify(current))
    }

    // Latest — always refresh
    localStorage.setItem(KEY_LATEST, JSON.stringify(current))
  } catch (e) {
    // localStorage may be disabled — silently fail
    console.warn('[attribution] capture failed', e?.message)
  }
}

/**
 * Returns { first, latest } — used by form submission code to attach
 * attribution payload to POST bodies.
 */
export function getAttribution() {
  if (typeof window === 'undefined') return { first: null, latest: null }
  try {
    const first = JSON.parse(localStorage.getItem(KEY_ORIGINAL) || 'null')
    const latest = JSON.parse(localStorage.getItem(KEY_LATEST) || 'null')
    return { first, latest }
  } catch {
    return { first: null, latest: null }
  }
}

/** For testing / debug — expose on window in dev. */
export function clearAttribution() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(KEY_ORIGINAL)
  localStorage.removeItem(KEY_LATEST)
}
