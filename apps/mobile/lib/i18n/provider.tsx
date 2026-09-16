import { createTranslator, type TranslationKey } from '@kakeivault/i18n'
import { type SupportedLocale } from '@kakeivault/config'
import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { NativeModules, Platform } from 'react-native'

interface I18nContextValue {
  locale: SupportedLocale
  setLocale: (locale: SupportedLocale) => void
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)

function detectDeviceLocale(): SupportedLocale {
  try {
    const deviceLocale: string =
      Platform.OS === 'ios'
        ? (NativeModules.SettingsManager?.settings?.AppleLocale ??
          NativeModules.SettingsManager?.settings?.AppleLanguages?.[0] ??
          'en')
        : (NativeModules.I18nManager?.localeIdentifier ?? 'en')
    if (deviceLocale.startsWith('ja')) return 'ja-JP'
  } catch {}
  return 'en'
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<SupportedLocale>(detectDeviceLocale)

  const setLocale = useCallback((newLocale: SupportedLocale) => {
    setLocaleState(newLocale)
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
