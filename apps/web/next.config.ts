import type { NextConfig } from 'next'

// API_URL is the FastAPI backend base URL.
// In production this must be set as an environment variable in Vercel.
// NEXT_PUBLIC_API_URL is used so the CSP header can allow the origin.
// IMPORTANT: the actual API calls go through the Next.js rewrite proxy below,
// so cookies remain same-origin and CORS is never a problem in production.
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

// Normalise: strip trailing slash so the CSP value stays clean
const apiOrigin = API_URL.replace(/\/$/, '')

const nextConfig: NextConfig = {
  reactStrictMode: true,

  /**
   * Rewrite /api/* → FastAPI backend.
   *
   * Security rationale
   * ------------------
   * HttpOnly cookies (access_token, refresh_token) must be same-origin to be
   * sent automatically by the browser.  Without a proxy the frontend on
   * https://kakeivault.vercel.app would be calling the API on a different
   * domain, which means:
   *   - SameSite=Lax cookies are NOT sent on cross-site requests
   *   - CORS credentials require SameSite=None + explicit allow-origin, which
   *     weakens the CSRF posture
   *
   * The rewrite rule makes the API same-origin from the browser's perspective
   * while the actual origin is kept private (not exposed to the client bundle).
   */
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${apiOrigin}/api/:path*`,
      },
    ]
  },

  // Security headers — applied to all routes
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
              // API calls go through /api/* rewrite — same origin in production.
              // The raw backend origin is still included for the CSP so the
              // server-side rewrite can forward requests correctly.
              `connect-src 'self' ${apiOrigin}`,
            ].join('; '),
          },
        ],
      },
    ]
  },

  // Transpile workspace packages so Next.js can bundle them correctly
  transpilePackages: [
    '@kakeivault/config',
    '@kakeivault/contracts',
    '@kakeivault/domain',
    '@kakeivault/i18n',
    '@kakeivault/validation',
  ],

  // Never expose secrets to the client via NEXT_PUBLIC_ variables.
}

export default nextConfig
