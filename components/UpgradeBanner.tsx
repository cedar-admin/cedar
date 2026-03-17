import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface UpgradeBannerProps {
  feature: string
}

export function UpgradeBanner({ feature }: UpgradeBannerProps) {
  return (
    <div className="mb-6">
      {/* Banner */}
      <div className="flex items-center gap-4 p-4 border border-border bg-card">
        <div className="flex items-center justify-center w-9 h-9 bg-primary/10 shrink-0">
          <i className="ri-lock-2-line text-primary text-lg" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">
            {feature} is available on the Intelligence plan.
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Upgrade to unlock AI-powered regulatory Q&A, curated summaries, and more.
          </p>
        </div>
        <Button size="sm" asChild className="shrink-0">
          <Link href="/settings#billing">
            Upgrade to Intelligence
            <i className="ri-arrow-right-line" />
          </Link>
        </Button>
      </div>

      {/* Blurred preview hint */}
      <div className="relative mt-4 overflow-hidden pointer-events-none select-none">
        <div className="opacity-30 blur-sm space-y-3">
          {[80, 60, 70, 50, 65].map((w, i) => (
            <div key={i} className="h-10 bg-muted border border-border" style={{ width: `${w}%` }} />
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/70 to-background" />
      </div>
    </div>
  )
}
