'use client'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { fireMetaEvent } from '@/lib/meta-events'

/**
 * Fires Meta Pixel `ViewContent` when the user lands on key
 * loan-product pages: /eligibility, /cibil-score, /credit-cards, /calculators.
 * Runs after route change so it works with App Router client-side navigation.
 */
const CONTENT_PAGES = {
  '/eligibility': { content_name: 'Eligibility Form', content_category: 'loan_eligibility' },
  '/cibil-score': { content_name: 'CIBIL Score', content_category: 'credit_score' },
  '/credit-cards': { content_name: 'Credit Cards', content_category: 'credit_card' },
  '/calculators': { content_name: 'EMI Calculator', content_category: 'calculator' },
}

export default function ViewContentTracker() {
  const pathname = usePathname()
  useEffect(() => {
    if (!pathname) return
    const meta = CONTENT_PAGES[pathname]
    if (meta) {
      // Small delay so Pixel base code has time to load
      setTimeout(() => fireMetaEvent('ViewContent', meta), 400)
    }
  }, [pathname])
  return null
}
