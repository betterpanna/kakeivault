import { type SupportedLocale } from '@kakeivault/config'
import { en } from './locales/en'
import { jaJP, type TranslationKey } from './locales/ja-JP'

export type { TranslationKey }
export { jaJP, en }

const translations: Record<SupportedLocale, Record<TranslationKey, string>> = {
  'ja-JP': jaJP,
  en: en as unknown as Record<TranslationKey, string>,
}

/**
 * Retrieve a translation string for the given locale and key.
 * Supports {{variable}} interpolation via the vars parameter.
 *
 * Falls back to the key itself if translation is missing (never crashes).
 */
export function t(
  locale: SupportedLocale,
  key: TranslationKey,
  vars?: Record<string, string | number>,
): string {
  const dict = translations[locale]
  let value: string = dict[key] ?? key

  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      value = value.replaceAll(`{{${k}}}`, String(v))
    }
  }

  return value
}

/**
 * Creates a bound translator for a fixed locale.
 * Useful in React contexts where you want a simple t() function.
 */
export function createTranslator(locale: SupportedLocale) {
  return (key: TranslationKey, vars?: Record<string, string | number>) => t(locale, key, vars)
}

/**
 * Returns all keys present in ja-JP but missing from en, and vice versa.
 * Used in the localization consistency test.
 */
export function findMissingKeys(): { missingFromEn: string[]; missingFromJa: string[] } {
  const jaKeys = new Set(Object.keys(jaJP))
  const enKeys = new Set(Object.keys(en))

  const missingFromEn = [...jaKeys].filter((k) => !enKeys.has(k))
  const missingFromJa = [...enKeys].filter((k) => !jaKeys.has(k))

  return { missingFromEn, missingFromJa }
}
