import { UPLOAD_LIMITS } from '@kakeivault/config'

export interface FileValidationResult {
  valid: boolean
  errorKey?: string
}

/**
 * Validate a file before upload.
 * Uses allowlisted MIME types and max file size from config.
 * Returns a localisation key so the UI can display the error in the user's language.
 */
export function validateUploadFile(mimeType: string, fileSizeBytes: number): FileValidationResult {
  if (fileSizeBytes > UPLOAD_LIMITS.maxFileSizeBytes) {
    return { valid: false, errorKey: 'error.fileTooLarge' }
  }

  const allowedTypes: readonly string[] = UPLOAD_LIMITS.allowedMimeTypes
  if (!allowedTypes.includes(mimeType)) {
    return { valid: false, errorKey: 'error.unsupportedFile' }
  }

  return { valid: true }
}

/** Returns a safe filename with non-alphanumeric chars replaced. */
export function sanitizeFilename(filename: string): string {
  const ext = filename.split('.').pop() ?? ''
  const base = filename.slice(0, filename.length - ext.length - 1)
  const safeBase = base.replace(/[^a-zA-Z0-9_\-]/g, '_').slice(0, 200)
  return ext ? `${safeBase}.${ext}` : safeBase
}
