'use client'

import { Button } from '@/components/ui/button'
import { handleSignOut } from '@/app/actions/auth'

export function SignOutButton() {
  return (
    <form action={handleSignOut}>
      <Button
        variant="ghost"
        size="sm"
        type="submit"
        className="w-full justify-start text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent/50 px-3"
      >
        <i className="ri-logout-box-line text-base" />
        Sign out
      </Button>
    </form>
  )
}
