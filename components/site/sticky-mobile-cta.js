'use client'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function StickyMobileCta({ label = 'Check Free Eligibility', href = '/eligibility' }) {
  return (
    <>
      {/* Spacer to prevent content hiding under sticky bar on mobile */}
      <div className="lg:hidden h-20" aria-hidden="true" />
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E3ECFA] shadow-[0_-4px_18px_rgba(7,30,65,0.08)] px-4 pt-3 pb-safe">
        <Link href={href} className="block">
          <button className="w-full h-12 bg-[#1261E8] hover:bg-[#0B4FC4] rounded-2xl text-white font-semibold text-base flex items-center justify-center gap-2 shadow-md shadow-blue-200 transition-colors">
            {label} <ArrowRight className="h-4 w-4" />
          </button>
        </Link>
      </div>
    </>
  )
}
