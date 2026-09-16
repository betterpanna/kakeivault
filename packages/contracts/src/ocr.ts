import { z } from 'zod'
import { EXPENSE_CATEGORIES, OCR_STATUSES, SUPPORTED_CURRENCIES } from '@kakeivault/config'
import { AmountSchema, DateStringSchema, UuidSchema } from './common'

export const OcrStatusSchema = z.enum(OCR_STATUSES)
export type OcrStatus = z.infer<typeof OcrStatusSchema>

export const OcrLineItemSchema = z.object({
  description: z.string().max(500),
  quantity: z.number().positive().nullable(),
  unitPriceMinorUnits: AmountSchema.nonnegative().nullable(),
  amountMinorUnits: AmountSchema.nonnegative(),
})
export type OcrLineItem = z.infer<typeof OcrLineItemSchema>

export const OcrConfidenceSchema = z.object({
  overall: z.number().min(0).max(1),
  merchantName: z.number().min(0).max(1).nullable(),
  transactionDate: z.number().min(0).max(1).nullable(),
  total: z.number().min(0).max(1).nullable(),
  subtotal: z.number().min(0).max(1).nullable(),
  tax: z.number().min(0).max(1).nullable(),
})
export type OcrConfidence = z.infer<typeof OcrConfidenceSchema>

export const ExtractedReceiptSchema = z.object({
  documentType: z.literal('receipt'),
  merchantName: z.string().max(500).nullable(),
  transactionDate: DateStringSchema.nullable(),
  currency: z.enum(SUPPORTED_CURRENCIES).nullable(),
  subtotalMinorUnits: AmountSchema.nonnegative().nullable(),
  taxMinorUnits: AmountSchema.nonnegative().nullable(),
  totalMinorUnits: AmountSchema.nonnegative().nullable(),
  paymentMethod: z.string().max(100).nullable(),
  suggestedCategory: z.enum(EXPENSE_CATEGORIES).nullable(),
  lineItems: z.array(OcrLineItemSchema),
  confidence: OcrConfidenceSchema,
  rawText: z.string().max(50000).nullable(),
  validationWarnings: z.array(z.string()),
})
export type ExtractedReceipt = z.infer<typeof ExtractedReceiptSchema>

export const OcrJobSchema = z.object({
  id: UuidSchema,
  userId: UuidSchema,
  status: OcrStatusSchema,
  documentType: z.enum(['receipt', 'salary_slip']),
  storageKey: z.string().max(1000),
  mimeType: z.string().max(100),
  extractedData: ExtractedReceiptSchema.nullable(),
  userReview: ExtractedReceiptSchema.partial().nullable(),
  errorMessage: z.string().max(2000).nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})
export type OcrJob = z.infer<typeof OcrJobSchema>

export const CreateOcrJobRequestSchema = z.object({
  storageKey: z.string().max(1000),
  mimeType: z.string().max(100),
  documentType: z.enum(['receipt', 'salary_slip']),
  idempotencyKey: z.string().max(128).optional(),
})
export type CreateOcrJobRequest = z.infer<typeof CreateOcrJobRequestSchema>

export const ReviewOcrJobRequestSchema = z.object({
  /** Partial user corrections. Only provided fields overwrite OCR data. */
  corrections: ExtractedReceiptSchema.partial(),
})
export type ReviewOcrJobRequest = z.infer<typeof ReviewOcrJobRequestSchema>

export const ConfirmOcrJobRequestSchema = z.object({
  /** The final reviewed data to create a confirmed transaction from. */
  confirmedData: ExtractedReceiptSchema,
  idempotencyKey: z.string().max(128).optional(),
})
export type ConfirmOcrJobRequest = z.infer<typeof ConfirmOcrJobRequestSchema>
