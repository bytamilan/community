import { NextRequest } from 'next/server'
import { PostService } from '@/lib/services/post.service'
import { updatePostSchema } from '@/lib/validation/post.schema'
import { ApiException } from '@/lib/types/api'
import { withProtectedApi, withPublicApi } from '@/lib/middleware'

const postService = new PostService()

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return withPublicApi(async (userId) => {
    if (!params.id) {
      throw new ApiException('VALIDATION.ERROR', 'Post ID is required', 400)
    }
    
    const post = await postService.getPostById(params.id, userId)
    return post
  })(req)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return withProtectedApi(async (userId) => {
    if (!params.id) {
      throw new ApiException('VALIDATION.ERROR', 'Post ID is required', 400)
    }

    const data = await req.json()
    const validatedData = updatePostSchema.safeParse(data)
    
    if (!validatedData.success) {
      throw new ApiException(
        'VALIDATION.ERROR',
        'Invalid update data',
        400,
        validatedData.error.issues
      )
    }
    
    const post = await postService.updatePost(params.id, userId, validatedData.data)
    return post
  })(req)
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return withProtectedApi(async (userId) => {
    if (!params.id) {
      throw new ApiException('VALIDATION.ERROR', 'Post ID is required', 400)
    }
    
    await postService.deletePost(params.id, userId)
    return { success: true }
  })(req)
}