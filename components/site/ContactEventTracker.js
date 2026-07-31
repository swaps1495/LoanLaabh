'use client'
import { useEffect } from 'react'
import { fireMetaEvent } from '@/lib/meta-events'

/**
 * Global click listener that fires Meta Pixel `Contact` event whenever a user
 * clicks a tel: link (helpline). Zero markup change needed on existing anchors.
 */
export default function ContactEventTracker() {
  useEffect(() => {
    const handler = (e) => {
      const target = e.target && e.target.closest ? e.target.closest('a[href^="tel:"]') : null
      if (!target) return
      const num = String(target.getAttribute('href') || '').replace(/[^0-9]/g, '')
      fireMetaEvent('Contact', {
        content_name: 'helpline_click',
        content_category: 'phone_call',
        contact_number: num,
      })
    }
    document.addEventListener('click', handler, true)
    return () => document.removeEventListener('click', handler, true)
  }, [])
  return null
}
