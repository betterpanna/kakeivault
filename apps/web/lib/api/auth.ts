/**
 * Auth API functions.
 *
 * The FastAPI backend returns snake_case JSON.  We define local interfaces
 * that match the wire format exactly so TypeScript stays honest.
 * These are intentionally separate from the camelCase Zod schemas in
 * @kakeivault/contracts, which describe the intended long-term contract.
 *
 * NOTE: Zod request schemas from contracts ARE used for client-side form
 * validation because the field names (email, password, locale) are the
 * same in both naming conventions.
 */

import { apiClient } from './client'

// ---------------------------------------------------------------------------
// Wire-format types (snake_case — matches actual FastAPI JSON output)
// ---------------------------------------------------------------------------

export interface ApiUser {
  id: string
  email: string
  email_verified: boolean
  locale: string
}

export interface ApiLoginResponse {
  access_token: string
  token_type: 'bearer'
  expires_in: number
  user: ApiUser
}

export interface ApiRegisterResponse {
  user_id: string
  email: string
  email_verification_required: boolean
}

export interface ApiMessageResponse {
  message: string
}

// ---------------------------------------------------------------------------
// Auth API
// ---------------------------------------------------------------------------

export const authApi = {
  register: (data: { email: string; password: string; locale?: string }) =>
    apiClient.post<ApiRegisterResponse>('/api/v1/auth/register', data),

  login: (data: { email: string; password: string }) =>
    apiClient.post<ApiLoginResponse>('/api/v1/auth/login', data),

  logout: () => apiClient.post<ApiMessageResponse>('/api/v1/auth/logout'),

  me: () => apiClient.get<ApiUser>('/api/v1/auth/me'),

  forgotPassword: (email: string) =>
    apiClient.post<ApiMessageResponse>('/api/v1/auth/forgot-password', { email }),

  resetPassword: (token: string, newPassword: string) =>
    apiClient.post<ApiMessageResponse>('/api/v1/auth/reset-password', {
      token,
      new_password: newPassword,
    }),

  verifyEmail: (token: string) =>
    apiClient.post<ApiMessageResponse>('/api/v1/auth/verify-email', { token }),
}
