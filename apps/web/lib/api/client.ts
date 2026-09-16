/**
 * API client for the web app.
 *
 * Security:
 * - Uses HttpOnly cookies for auth (set by server on login)
 * - Never puts access tokens in localStorage
 * - Automatically refreshes tokens on 401
 * - Includes CSRF protection via custom header
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function request<T>(
  path: string,
  options: RequestInit & { skipAuth?: boolean } = {},
): Promise<T> {
  const { skipAuth: _skipAuth, ...fetchOptions } = options

  const response = await fetch(`${API_BASE}${path}`, {
    ...fetchOptions,
    credentials: 'include', // send HttpOnly cookies
    headers: {
      'Content-Type': 'application/json',
      // Custom header helps prevent CSRF from cross-origin pages
      'X-Requested-With': 'XMLHttpRequest',
      ...fetchOptions.headers,
    },
  })

  if (response.status === 401) {
    // Attempt token refresh
    const refreshed = await tryRefresh()
    if (refreshed) {
      // Retry original request once
      return request<T>(path, options)
    }
    // Redirect to login
    window.location.href = '/login'
    throw new ApiError(401, 'UNAUTHORIZED', 'Session expired')
  }

  if (!response.ok) {
    let errorBody: { detail?: string; code?: string } = {}
    try {
      errorBody = await response.json()
    } catch {}
    throw new ApiError(
      response.status,
      errorBody.code ?? 'API_ERROR',
      errorBody.detail ?? `HTTP ${response.status}`,
    )
  }

  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

let _refreshing: Promise<boolean> | null = null

async function tryRefresh(): Promise<boolean> {
  if (_refreshing) return _refreshing
  _refreshing = (async () => {
    try {
      const response = await fetch(`${API_BASE}/api/v1/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      })
      return response.ok
    } catch {
      return false
    } finally {
      _refreshing = null
    }
  })()
  return _refreshing
}

export const apiClient = {
  get: <T>(path: string, options?: RequestInit) => request<T>(path, { method: 'GET', ...options }),

  post: <T>(path: string, body?: unknown, options?: RequestInit) =>
    request<T>(path, {
      method: 'POST',
      // Conditionally spread body to satisfy exactOptionalPropertyTypes:
      // RequestInit.body is BodyInit | null — never undefined.
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      ...options,
    }),

  patch: <T>(path: string, body?: unknown, options?: RequestInit) =>
    request<T>(path, {
      method: 'PATCH',
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      ...options,
    }),

  put: <T>(path: string, body?: unknown, options?: RequestInit) =>
    request<T>(path, {
      method: 'PUT',
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      ...options,
    }),

  delete: <T>(path: string, options?: RequestInit) =>
    request<T>(path, { method: 'DELETE', ...options }),
}

export { ApiError }
