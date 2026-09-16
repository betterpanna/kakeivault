import type { Metadata } from 'next'
import type { JSX } from 'react'

export const metadata: Metadata = { title: 'ダッシュボード / Dashboard' }

export default function DashboardPage(): JSX.Element {
  return (
    <main>
      <h1>Dashboard</h1>
      <p>Phase 1: Dashboard shell coming next</p>
    </main>
  )
}
