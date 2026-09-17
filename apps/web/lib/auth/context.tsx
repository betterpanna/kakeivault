'use client'

/**
 * Auth context and hook.
 *
 * Fetches current user from /api/v1/auth/me via TanStack Query.
 * The HTTP-only access_token cookie is sent automatically by the browser.
 * A 401 response means the user is not logged in (expected on auth pages).
 */

import { createContext, useContext, type ReactNode, type JSX } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { authApi, type ApiUser } from '@/lib/api/auth'
import { ApiError } from '@/lib/api/client'

interface AuthContextValue {
  /** Undefined = loading, null = not authenticated, User = authenticated */
  user: ApiUser | null | undefined
  isLoading: boolean
  /** Call after a successful login to prime the user cache */
  setUser: (user: ApiUser) => void
  /** Call to clear user state and redirect to /login */
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }): JSX.Element {
  const queryClient = useQueryClient()
  const router = useRouter()

  const { data: user, isLoading } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      try {
        return await authApi.me()
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          return null
        }
        throw err
      }
    },
    // Re-check session when window regains focus
    refetchOnWindowFocus: true,
    // Don't retry 401 errors
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status === 401) return false
      return failureCount < 2
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  function setUser(newUser: ApiUser): void {
    queryClient.setQueryData(['auth', 'me'], newUser)
  }

  async function logout(): Promise<void> {
    try {
      await authApi.logout()
    } catch {
      // If logout fails server-side, clear local state anyway
    } finally {
      queryClient.setQueryData(['auth', 'me'], null)
      queryClient.clear()
      router.push('/login')
      router.refresh()
    }
  }

  return (
    <AuthContext.Provider value={{ user: isLoading ? undefined : (user ?? null), isLoading, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
