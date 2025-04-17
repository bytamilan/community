import { NextRequest } from 'next/server'
import { CommentService } from '@/lib/services/comment.service'
import { updateCommentSchema } from '@/lib/validation/comment.schema'
import { ApiException } from '@/lib/types/api'
import { withProtectedApi, withPublicApi } from '@/lib/middleware'

const commentService = new CommentService()

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return withPublicApi(async () => {
    if (!params.id) {
      throw new ApiException('VALIDATION.ERROR', 'Comment ID is required', 400)
    }
    
    const comment = await commentService.getCommentById(params.id)
    return comment
  })(req)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return withProtectedApi(async (userId) => {
    if (!params.id) {
      throw new ApiException('VALIDATION.ERROR', 'Comment ID is required', 400)
    }

    const data = await req.json()
    const validatedData = updateCommentSchema.safeParse(data)
    
    if (!validatedData.success) {
      throw new ApiException(
        'VALIDATION.ERROR',
        'Invalid update data',
        400,
        validatedData.error.issues
      )
    }
    
    const comment = await commentService.updateComment(params.id, userId, validatedData.data)
    return comment
  })(req)
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return withProtectedApi(async (userId) => {
    if (!params.id) {
      throw new ApiException('VALIDATION.ERROR', 'Comment ID is required', 400)
    }
    
    await commentService.deleteComment(params.id, userId)
    return { success: true }
  })(req)
}