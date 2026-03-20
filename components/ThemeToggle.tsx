'use client'

import { IconButton } from '@radix-ui/themes'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return <IconButton variant="ghost" size="1" aria-label="Toggle theme"><i className="ri-moon-line" /></IconButton>
  return (
    <IconButton
      variant="ghost"
      size="1"
      aria-label="Toggle theme"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      <i className={theme === 'dark' ? 'ri-sun-line' : 'ri-moon-line'} />
    </IconButton>
  )
}
