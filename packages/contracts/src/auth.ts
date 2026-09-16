import { z } from 'zod'
import { SUPPORTED_LOCALES } from '@kakeivault/config'

// ---------------------------------------------------------------------------
// Register
// ---------------------------------------------------------------------------
export const RegisterRequestSchema = z.object({
  email: z.string().email().max(254).toLowerCase(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128)
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[0-9]/, 'Must contain a digit'),
  locale: z.enum(SUPPORTED_LOCALES).default('ja-JP'),
})
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>

export const RegisterResponseSchema = z.object({
  userId: z.string().uuid(),
  email: z.string().email(),
  emailVerificationRequired: z.boolean(),
})
export type RegisterResponse = z.infer<typeof RegisterResponseSchema>

// ---------------------------------------------------------------------------
// Login
// ---------------------------------------------------------------------------
export const LoginRequestSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(1),
})
export type LoginRequest = z.infer<typeof LoginRequestSchema>

export const LoginResponseSchema = z.object({
  accessToken: z.string(),
  tokenType: z.literal('bearer'),
  expiresIn: z.number().int(), // seconds
  user: z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    emailVerified: z.boolean(),
    locale: z.enum(SUPPORTED_LOCALES),
  }),
})
export type LoginResponse = z.infer<typeof LoginResponseSchema>

// ---------------------------------------------------------------------------
// Token refresh
// ---------------------------------------------------------------------------
export const RefreshResponseSchema = z.object({
  accessToken: z.string(),
  tokenType: z.literal('bearer'),
  expiresIn: z.number().int(),
})
export type RefreshResponse = z.infer<typeof RefreshResponseSchema>

// ---------------------------------------------------------------------------
// Password reset
// ---------------------------------------------------------------------------
export const ForgotPasswordRequestSchema = z.object({
  email: z.string().email().toLowerCase(),
})
export type ForgotPasswordRequest = z.infer<typeof ForgotPasswordRequestSchema>

export const ResetPasswordRequestSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8).max(128).regex(/[A-Z]/).regex(/[0-9]/),
})
export type ResetPasswordRequest = z.infer<typeof ResetPasswordRequestSchema>

// ---------------------------------------------------------------------------
// Email verification
// ---------------------------------------------------------------------------
export const VerifyEmailRequestSchema = z.object({
  token: z.string().min(1),
})
export type VerifyEmailRequest = z.infer<typeof VerifyEmailRequestSchema>

// ---------------------------------------------------------------------------
// Current user (me)
// ---------------------------------------------------------------------------
export const UserProfileSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  emailVerified: z.boolean(),
  locale: z.enum(SUPPORTED_LOCALES),
  subscriptionPlan: z.enum(['free', 'premium', 'family']),
  createdAt: z.string().datetime(),
})
export type UserProfile = z.infer<typeof UserProfileSchema>

// ---------------------------------------------------------------------------
// Settings update
// ---------------------------------------------------------------------------
export const UpdatePreferencesRequestSchema = z.object({
  locale: z.enum(SUPPORTED_LOCALES).optional(),
})
export type UpdatePreferencesRequest = z.infer<typeof UpdatePreferencesRequestSchema>
