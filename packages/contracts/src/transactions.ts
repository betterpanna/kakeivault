import { z } from 'zod'
import { EXPENSE_CATEGORIES, SUPPORTED_CURRENCIES } from '@kakeivault/config'
import { AmountSchema, DateStringSchema, UuidSchema } from './common'

export const TransactionTypeSchema = z.enum(['income', 'expense'])
export type TransactionType = z.infer<typeof TransactionTypeSchema>

export const PaymentMethodSchema = z.enum([
  'cash',
  'credit_card',
  'debit_card',
  'electronic_money',
  'bank_transfer',
  'qr_code',
  'other',
])
export type PaymentMethod = z.infer<typeof PaymentMethodSchema>

export const TransactionItemSchema = z.object({
  id: UuidSchema,
  description: z.string().max(500),
  quantity: z.number().positive(),
  unitPriceMinorUnits: AmountSchema,
  amountMinorUnits: AmountSchema,
})
export type TransactionItem = z.infer<typeof TransactionItemSchema>

export const TransactionSchema = z.object({
  id: UuidSchema,
  userId: UuidSchema,
  type: TransactionTypeSchema,
  amountMinorUnits: AmountSchema,
  currency: z.enum(SUPPORTED_CURRENCIES),
  date: DateStringSchema,
  merchantName: z.string().max(500).nullable(),
  category: z.enum(EXPENSE_CATEGORIES).nullable(),
  paymentMethod: PaymentMethodSchema.nullable(),
  notes: z.string().max(2000).nullable(),
  ocrJobId: UuidSchema.nullable(),
  idempotencyKey: z.string().max(128).nullable(),
  items: z.array(TransactionItemSchema),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})
export type Transaction = z.infer<typeof TransactionSchema>

export const CreateTransactionRequestSchema = z.object({
  type: TransactionTypeSchema,
  amountMinorUnits: AmountSchema.nonnegative(),
  currency: z.enum(SUPPORTED_CURRENCIES).default('JPY'),
  date: DateStringSchema,
  merchantName: z.string().max(500).optional(),
  category: z.enum(EXPENSE_CATEGORIES).optional(),
  paymentMethod: PaymentMethodSchema.optional(),
  notes: z.string().max(2000).optional(),
  items: z
    .array(
      z.object({
        description: z.string().max(500),
        quantity: z.number().positive(),
        unitPriceMinorUnits: AmountSchema.nonnegative(),
        amountMinorUnits: AmountSchema.nonnegative(),
      }),
    )
    .optional(),
  idempotencyKey: z.string().max(128).optional(),
})
export type CreateTransactionRequest = z.infer<typeof CreateTransactionRequestSchema>

export const UpdateTransactionRequestSchema = CreateTransactionRequestSchema.partial().omit({
  idempotencyKey: true,
})
export type UpdateTransactionRequest = z.infer<typeof UpdateTransactionRequestSchema>

export const TransactionFilterSchema = z.object({
  type: TransactionTypeSchema.optional(),
  category: z.enum(EXPENSE_CATEGORIES).optional(),
  dateFrom: DateStringSchema.optional(),
  dateTo: DateStringSchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})
export type TransactionFilter = z.infer<typeof TransactionFilterSchema>
