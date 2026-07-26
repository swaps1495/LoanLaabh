'use client'
import { useEffect } from 'react'
import { captureAttributionOnLoad } from '@/lib/attribution'

/**
 * Mount-only tracker. Runs `captureAttributionOnLoad` on every navigation
 * so latest attribution stays fresh while original is frozen on first visit.
 */
export default function AttributionTracker() {
  useEffect(() => {
    captureAttributionOnLoad()
  }, [])
  return null
}
