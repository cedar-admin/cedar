import { Alert, AlertDescription } from '@/components/ui/alert'

export function LegalDisclaimer() {
  return (
    <Alert className="mt-8 border-border bg-muted/40">
      <i className="ri-scales-3-line text-base" />
      <AlertDescription className="text-muted-foreground">
        <strong className="font-semibold text-foreground">Not legal advice.</strong> This content is
        for informational purposes only and may not reflect the full scope or legal effect of any
        regulatory change. For decisions specific to your practice, consult your legal counsel.
      </AlertDescription>
    </Alert>
  )
}
