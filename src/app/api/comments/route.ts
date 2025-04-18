import { NextRequest } from 'next/server'
import { CommentService } from '@/lib/services/comment.service'
import { commentQuerySchema, createCommentSchema } from '@/lib/validation/comment.schema'
import { createApiHandler, validateRequest } from '@/lib/middleware/api-route'

const commentService = new CommentService()

export const GET = createApiHandler(async (req: NextRequest) => {
  const data = await validateRequest(req, commentQuerySchema)
  return commentService.getComments(data)
})

export const POST = createApiHandler(async (req: NextRequest) => {
  const data = await validateRequest(req, createCommentSchema)
  return commentService.createComment(data)
})