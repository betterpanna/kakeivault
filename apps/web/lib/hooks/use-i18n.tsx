'use client'

/**
 * Internationalization context for the web app.
 *
 * Language preference is:
 * 1. Stored in user preferences (server-side)
 * 2. Persisted in localStorage as a fallback for the initial render
 * 3. Browser language as final fallback
 *
 * Never hardcode strings in components — always use the t() function.
 */

import { createTranslator, type TranslationKey } from '@kakeivault/i18n'
import { type SupportedLocale } from '@kakeivault/config'
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'

interface I18nContextValue {
  locale: SupportedLocale
  setLocale: (locale: SupportedLocale) => void
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)

const LOCALE_STORAGE_KEY = 'kakeivault_locale'

function detectInitialLocale(): SupportedLocale {
  if (typeof window === 'undefined') return 'ja-JP'
  const stored = localStorage.getItem(LOCALE_STORAGE_KEY)
  if (stored === 'ja-JP' || stored === 'en') return stored
  const browser = navigator.language
  if (browser.startsWith('ja')) return 'ja-JP'
  return 'en'
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<SupportedLocale>('ja-JP')

  useEffect(() => {
    setLocaleState(detectInitialLocale())
  }, [])

  const setLocale = useCallback((newLocale: SupportedLocale) => {
    setLocaleState(newLocale)
    localStorage.setItem(LOCALE_STORAGE_KEY, newLocale)
    document.documentElement.lang = newLocale === 'ja-JP' ? 'ja' : 'en'
  }, [])

  const translator = createTranslator(locale)
  const t = useCallback(
    (key: TranslationKey, vars?: Record<string, string | number>) => translator(key, vars),
    [translator],
  )

  return <I18nContext.Provider value={{ locale, setLocale, t }}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
