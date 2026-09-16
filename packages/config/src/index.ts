/**
 * @kakeivault/config
 *
 * Shared application-wide constants and configuration values.
 * No secrets are stored here. Secrets come from environment variables.
 */

// ---------------------------------------------------------------------------
// Currency & locale
// ---------------------------------------------------------------------------
export const DEFAULT_CURRENCY = 'JPY' as const
export const DEFAULT_LOCALE = 'ja-JP' as const
export const DEFAULT_TIMEZONE = 'Asia/Tokyo' as const
export const SUPPORTED_CURRENCIES = ['JPY'] as const
export const SUPPORTED_LOCALES = ['ja-JP', 'en'] as const

export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number]
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------
export const EXPENSE_CATEGORIES = [
  'food',
  'daily_necessities',
  'transportation',
  'rent',
  'utilities',
  'medical',
  'education',
  'entertainment',
  'shopping',
  'insurance',
  'tax',
  'other',
] as const

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number]

export const DOCUMENT_CATEGORIES = [
  'salary_slip',
  'tax',
  'insurance',
  'employment',
  'utility',
  'invoice',
  'warranty',
  'other',
] as const

export type DocumentCategory = (typeof DOCUMENT_CATEGORIES)[number]

// ---------------------------------------------------------------------------
// OCR job status
// ---------------------------------------------------------------------------
export const OCR_STATUSES = [
  'uploaded',
  'queued',
  'processing',
  'review_required',
  'confirmed',
  'failed',
  'deleted',
] as const

export type OcrStatus = (typeof OCR_STATUSES)[number]

// ---------------------------------------------------------------------------
// Subscription plans
// ---------------------------------------------------------------------------
export const SUBSCRIPTION_PLANS = ['free', 'premium', 'family'] as const
export type SubscriptionPlan = (typeof SUBSCRIPTION_PLANS)[number]

export const PLAN_SCAN_LIMITS: Record<SubscriptionPlan, number | null> = {
  free: 10,
  premium: null, // unlimited
  family: null,
}

// ---------------------------------------------------------------------------
// File upload limits
// ---------------------------------------------------------------------------
export const UPLOAD_LIMITS = {
  maxFileSizeBytes: 20 * 1024 * 1024, // 20 MB
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/heic', 'image/heif', 'application/pdf'],
  signedUrlExpirySeconds: 900, // 15 minutes
  ocrTempRetentionSeconds: 3600, // 1 hour
} as const

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------
export const PAGINATION = {
  defaultLimit: 20,
  maxLimit: 100,
} as const

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------
export const AUTH = {
  accessTokenExpirySeconds: 900, // 15 minutes
  refreshTokenExpiryDays: 30,
  emailVerificationExpiryHours: 24,
  passwordResetExpiryHours: 1,
  maxLoginAttemptsPerHour: 10,
  maxRegisterAttemptsPerHour: 5,
} as const

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------
export const API_VERSION = 'v1' as const
export const API_PREFIX = `/api/${API_VERSION}` as const
