import Link from 'next/link'

interface UpgradeBannerProps {
  feature: string
}

export function UpgradeBanner({ feature }: UpgradeBannerProps) {
  return (
    <div className="mb-6">
      <div className="border rounded p-4">
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 shrink-0 flex items-center justify-center">
            <span aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-sm font-medium">
              {feature} is available on the Intelligence plan.
            </span>
            <p className="text-xs mt-1">
              Upgrade to unlock AI-powered regulatory Q&amp;A, curated summaries, and more.
            </p>
          </div>
          <Link href="/settings#billing" className="shrink-0 px-3 py-1 text-sm border rounded">
            Upgrade to Intelligence
          </Link>
        </div>
      </div>

      <div className="relative mt-4 overflow-hidden pointer-events-none select-none">
        <div className="opacity-30 blur-sm space-y-3">
          {[80, 60, 70, 50, 65].map((w, i) => (
            <div key={i} className="h-10 border" style={{ width: `${w}%` }} />
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/70 to-white" />
      </div>
    </div>
  )
}
