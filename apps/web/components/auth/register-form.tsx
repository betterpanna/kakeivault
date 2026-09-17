'use client'

import { useState, type FormEvent, type JSX } from 'react'
import Link from 'next/link'
import { RegisterRequestSchema } from '@kakeivault/contracts'
import { authApi } from '@/lib/api/auth'
import { ApiError } from '@/lib/api/client'
import { useI18n } from '@/lib/hooks/use-i18n'

interface FieldErrors {
  email?: string | undefined
  password?: string | undefined
  confirmPassword?: string | undefined
}

export function RegisterForm(): JSX.Element {
  const { t } = useI18n()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  function validate(): FieldErrors {
    const errors: FieldErrors = {}

    const parsed = RegisterRequestSchema.safeParse({ email, password })
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as string | undefined
        const msg = issue.message
        if (field === 'email' && !errors.email) {
          errors.email = msg
        }
        if (field === 'password' && !errors.password) {
          // Map Zod messages to i18n keys
          if (msg.includes('8')) errors.password = t('auth.passwordMinLength')
          else if (msg.includes('uppercase') || msg.includes('Must contain an uppercase')) errors.password = t('auth.passwordRequiresUppercase')
          else if (msg.includes('digit') || msg.includes('Must contain a digit')) errors.password = t('auth.passwordRequiresDigit')
          else errors.password = msg
        }
      }
    }

    if (password && confirmPassword && password !== confirmPassword) {
      errors.confirmPassword = t('auth.passwordsDoNotMatch')
    }

    return errors
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault()
    setFormError(null)

    const errors = validate()
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    setLoading(true)
    try {
      await authApi.register({ email: email.trim().toLowerCase(), password })
      setSuccess(true)
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409) {
          setFieldErrors({ email: t('auth.duplicateEmail') })
        } else if (err.status === 429) {
          setFormError(t('auth.rateLimited'))
        } else if (err.status === 422) {
          setFormError(t('common.error'))
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

  if (success) {
    return (
      <div>
        <div role="status" className="alert alert-success">
          {t('auth.registerSuccess')}
        </div>
        <p className="auth-footer">
          <Link href="/login" className="btn-link">
            {t('auth.login')}
          </Link>
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={(e) => { void handleSubmit(e) }} noValidate aria-label={t('auth.createAccountTitle')}>
      {formError && (
        <div role="alert" className="alert alert-error">
          {formError}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="reg-email" className="form-label">
          {t('auth.email')}
        </label>
        <input
          id="reg-email"
          type="email"
          className="form-input"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setFieldErrors((prev) => ({ ...prev, email: undefined })) }}
          autoComplete="email"
          autoCapitalize="none"
          autoCorrect="off"
          required
          aria-required="true"
          aria-describedby={fieldErrors.email ? 'reg-email-error' : undefined}
          aria-invalid={fieldErrors.email ? 'true' : undefined}
          disabled={loading}
        />
        {fieldErrors.email && (
          <span id="reg-email-error" className="form-error" role="alert">
            {fieldErrors.email}
          </span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="reg-password" className="form-label">
          {t('auth.password')}
        </label>
        <input
          id="reg-password"
          type="password"
          className="form-input"
          value={password}
          onChange={(e) => { setPassword(e.target.value); setFieldErrors((prev) => ({ ...prev, password: undefined })) }}
          autoComplete="new-password"
          required
          aria-required="true"
          aria-describedby={fieldErrors.password ? 'reg-password-error' : undefined}
          aria-invalid={fieldErrors.password ? 'true' : undefined}
          disabled={loading}
        />
        {fieldErrors.password && (
          <span id="reg-password-error" className="form-error" role="alert">
            {fieldErrors.password}
          </span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="reg-confirm-password" className="form-label">
          {t('auth.confirmPassword')}
        </label>
        <input
          id="reg-confirm-password"
          type="password"
          className="form-input"
          value={confirmPassword}
          onChange={(e) => { setConfirmPassword(e.target.value); setFieldErrors((prev) => ({ ...prev, confirmPassword: undefined })) }}
          autoComplete="new-password"
          required
          aria-required="true"
          aria-describedby={fieldErrors.confirmPassword ? 'reg-confirm-error' : undefined}
          aria-invalid={fieldErrors.confirmPassword ? 'true' : undefined}
          disabled={loading}
        />
        {fieldErrors.confirmPassword && (
          <span id="reg-confirm-error" className="form-error" role="alert">
            {fieldErrors.confirmPassword}
          </span>
        )}
      </div>

      <button
        type="submit"
        className="btn btn-primary"
        disabled={loading || !email || !password || !confirmPassword}
      >
        {loading ? t('auth.registering') : t('auth.register')}
      </button>

      <p className="auth-footer">
        {t('auth.alreadyHaveAccount')}{' '}
        <Link href="/login" className="btn-link">
          {t('auth.login')}
        </Link>
      </p>
    </form>
  )
}
