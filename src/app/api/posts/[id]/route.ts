import { NextRequest, NextResponse } from 'next/server'
import { PostService } from '@/lib/services/post.service'
import { updatePostSchema } from '@/lib/validation/post.schema'
import { ApiException } from '@/lib/types/api'
import { withProtectedApi, withPublicApi } from '@/lib/middleware'

/**
 * Route handler for /api/posts/[id]
 * Handles GET, PATCH, DELETE operations on a specific post
 */

const postService = new PostService()

// Validate post ID helper
const validatePostId = (id: string | undefined) => {
  if (!id) {
    throw new ApiException('VALIDATION.REQUIRED_FIELD', 'Post ID is required', 400)
  }
  return id
}

/**
 * GET /api/posts/[id] - Retrieve a specific post
 * Public endpoint with optional authentication
 */
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
  return withPublicApi((userId) => {
    const postId = validatePostId(params.id)
    return postService.getPostById(postId, userId).then(post =>
        NextResponse.json(post)
    )
  })(req)
}

/**
 * PATCH /api/posts/[id] - Update a specific post
 * Protected endpoint requiring authentication
 */
export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
  // First parse the request body outside the middleware chain
  const body = await req.json()

  return withProtectedApi((userId) => {
    const postId = validatePostId(params.id)

    // Validate request data
    const validationResult = updatePostSchema.safeParse(body)

    if (!validationResult.success) {
      throw new ApiException(
          'VALIDATION.ERROR',
          'Invalid update data',
          400,
          { issues: validationResult.error.issues }
      )
    }

    return postService.updatePost(
        postId,
        userId,
        validationResult.data
    ).then(updatedPost =>
        NextResponse.json(updatedPost)
    )
  })(req)
}

/**
 * DELETE /api/posts/[id] - Delete a specific post
 * Protected endpoint requiring authentication
 */
export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
  return withProtectedApi((userId) => {
    const postId = validatePostId(params.id)

    return postService.deletePost(postId, userId).then(() =>
        NextResponse.json({ success: true })
    )
  })(req)
}