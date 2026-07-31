/**
 * Client-side helpers for firing Meta Pixel events with deduplication.
 *
 * `fireMetaEvent(name, data, eventId)` fires a browser Pixel event with
 * the same `eventID` that the server sends via CAPI — Meta dedupes them.
 *
 * `newEventId()` returns a fresh UUID to share between browser & server.
 */

export function newEventId() {
  if (typeof window !== 'undefined' && window.crypto?.randomUUID) {
    return window.crypto.randomUUID()
  }
  // Fallback UUID v4 for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}

/**
 * Fire a Meta Pixel event on the browser. Safe to call before pixel loads —
 * events are queued by fbq itself. `eventID` MUST match the CAPI event_id
 * for dedupe to work.
 */
export function fireMetaEvent(name, data = {}, eventId) {
  if (typeof window === 'undefined') return
  try {
    if (!window.fbq) return
    if (eventId) {
      window.fbq('track', name, data, { eventID: eventId })
    } else {
      window.fbq('track', name, data)
    }
  } catch (e) {
    /* silent — marketing never blocks UX */
  }
}
