/**
 * Server-side normalization of attribution payload posted by the client.
 * Returns columns ready to insert/update in `lead_captures` or `leads`.
 */
import { classifySource } from './source-classifier'

function pick(obj, key, max = 200) {
  const v = obj?.[key]
  if (v == null) return null
  return String(v).slice(0, max)
}

/**
 * Convert one attribution snapshot (client-captured `first` or `latest`) into
 * the DB column shape. `prefix` is either 'original' or 'latest'.
 */
export function attrToColumns(attr, prefix = 'original') {
  if (!attr || typeof attr !== 'object') return {}
  const src = classifySource(attr)
  const p = prefix
  const cols = {
    [`${p}_source_type`]: src,
    [`${p}_utm_source`]: pick(attr, 'utm_source'),
    [`${p}_utm_medium`]: pick(attr, 'utm_medium'),
    [`${p}_utm_campaign`]: pick(attr, 'utm_campaign'),
    [`${p}_utm_content`]: pick(attr, 'utm_content'),
    [`${p}_utm_term`]: pick(attr, 'utm_term'),
    [`${p}_referrer`]: pick(attr, 'referrer', 500),
    [`${p}_landing_page`]: pick(attr, 'landing_page', 500),
  }
  if (prefix === 'original') {
    cols.original_fbclid = pick(attr, 'fbclid', 300)
    cols.original_gclid = pick(attr, 'gclid', 300)
    cols.original_fbp = pick(attr, '_fbp', 300)
    cols.original_fbc = pick(attr, '_fbc', 300)
    cols.original_device_type = pick(attr, 'device_type', 20)
    cols.original_browser = pick(attr, 'browser', 40)
    cols.original_platform = pick(attr, 'platform', 40)
    cols.first_visit_at = attr.captured_at ? new Date(attr.captured_at).toISOString() : new Date().toISOString()
  }
  return cols
}

/**
 * Build retry tags for a returning lead. Compares old row vs new attribution.
 * Returns { tags: string[], sourceChanged: boolean }
 */
export function buildRetryTags(existingRow, latestAttr, ctx = {}) {
  const tags = new Set(Array.isArray(existingRow?.tags) ? existingRow.tags : [])
  tags.add('Returning Lead')
  if (ctx.reason === 'otp_retry') tags.add('OTP Retry')
  if (ctx.reason === 'eligibility_retry') tags.add('Eligibility Retry')
  if (ctx.reason === 'lead_capture_retry') tags.add('Customer Retried')
  if (ctx.reason === 'reinitiated') tags.add('Re-initiated Eligibility')

  const oldSrc = existingRow?.original_source_type || existingRow?.latest_source_type || null
  const newSrc = latestAttr ? classifySource(latestAttr) : null
  const oldCampaign = (existingRow?.original_utm_campaign || '').toLowerCase()
  const newCampaign = (latestAttr?.utm_campaign || '').toLowerCase()

  const sourceChanged =
    !!(newSrc && oldSrc && newSrc !== oldSrc) ||
    !!(newCampaign && oldCampaign && newCampaign !== oldCampaign)

  if (sourceChanged) tags.add('Re-engaged from New Campaign')

  return { tags: Array.from(tags), sourceChanged }
}
