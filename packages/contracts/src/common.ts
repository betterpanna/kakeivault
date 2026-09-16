import { z } from 'zod'

// ---------------------------------------------------------------------------
// Generic response wrappers
// ---------------------------------------------------------------------------
export const PaginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  total: z.number().int().min(0),
  hasNext: z.boolean(),
})
export type Pagination = z.infer<typeof PaginationSchema>

export function paginatedResponse<T extends z.ZodType>(itemSchema: T) {
  return z.object({
    items: z.array(itemSchema),
    pagination: PaginationSchema,
  })
}

export const ApiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.record(z.unknown()).optional(),
})
export type ApiError = z.infer<typeof ApiErrorSchema>

// ---------------------------------------------------------------------------
// Shared primitive schemas
// ---------------------------------------------------------------------------

/** UUID v4 string */
export const UuidSchema = z.string().uuid()

/**
 * Financial amount stored as integer minor units (sen for JPY is already 0,
 * so for JPY we store whole yen as integers × 100 for uniformity across
 * future multi-currency support, matching Stripe's convention).
 */
export const AmountSchema = z.number().int()

/** ISO 8601 date string YYYY-MM-DD */
export const DateStringSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD')

/** ISO 8601 month string YYYY-MM */
export const MonthStringSchema = z.string().regex(/^\d{4}-\d{2}$/, 'Must be YYYY-MM')

/** ISO 8601 datetime string */
export const DatetimeSchema = z.string().datetime()

export const CursorSchema = z.string().optional()
