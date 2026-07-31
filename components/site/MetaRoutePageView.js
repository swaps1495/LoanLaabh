'use client'
import { useEffect, useRef, Suspense } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

/**
 * Fires Meta Pixel PageView on every client-side route change (App Router).
 * The initial PageView is fired by the base pixel code — this one skips the
 * first render to avoid a duplicate PageView event.
 */
function Inner() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isFirst = useRef(true)

  useEffect(() => {
    if (isFirst.current) { isFirst.current = false; return }
    if (typeof window !== 'undefined' && window.fbq) {
      try { window.fbq('track', 'PageView') } catch (_) { /* noop */ }
    }
  }, [pathname, searchParams])

  return null
}

export default function MetaRoutePageView() {
  return (
    <Suspense fallback={null}>
      <Inner />
    </Suspense>
  )
}
