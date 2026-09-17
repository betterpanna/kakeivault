'use client'

import type { JSX } from 'react'
import { useAuth } from '@/lib/auth/context'
import { useI18n } from '@/lib/hooks/use-i18n'

export default function DashboardPage(): JSX.Element {
  const { t } = useI18n()
  const { user, isLoading } = useAuth()

  return (
    <main>
      <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--space-6)' }}>
        {t('dashboard.title')}
      </h2>

      {isLoading && (
        <div className="card">
          <div className="skeleton" style={{ height: '1.5rem', width: '60%', borderRadius: 'var(--radius-sm)' }} />
        </div>
      )}

      {!isLoading && user && (
        <div className="card">
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-2)' }}>
            {t('auth.welcomeBack')}
          </p>
          <p style={{ fontWeight: 600 }}>{user.email}</p>
          {!user.email_verified && (
            <p style={{ marginTop: 'var(--space-3)', fontSize: 'var(--text-sm)', color: 'var(--color-warning)' }}>
              {t('auth.emailVerificationSent')}
            </p>
          )}
        </div>
      )}

      {/* Phase 2+ content: transactions, budgets, charts */}
      <div className="card" style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
        {t('dashboard.noTransactions')}
      </div>
    </main>
  )
}
