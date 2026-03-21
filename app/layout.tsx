import type { Metadata } from "next";

import "./globals.css";
import { IBM_Plex_Mono, IBM_Plex_Sans, Playfair_Display } from 'next/font/google'
import './globals.css'

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
      <body className={`${mono.variable} ${sans.variable} ${serif.variable} bg-ink text-amber-50`}>
        {children}
      </body>
    </html>
  )
}
