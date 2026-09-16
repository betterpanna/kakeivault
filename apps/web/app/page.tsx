import { redirect } from 'next/navigation'

// Root page redirects to dashboard; middleware handles unauthenticated users
export default function Home(): never {
  redirect('/dashboard')
}
