/**
 * Mobile API client.
 *
 * Uses Bearer tokens from SecureStore (never localStorage).
 * Automatically refreshes on 401.
 */

import { tokenStore } from '@/lib/auth/token-store'

const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000'

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

let _refreshing: Promise<boolean> | null = null

async function tryRefresh(): Promise<boolean> {
  if (_refreshing) return _refreshing
  _refreshing = (async () => {
    try {
      const refreshToken = await tokenStore.getRefreshToken()
      if (!refreshToken) return false

      const response = await fetch(`${API_BASE}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${refreshToken}` },
      })
      if (!response.ok) return false

      const data = await response.json()
      await tokenStore.setAccessToken(data.access_token)
      return true
    } catch {
      return false
    } finally {
      _refreshing = null
    }
  })()
  return _refreshing
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const accessToken = await tokenStore.getAccessToken()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`
  }

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers })

  if (response.status === 401) {
    const refreshed = await tryRefresh()
    if (refreshed) {
      return request<T>(path, options)
    }
    throw new ApiError(401, 'UNAUTHORIZED', 'Session expired')
  }

  if (!response.ok) {
    let body: { detail?: string; code?: string } = {}
    try {
      body = await response.json()
    } catch {}
    throw new ApiError(
      response.status,
      body.code ?? 'API_ERROR',
      body.detail ?? `HTTP ${response.status}`,
    )
  }

  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

export const apiClient = {
  get: <T>(path: string, opts?: RequestInit) => request<T>(path, { method: 'GET', ...opts }),
  post: <T>(path: string, body?: unknown, opts?: RequestInit) =>
    request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined, ...opts }),
  patch: <T>(path: string, body?: unknown, opts?: RequestInit) =>
    request<T>(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined, ...opts }),
  put: <T>(path: string, body?: unknown, opts?: RequestInit) =>
    request<T>(path, { method: 'PUT', body: body ? JSON.stringify(body) : undefined, ...opts }),
  delete: <T>(path: string, opts?: RequestInit) => request<T>(path, { method: 'DELETE', ...opts }),
}

export { ApiError }
