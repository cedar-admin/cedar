'use client'

import { Button } from '@radix-ui/themes'
import { handleSignOut } from '@/app/actions/auth'

export function SignOutButton() {
  return (
    <form action={handleSignOut}>
      <Button
        variant="ghost"
        size="1"
        type="submit"
        className="text-[var(--gray-11)] hover:text-[var(--gray-12)]"
      >
        <i className="ri-logout-box-line" />
        Sign out
      </Button>
    </form>
  )
}
