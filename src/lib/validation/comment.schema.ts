import { z } from 'zod'

export const createCommentSchema = z.object({
  content: z.string().min(1, 'COMMENT.VALIDATION.CONTENT_REQUIRED').max(2000, 'COMMENT.VALIDATION.CONTENT_TOO_LONG'),
  postId: z.string().uuid('COMMENT.VALIDATION.INVALID_POST_ID'),
  parentId: z.string().uuid('COMMENT.VALIDATION.INVALID_PARENT_ID').optional()
})

export const updateCommentSchema = z.object({
  content: z.string().min(1, 'COMMENT.VALIDATION.CONTENT_REQUIRED').max(2000, 'COMMENT.VALIDATION.CONTENT_TOO_LONG')
})

export const commentQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  postId: z.string().uuid('COMMENT.VALIDATION.INVALID_POST_ID'),
  parentId: z.string().uuid('COMMENT.VALIDATION.INVALID_PARENT_ID').optional(),
  authorId: z.string().uuid('COMMENT.VALIDATION.INVALID_AUTHOR_ID').optional()
})