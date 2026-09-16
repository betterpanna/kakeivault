import { z } from 'zod'
import { DOCUMENT_CATEGORIES } from '@kakeivault/config'
import { DateStringSchema, UuidSchema } from './common'

export const DocumentCategorySchema = z.enum(DOCUMENT_CATEGORIES)
export type DocumentCategory = z.infer<typeof DocumentCategorySchema>

export const DocumentSchema = z.object({
  id: UuidSchema,
  userId: UuidSchema,
  title: z.string().max(500),
  category: DocumentCategorySchema,
  documentDate: DateStringSchema.nullable(),
  notes: z.string().max(2000).nullable(),
  tags: z.array(z.string().max(100)),
  mimeType: z.string().max(100),
  fileSizeBytes: z.number().int().nonnegative(),
  hasExtractedText: z.boolean(),
  retentionDays: z.number().int().positive().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})
export type Document = z.infer<typeof DocumentSchema>

export const CreateDocumentRequestSchema = z.object({
  title: z.string().min(1).max(500),
  category: DocumentCategorySchema,
  documentDate: DateStringSchema.optional(),
  notes: z.string().max(2000).optional(),
  tags: z.array(z.string().max(100)).default([]),
  storageKey: z.string().max(1000), // returned from presign
  mimeType: z.string().max(100),
  fileSizeBytes: z.number().int().nonnegative(),
  retentionDays: z.number().int().positive().optional(),
})
export type CreateDocumentRequest = z.infer<typeof CreateDocumentRequestSchema>

export const DocumentDownloadResponseSchema = z.object({
  signedUrl: z.string().url(),
  expiresAt: z.string().datetime(),
})
export type DocumentDownloadResponse = z.infer<typeof DocumentDownloadResponseSchema>

// ---------------------------------------------------------------------------
// Presigned upload
// ---------------------------------------------------------------------------
export const PresignUploadRequestSchema = z.object({
  filename: z.string().max(255),
  mimeType: z.string().max(100),
  fileSizeBytes: z
    .number()
    .int()
    .positive()
    .max(20 * 1024 * 1024),
  purpose: z.enum(['document', 'receipt', 'salary_slip']),
})
export type PresignUploadRequest = z.infer<typeof PresignUploadRequestSchema>

export const PresignUploadResponseSchema = z.object({
  uploadUrl: z.string().url(),
  storageKey: z.string(),
  expiresAt: z.string().datetime(),
  fields: z.record(z.string()).optional(), // for multipart POST presign
})
export type PresignUploadResponse = z.infer<typeof PresignUploadResponseSchema>
