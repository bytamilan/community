import { z } from 'zod'

export const createPostSchema = z.object({
  title: z.string().min(1, 'POST.VALIDATION.TITLE_REQUIRED'),
  content: z.string().min(1, 'POST.VALIDATION.CONTENT_REQUIRED'),
  categoryId: z.number().int().positive('POST.VALIDATION.CATEGORY_REQUIRED'),
  tagIds: z.array(z.number().int().positive()).optional(),
  creditCost: z.number().int().min(0).optional(),
  isPublished: z.boolean().optional()
})

export const updatePostSchema = createPostSchema.partial()

export const postQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  categoryId: z.coerce.number().int().positive().optional(),
  authorId: z.string().uuid().optional(),
  searchQuery: z.string().optional(),
  isPublished: z.boolean().optional()
})