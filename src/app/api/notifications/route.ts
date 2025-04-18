import { NextRequest } from 'next/server'
import { NotificationService } from '@/lib/services/notification.service'
import { notificationQuerySchema } from '@/lib/validation/notification.schema'
import { ApiException } from '@/types/api'
import { withProtectedApi, withCustomRateLimit } from '@/lib/middleware'

const notificationService = new NotificationService()

// Custom rate limit for notifications
const withNotificationRateLimit = withCustomRateLimit({
  windowSize: 60 * 1000, // 1 minute
  maxRequests: 60 // 60 requests per minute
})

export async function GET(req: NextRequest) {
  return withNotificationRateLimit(async () => {
    return withProtectedApi(async (userId) => {
      const { searchParams } = new URL(req.url)
      const queryParams = {
        page: searchParams.get('page'),
        limit: searchParams.get('limit'),
        isRead: searchParams.has('isRead') 
          ? searchParams.get('isRead') === 'true'
          : undefined
      }
      
      const validatedQuery = notificationQuerySchema.safeParse(queryParams)
      
      if (!validatedQuery.success) {
        throw new ApiException(
          'VALIDATION.ERROR',
          'Invalid query parameters',
          400,
          validatedQuery.error.issues
        )
      }
      
      const result = await notificationService.getNotifications({
        userId,
        ...validatedQuery.data
      })
      
      return result
    })(req)
  })(req)
}

// Endpoint to get unread notification count
export async function HEAD(req: NextRequest) {
  return withNotificationRateLimit(async () => {
    return withProtectedApi(async (userId) => {
      const count = await notificationService.getUnreadCount(userId)
      
      return new Response(null, {
        headers: {
          'X-Notification-Count': count.toString()
        }
      })
    })(req)
  })(req)
}