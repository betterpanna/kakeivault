import type { JSX, ReactNode } from 'react'
import { AppHeader } from '@/components/app/app-header'

/**
 * Shell layout for all authenticated pages (/dashboard, /transactions, …).
 * The middleware already ensures only authenticated users reach these routes.
 * This layout renders the persistent header + main content area.
 */
export default function AppLayout({ children }: { children: ReactNode }): JSX.Element {
  return (
    <>
      <AppHeader />
      <div className="page-content">{children}</div>
    </>
  )
}
