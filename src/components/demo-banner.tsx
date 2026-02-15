'use client'

import { useState } from 'react'
import { X, Sparkles, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export function DemoBanner() {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <div className="bg-gradient-to-r from-primary via-primary to-violet-600 text-white px-4 py-2 text-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 flex-shrink-0" />
          <span className="font-medium">Demo Mode</span>
          <span className="hidden sm:inline text-white/80">
            — You&apos;re viewing PayPilot with sample data. Sign up for a free trial with your own company data.
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/signup"
            className="hidden sm:flex items-center gap-1 text-white/90 hover:text-white font-medium transition-colors"
          >
            Start Free Trial
            <ExternalLink className="w-3 h-3" />
          </Link>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 hover:bg-white/10 rounded transition-colors"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
