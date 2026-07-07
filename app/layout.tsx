import { IBM_Plex_Mono, IBM_Plex_Sans, Playfair_Display } from 'next/font/google'
import './globals.css'
import Providers from '@/components/Providers'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-mono',
})

const sans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-sans',
})

const serif = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '600'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <Analytics />
      <SpeedInsights />
      <body className={`${mono.variable} ${sans.variable} ${serif.variable} bg-ink text-amber-50`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}