import { Callout } from '@radix-ui/themes'

export function LegalDisclaimer() {
  return (
    <Callout.Root mt="6" color="gray" variant="soft">
      <Callout.Icon>
        <i className="ri-scales-3-line" />
      </Callout.Icon>
      <Callout.Text>
        <strong>Not legal advice.</strong> This content is for informational purposes only and may
        not reflect the full scope or legal effect of any regulatory change. For decisions specific
        to your practice, consult your legal counsel.
      </Callout.Text>
    </Callout.Root>
  )
}
