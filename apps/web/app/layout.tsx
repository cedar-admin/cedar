import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Providers } from './providers'
// Supabase design system CSS (pre-built theme files — pure CSS vars, no Tailwind directives)
import 'ui/build/css/source/global.css'
import 'ui/build/css/themes/dark.css'
import 'ui/build/css/themes/classic-dark.css'
import 'ui/build/css/themes/light.css'
import './globals.css'

const geistSans = Geist({
  variable: '--font-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Cedar — Florida Regulatory Intelligence',
  description: 'Monitor 71 Florida healthcare regulatory sources. Get alerted when rules change.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="antialiased">
        <Providers>
          <main id="main-content">{children}</main>
        </Providers>
      </body>
    </html>
  )
}
