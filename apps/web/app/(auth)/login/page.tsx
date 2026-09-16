import type { Metadata } from 'next'
import type { JSX } from 'react'

export const metadata: Metadata = { title: 'ログイン / Login' }

export default function LoginPage(): JSX.Element {
  return (
    <main className="auth-page">
      {/* LoginForm is a Phase 1 client component */}
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>KakeiVault</h1>
        <p>Phase 1: Login form coming next</p>
      </div>
    </main>
  )
}
