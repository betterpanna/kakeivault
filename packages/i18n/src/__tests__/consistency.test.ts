/**
 * Localization key consistency test.
 * Fails if any key exists in one locale but not the other.
 */
import { describe, expect, it } from 'vitest'
import { findMissingKeys } from '../index'

describe('i18n key consistency', () => {
  it('has identical keys in ja-JP and en', () => {
    const { missingFromEn, missingFromJa } = findMissingKeys()

    if (missingFromEn.length > 0) {
      console.error('Keys in ja-JP but missing from en:', missingFromEn)
    }
    if (missingFromJa.length > 0) {
      console.error('Keys in en but missing from ja-JP:', missingFromJa)
    }

    expect(missingFromEn).toHaveLength(0)
    expect(missingFromJa).toHaveLength(0)
  })
})
