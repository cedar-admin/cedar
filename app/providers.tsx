'use client'

import { ThemeProvider } from 'next-themes'
import { Theme } from '@radix-ui/themes'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <Theme
        accentColor="green"
        grayColor="gray"
        radius="large"
        scaling="100%"
        panelBackground="translucent"
      >
        {children}
      </Theme>
    </ThemeProvider>
  )
}
