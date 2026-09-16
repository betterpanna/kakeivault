/**
 * Auth API functions.
 * API calls must NOT be placed directly in screen components.
 * Use these functions from TanStack Query hooks.
 */

import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from '@kakeivault/contracts'
import { apiClient } from './client'

export const authApi = {
  register: (data: RegisterRequest) =>
    apiClient.post<RegisterResponse>('/api/v1/auth/register', data),

  login: (data: LoginRequest) => apiClient.post<LoginResponse>('/api/v1/auth/login', data),

  logout: () => apiClient.post<{ message: string }>('/api/v1/auth/logout'),

  me: () =>
    apiClient.get<{
      id: string
      email: string
      email_verified: boolean
      locale: string
    }>('/api/v1/auth/me'),

  forgotPassword: (email: string) =>
    apiClient.post<{ message: string }>('/api/v1/auth/forgot-password', { email }),

  resetPassword: (token: string, newPassword: string) =>
    apiClient.post<{ message: string }>('/api/v1/auth/reset-password', {
      token,
      new_password: newPassword,
    }),

  verifyEmail: (token: string) =>
    apiClient.post<{ message: string }>('/api/v1/auth/verify-email', { token }),
}
