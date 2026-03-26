'use client'

import { handleSignOut } from '@/app/actions/auth'

export function SignOutButton() {
  return (
    <form action={handleSignOut}>
      <button
        type="submit"
        className="text-sm"
      >
        Sign out
      </button>
    </form>
  )
}
