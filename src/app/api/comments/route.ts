import { NextRequest } from 'next/server'
import { CommentService } from '@/lib/services/comment.service'
import { createCommentSchema, commentQuerySchema } from '@/lib/validation/comment.schema'
import { ApiException } from '@/lib/types/api'
import { withProtectedApi, withPublicApi } from '@/lib/middleware'

const commentService = new CommentService()

export async function GET(req: NextRequest) {
  return withPublicApi(async () => {
    const { searchParams } = new URL(req.url)
    const queryParams = Object.fromEntries(searchParams.entries())
    
    const validatedQuery = commentQuerySchema.safeParse(queryParams)
    
    if (!validatedQuery.success) {
      throw new ApiException(
        'VALIDATION.ERROR',
        'Invalid query parameters',
        400,
        validatedQuery.error.issues
      )
    }
    
    const result = await commentService.getComments(validatedQuery.data)
    return result
  })(req)
}

export async function POST(req: NextRequest) {
  return withProtectedApi(async (userId) => {
    const data = await req.json()
    
    const validatedData = createCommentSchema.safeParse(data)
    
    if (!validatedData.success) {
      throw new ApiException(
        'VALIDATION.ERROR',
        'Invalid comment data',
        400,
        validatedData.error.issues
      )
    }
    
    const comment = await commentService.createComment({
      ...validatedData.data,
      authorId: userId
    })
    
    return comment
  })(req)
}