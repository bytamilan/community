import { z } from 'zod'

export const createTagSchema = z.object({
  name: z.string().min(1, 'TAG.VALIDATION.NAME_REQUIRED')
    .max(30, 'TAG.VALIDATION.NAME_TOO_LONG'),
  slug: z.string().min(1, 'TAG.VALIDATION.SLUG_REQUIRED')
    .max(30, 'TAG.VALIDATION.SLUG_TOO_LONG')
    .regex(/^[a-z0-9-]+$/, 'TAG.VALIDATION.INVALID_SLUG')
})

export const updateTagSchema = createTagSchema.partial()

export const tagQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  searchQuery: z.string().optional()
})