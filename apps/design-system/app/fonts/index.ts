import { Inter, Source_Code_Pro } from 'next/font/google'

export const customFont = Inter({
  subsets: ['latin'],
  variable: '--font-custom',
  display: 'swap',
})

export const sourceCodePro = Source_Code_Pro({
  subsets: ['latin'],
  variable: '--font-source-code-pro',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})
