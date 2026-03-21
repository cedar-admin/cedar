'use client'

import { Button } from '@radix-ui/themes'
import { handleSignOut } from '@/app/actions/auth'

export function SignOutButton() {
  return (
    <form action={handleSignOut}>
      <Button
        variant="ghost"
        color="gray"
        size="1"
        type="submit"
        className="hover:text-[var(--cedar-error-text)]"
      >
        <i className="ri-logout-box-line" />
        Sign out
      </Button>
    </form>
  )
}
