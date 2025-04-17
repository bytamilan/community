import { NextRequest } from 'next/server'
import { PostService } from '@/lib/services/post.service'
import { createPostSchema, postQuerySchema } from '@/lib/validation/post.schema'
import { ApiException } from '@/lib/types/api'
import { withProtectedApi, withPublicApi } from '@/lib/middleware'

const postService = new PostService()

export async function GET(req: NextRequest) {
  return withPublicApi(async (userId) => {
    const { searchParams } = new URL(req.url)
    const queryParams = Object.fromEntries(searchParams.entries())
    
    const validatedQuery = postQuerySchema.safeParse(queryParams)
    
    if (!validatedQuery.success) {
      throw new ApiException(
        'VALIDATION.ERROR',
        'Invalid query parameters',
        400,
        validatedQuery.error.issues
      )
    }
    
    const result = await postService.getPosts({
      ...validatedQuery.data,
      isPublished: userId ? undefined : true
    })
    
    return result
  })(req)
}

export async function POST(req: NextRequest) {
  return withProtectedApi(async (userId) => {
    const data = await req.json()
    
    const validatedData = createPostSchema.safeParse(data)
    
    if (!validatedData.success) {
      throw new ApiException(
        'VALIDATION.ERROR',
        'Invalid post data',
        400,
        validatedData.error.issues
      )
    }
    
    const post = await postService.createPost({
      ...validatedData.data,
      authorId: userId
    })
    
    return post
  })(req)
}