import { NextRequest } from 'next/server'
import { PostService } from '@/lib/services/post.service'
import { updatePostSchema } from '@/lib/validation/post.schema'
import { ApiException } from '@/lib/types/api'
import { createApiHandler, validateRequest } from '@/lib/middleware/api-route'

const postService = new PostService()

const validatePostId = (id: string | undefined) => {
  if (!id) {
    throw new ApiException('VALIDATION.REQUIRED_FIELD', 'Post ID is required', 400)
  }
  return id
}

export const GET = createApiHandler(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const postId = validatePostId(params.id)
  return postService.getPostById(postId)
})

export const PATCH = createApiHandler(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const postId = validatePostId(params.id)
  const data = await validateRequest(req, updatePostSchema)
  return postService.updatePost(postId, data)
})

export const DELETE = createApiHandler(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const postId = validatePostId(params.id)
  return postService.deletePost(postId)
})