import { z } from 'zod'

export const createCategorySchema = z.object({
  name: z.string().min(1, 'CATEGORY.VALIDATION.NAME_REQUIRED')
    .max(50, 'CATEGORY.VALIDATION.NAME_TOO_LONG'),
  slug: z.string().min(1, 'CATEGORY.VALIDATION.SLUG_REQUIRED')
    .max(50, 'CATEGORY.VALIDATION.SLUG_TOO_LONG')
    .regex(/^[a-z0-9-]+$/, 'CATEGORY.VALIDATION.INVALID_SLUG'),
  description: z.string().max(500, 'CATEGORY.VALIDATION.DESCRIPTION_TOO_LONG').optional(),
  creditRequirement: z.number().int().min(0, 'CATEGORY.VALIDATION.INVALID_CREDIT_REQUIREMENT').optional(),
  isPremium: z.boolean().optional()
})

export const updateCategorySchema = createCategorySchema.partial()

export const categoryQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  searchQuery: z.string().optional()
})