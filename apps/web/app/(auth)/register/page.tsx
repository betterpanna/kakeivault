import type { Metadata } from 'next'
import type { JSX } from 'react'
import { RegisterForm } from '@/components/auth/register-form'

export const metadata: Metadata = { title: 'アカウント作成 / Register' }

export default function RegisterPage(): JSX.Element {
  return (
    <main className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <h1>KakeiVault</h1>
        </div>
        <RegisterForm />
      </div>
    </main>
  )
}
