/**
 * Currency and date formatting utilities.
 * All formatting is locale-aware. Locale is always passed explicitly.
 */

import { DEFAULT_CURRENCY, type SupportedLocale } from '@kakeivault/config'

/**
 * Format minor units as a displayable currency string.
 * e.g. 428000 (minor) → "¥4,280" (ja-JP) or "¥4,280" (en)
 */
export function formatCurrency(
  minorUnits: number,
  locale: SupportedLocale = 'ja-JP',
  currency = DEFAULT_CURRENCY,
): string {
  const value = minorUnits / 100
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

/**
 * Format ISO date string for display.
 * Respects locale conventions (ja-JP: YYYY年MM月DD日, en: Month DD, YYYY)
 */
export function formatDate(
  isoDate: string,
  locale: SupportedLocale = 'ja-JP',
  options?: Intl.DateTimeFormatOptions,
): string {
  const date = new Date(isoDate + 'T00:00:00')
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  }).format(date)
}

/**
 * Format YYYY-MM month string for display.
 * e.g. "2026-09" → "2026年9月" (ja-JP) or "September 2026" (en)
 */
export function formatMonth(monthString: string, locale: SupportedLocale = 'ja-JP'): string {
  const [year, month] = monthString.split('-').map(Number)
  const date = new Date(year!, (month ?? 1) - 1, 1)
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
  }).format(date)
}

/**
 * Parse a user-entered yen string to minor units.
 * Strips commas, ¥ and ￥ symbols.
 * Returns null if the input is not a valid integer.
 */
export function parseYenInput(input: string): number | null {
  const cleaned = input.replace(/[,¥￥\s]/g, '')
  const value = parseInt(cleaned, 10)
  if (isNaN(value) || value < 0) return null
  return value * 100 // convert yen → minor units
}
