'use client'

import { useState, type FormEvent, type JSX } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authApi } from '@/lib/api/auth'
import { ApiError } from '@/lib/api/client'
import { useAuth } from '@/lib/auth/context'
import { useI18n } from '@/lib/hooks/use-i18n'

export function LoginForm(): JSX.Element {
  const { t } = useI18n()
  const router = useRouter()
  const { setUser } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault()
    setFormError(null)

    if (!email || !password) return

    setLoading(true)
    try {
      const res = await authApi.login({ email: email.trim().toLowerCase(), password })
      // Prime the auth cache so the dashboard renders without an extra /me round-trip
      setUser(res.user)

      // Redirect to the page the user originally tried to visit, or dashboard
      const searchParams = new URLSearchParams(window.location.search)
      const from = searchParams.get('from')
      const destination = from && from.startsWith('/') ? from : '/dashboard'
      router.push(destination)
      router.refresh()
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setFormError(t('auth.invalidCredentials'))
        } else if (err.status === 429) {
          setFormError(t('auth.rateLimited'))
        } else {
          setFormError(t('common.error'))
        }
      } else {
        setFormError(t('error.network'))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={(e) => { void handleSubmit(e) }} noValidate aria-label={t('auth.login')}>
      {formError && (
        <div role="alert" className="alert alert-error">
          {formError}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="login-email" className="form-label">
          {t('auth.email')}
        </label>
        <input
          id="login-email"
          type="email"
          className="form-input"
          value={email}
          onChange={(e) => { setEmail(e.target.value) }}
          autoComplete="email"
          autoCapitalize="none"
          autoCorrect="off"
          required
          aria-required="true"
          disabled={loading}
          aria-invalid={formError ? 'true' : undefined}
        />
      </div>

      <div className="form-group">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <label htmlFor="login-password" className="form-label">
            {t('auth.password')}
          </label>
          <Link
            href="/forgot-password"
            style={{ fontSize: 'var(--text-sm)', color: 'var(--color-brand)' }}
            tabIndex={loading ? -1 : undefined}
          >
            {t('auth.forgotPassword')}
          </Link>
        </div>
        <input
          id="login-password"
          type="password"
          className="form-input"
          value={password}
          onChange={(e) => { setPassword(e.target.value) }}
          autoComplete="current-password"
          required
          aria-required="true"
          disabled={loading}
          aria-invalid={formError ? 'true' : undefined}
        />
      </div>

      <button type="submit" className="btn btn-primary" disabled={loading || !email || !password}>
        {loading ? t('auth.loggingIn') : t('auth.login')}
      </button>

      <p className="auth-footer">
        {t('auth.noAccount')}{' '}
        <Link href="/register" className="btn-link">
          {t('auth.register')}
        </Link>
      </p>
    </form>
  )
}
