/**
 * Generate a URL-safe idempotency key.
 * Uses the Web Crypto API (globalThis.crypto) which is available in
 * Node.js 19+, modern browsers, and React Native (Hermes).
 * Callers should persist this before the request and reuse it on retry.
 */
export function generateIdempotencyKey(): string {
  // globalThis.crypto.randomUUID() is available on all target platforms
  return globalThis.crypto.randomUUID()
}

export function isValidIdempotencyKey(key: string): boolean {
  return typeof key === 'string' && key.length >= 8 && key.length <= 128
}
