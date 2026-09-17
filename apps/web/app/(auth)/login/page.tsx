import type { Metadata } from 'next'
import type { JSX } from 'react'
import { LoginForm } from '@/components/auth/login-form'

export const metadata: Metadata = { title: 'ログイン / Login' }

export default function LoginPage(): JSX.Element {
  return (
    <main className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <h1>KakeiVault</h1>
          {/* Subtitle is rendered inside the client form via i18n */}
        </div>
        <LoginForm />
      </div>
    </main>
  )
}
