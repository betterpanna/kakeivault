'use client'

/**
 * Root client providers.
 * Kept in a separate 'use client' component so the layout can remain a Server Component.
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import type { JSX, ReactNode } from 'react'
import { useState } from 'react'
import { I18nProvider } from '@/lib/hooks/use-i18n'
import { AuthProvider } from '@/lib/auth/context'

export function Providers({ children }: { children: ReactNode }): JSX.Element {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <AuthProvider>
          {children}
          {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
        </AuthProvider>
      </I18nProvider>
    </QueryClientProvider>
  )
}
