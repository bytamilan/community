import { NextRequest } from 'next/server'
import { PostService } from '@/lib/services/post.service'
import { postQuerySchema, createPostSchema } from '@/lib/validation/post.schema'
import { createApiHandler, validateRequest } from '@/lib/middleware/api-route'

const postService = new PostService()

export const GET = createApiHandler(async (req: NextRequest) => {
  const data = await validateRequest(req, postQuerySchema)
  return postService.getPosts(data)
})

export const POST = createApiHandler(async (req: NextRequest) => {
  const data = await validateRequest(req, createPostSchema)
  return postService.createPost(data)
})