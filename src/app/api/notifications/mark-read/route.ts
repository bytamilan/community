import { NextRequest } from 'next/server'
import { NotificationService } from '@/lib/services/notification.service'
import { markAsReadSchema } from '@/lib/validation/notification.schema'
import { ApiException } from '@/lib/types/api'
import { withProtectedApi } from '@/lib/middleware'

const notificationService = new NotificationService()

export async function POST(req: NextRequest) {
  return withProtectedApi(async (userId) => {
    const data = await req.json()
    
    const validatedData = markAsReadSchema.safeParse(data)
    
    if (!validatedData.success) {
      throw new ApiException(
        'VALIDATION.ERROR',
        'Invalid request data',
        400,
        validatedData.error.issues
      )
    }
    
    await notificationService.markAsRead({
      userId,
      notificationId: validatedData.data.notificationId
    })
    
    return { success: true }
  })(req)
}