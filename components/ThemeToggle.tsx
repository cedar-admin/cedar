'use client'

import { IconButton } from '@radix-ui/themes'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) {
    return (
      <IconButton variant="ghost" color="gray" size="1" aria-label="Switch to dark mode">
        <i className="ri-moon-line" aria-hidden="true" />
      </IconButton>
    )
  }
  return (
    <IconButton
      variant="ghost"
      color="gray"
      size="1"
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      <i className={theme === 'dark' ? 'ri-sun-line' : 'ri-moon-line'} aria-hidden="true" />
    </IconButton>
  )
}
