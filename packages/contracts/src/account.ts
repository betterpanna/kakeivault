import { z } from 'zod'

export const AccountExportRequestSchema = z.object({
  format: z.enum(['json', 'csv']).default('json'),
})
export type AccountExportRequest = z.infer<typeof AccountExportRequestSchema>

export const AccountExportResponseSchema = z.object({
  exportId: z.string().uuid(),
  status: z.enum(['queued', 'processing', 'ready', 'expired']),
  downloadUrl: z.string().url().nullable(),
  expiresAt: z.string().datetime().nullable(),
})
export type AccountExportResponse = z.infer<typeof AccountExportResponseSchema>

export const DeleteAccountRequestSchema = z.object({
  confirmPhrase: z.literal('DELETE MY ACCOUNT'),
  password: z.string().min(1),
})
export type DeleteAccountRequest = z.infer<typeof DeleteAccountRequestSchema>
