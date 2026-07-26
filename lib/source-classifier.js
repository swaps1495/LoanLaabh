/**
 * LoanLaabh source classification — plain JS, safe to import from
 * both client and server. Given attribution attributes, returns one of:
 *
 *   Meta Ads | Google Ads | Organic Search | Direct | Referral |
 *   WhatsApp | Chatbot | Email Campaign | SMS Campaign | RCS Campaign |
 *   Partner Referral | Other
 */

const SEARCH_ENGINE_HOSTS = [
  'google.', 'bing.com', 'duckduckgo.com', 'yahoo.', 'yandex.',
  'baidu.com', 'ecosia.org', 'brave.com', 'startpage.com',
]

const META_HOSTS = ['facebook.com', 'instagram.com', 'fb.com', 'l.facebook.com', 'l.instagram.com', 'lm.facebook.com']

function toLower(v) {
  return (v == null ? '' : String(v)).toLowerCase()
}

export function classifySource(attr) {
  if (!attr || typeof attr !== 'object') return 'Direct'

  const utm_source = toLower(attr.utm_source)
  const utm_medium = toLower(attr.utm_medium)
  const utm_campaign = toLower(attr.utm_campaign)
  const fbclid = attr.fbclid
  const gclid = attr.gclid
  const referrer = toLower(attr.referrer)

  // Meta / Facebook / Instagram Ads
  if (
    fbclid ||
    ['facebook', 'meta', 'instagram', 'ig', 'fb'].some(k => utm_source.includes(k)) ||
    META_HOSTS.some(h => referrer.includes(h)) && ['cpc', 'ppc', 'paid', 'social', 'ads'].some(m => utm_medium.includes(m))
  ) {
    return 'Meta Ads'
  }

  // Google Ads (paid) — gclid, or utm_source=google with paid medium
  if (
    gclid ||
    (utm_source.includes('google') && ['cpc', 'ppc', 'paid', 'paidsearch', 'sem'].some(m => utm_medium.includes(m))) ||
    utm_source === 'adwords' || utm_source === 'google_ads' || utm_source === 'googleads'
  ) {
    return 'Google Ads'
  }

  // Email Campaign
  if (utm_medium.includes('email') || utm_source === 'newsletter' || utm_source === 'resend' || utm_source === 'mailchimp') {
    return 'Email Campaign'
  }

  // SMS Campaign
  if (utm_medium === 'sms' || utm_source === 'sms' || utm_source === 'msg91') {
    return 'SMS Campaign'
  }

  // RCS Campaign
  if (utm_medium === 'rcs' || utm_source === 'rcs') {
    return 'RCS Campaign'
  }

  // WhatsApp
  if (
    utm_source === 'whatsapp' || utm_medium === 'whatsapp' ||
    referrer.includes('whatsapp.com') || referrer.includes('wa.me') ||
    referrer.includes('api.whatsapp')
  ) {
    return 'WhatsApp'
  }

  // Chatbot (internal LFMai or external)
  if (utm_source === 'lfmai' || utm_source === 'chatbot' || utm_medium === 'chatbot') {
    return 'Chatbot'
  }

  // Partner Referral (affiliates / DSAs)
  if (utm_medium === 'partner' || utm_medium === 'affiliate' || utm_source.includes('partner') || utm_source.includes('affiliate')) {
    return 'Partner Referral'
  }

  // Organic Search — no paid UTM, referrer is a search engine
  if (!utm_source && referrer && SEARCH_ENGINE_HOSTS.some(h => referrer.includes(h))) {
    return 'Organic Search'
  }

  // Meta social (unpaid) — referrer is FB/IG without paid UTM
  if (!utm_source && referrer && META_HOSTS.some(h => referrer.includes(h))) {
    return 'Referral'
  }

  // Referral — any other non-empty external referrer
  if (!utm_source && referrer) {
    // Ignore self-referrals
    try {
      if (typeof window !== 'undefined') {
        const selfHost = toLower(window.location.host)
        if (selfHost && referrer.includes(selfHost)) return 'Direct'
      }
    } catch (_ignore) { /* window inaccessible — ignore */ }
    return 'Referral'
  }

  // UTM present but not matched by any rule above — preserve
  if (utm_source || utm_medium || utm_campaign) {
    return 'Other'
  }

  return 'Direct'
}
