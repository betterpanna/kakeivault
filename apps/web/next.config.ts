import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // PWA config handled by next-pwa
  reactStrictMode: true,

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(self), microphone=(), geolocation=()',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Next.js requires unsafe-eval in dev
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob:",
              "font-src 'self'",
              "connect-src 'self' http://localhost:8000 https://api.kakeivault.app",
            ].join('; '),
          },
        ],
      },
    ]
  },

  // Transpile workspace packages
  transpilePackages: [
    '@kakeivault/config',
    '@kakeivault/contracts',
    '@kakeivault/domain',
    '@kakeivault/i18n',
    '@kakeivault/validation',
  ],

  // Never expose secrets to the client
  env: {
    // Only safe public values — no secrets
  },
  publicRuntimeConfig: {},
  serverRuntimeConfig: {},
}

export default nextConfig
