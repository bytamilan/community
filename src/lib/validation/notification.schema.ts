import { z } from 'zod'

export const notificationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  isRead: z.boolean().optional(),
})

export const markAsReadSchema = z.object({
  notificationId: z.string().uuid('NOTIFICATION.VALIDATION.INVALID_ID').optional(),
})