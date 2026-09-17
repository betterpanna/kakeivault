import type { JSX, ReactNode } from 'react'

/**
 * Centered card layout shared by /login and /register.
 * This is a Server Component — no client state needed here.
 */
export default function AuthLayout({ children }: { children: ReactNode }): JSX.Element {
  return <>{children}</>
}
