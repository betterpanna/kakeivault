/**
 * Secure token storage for mobile.
 *
 * Security: access tokens are stored in expo-secure-store (iOS Keychain /
 * Android Keystore), NEVER in AsyncStorage or any other plaintext store.
 */

import * as SecureStore from 'expo-secure-store'

const ACCESS_TOKEN_KEY = 'kakeivault.access_token'
const REFRESH_TOKEN_KEY = 'kakeivault.refresh_token'

export const tokenStore = {
  async setAccessToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token, {
      keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
    })
  },

  async getAccessToken(): Promise<string | null> {
    return SecureStore.getItemAsync(ACCESS_TOKEN_KEY)
  },

  async setRefreshToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token, {
      keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
    })
  },

  async getRefreshToken(): Promise<string | null> {
    return SecureStore.getItemAsync(REFRESH_TOKEN_KEY)
  },

  async clearTokens(): Promise<void> {
    await Promise.all([
      SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
      SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
    ])
  },
}
