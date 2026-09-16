import type { Metadata, Viewport } from 'next'
import type { JSX, ReactNode } from 'react'
import './globals.css'
import { Providers } from '@/components/providers'

export const metadata: Metadata = {
  title: {
    default: 'KakeiVault',
    template: '%s | KakeiVault',
  },
  description:
    'プライバシー重視の家計・書類管理アプリ / Privacy-first personal finance & document vault',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'KakeiVault',
  },
  formatDetection: {
    telephone: false,
  },
}

export const viewport: Viewport = {
  themeColor: '#1a1a2e',
  minimumScale: 1,
  initialScale: 1,
  width: 'device-width',
}

export default function RootLayout({ children }: { children: ReactNode }): JSX.Element {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
