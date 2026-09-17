'use client'

import type { JSX } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth/context'
import { useI18n } from '@/lib/hooks/use-i18n'

export function AppHeader(): JSX.Element {
  const { t } = useI18n()
  const { user, logout } = useAuth()

  return (
    <header className="app-header">
      <Link href="/dashboard" className="app-header-title">
        KakeiVault
      </Link>

      <div className="app-header-user">
        {user && (
          <span aria-label={`Logged in as ${user.email}`} title={user.email}>
            {user.email}
          </span>
        )}
        <button
          type="button"
          className="btn btn-ghost"
          style={{ padding: '0.375rem 0.875rem', fontSize: 'var(--text-sm)', minHeight: '36px' }}
          onClick={() => { void logout() }}
        >
          {t('auth.logout')}
        </button>
      </div>
    </header>
  )
}
