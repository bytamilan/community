import { createApiHandler, validateRequest } from '@/lib/middleware/api-route'
import { z } from 'zod'
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { ApiException } from '@/lib/types/api'

const postSchema = z.object({
  title: z.string().min(1).max(100),
  content: z.string().min(1),
  categoryId: z.number(),
  creditCost: z.number().min(1).optional().default(1),
  isPublished: z.boolean().optional().default(true),
  tags: z.array(z.number()).optional()
})

const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10)
})

async function handler(req: NextRequest) {
  try {
    if (req.method === 'POST') {
      const data = await validateRequest(req, postSchema)
      const { tags, ...postData } = data

      // Get author ID from auth token (placeholder)
      const authorId = 'test-user-id' // TODO: Get from auth token
      
      const post = await db.$transaction(async (tx) => {
        // Create the post
        const post = await tx.post.create({
          data: {
            ...postData,
            authorId,
            viewCount: 0,
            upvotes: 0,
            downvotes: 0
          }
        })

        // Add tags if provided
        if (tags?.length) {
          await tx.postTag.createMany({
            data: tags.map(tagId => ({
              postId: post.id,
              tagId
            }))
          })
        }

        return post
      })
      
      return Response.json({ 
        success: true, 
        data: post 
      })
    }

    if (req.method === 'GET') {
      const { page, limit } = paginationSchema.parse(
        Object.fromEntries(new URL(req.url).searchParams)
      )
      
      const [posts, total] = await Promise.all([
        db.post.findMany({
          take: limit,
          skip: (page - 1) * limit,
          orderBy: { createdAt: 'desc' },
          include: {
            author: {
              select: {
                username: true,
                avatarUrl: true
              }
            },
            category: true,
            postTags: {
              include: {
                tag: true
              }
            },
            _count: {
              select: {
                comments: true
              }
            }
          }
        }),
        db.post.count()
      ])

      return Response.json({
        posts,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasMore: page * limit < total
        }
      })
    }

    throw new ApiException('METHOD_NOT_ALLOWED', 'Method not allowed', 405)
  } catch (error) {
    if (error instanceof ApiException) {
      return error.toResponse()
    }
    if (error instanceof z.ZodError) {
      return new ApiException(
        'VALIDATION_ERROR',
        'Invalid request data',
        400,
        error.issues
      ).toResponse()
    }
    return new ApiException(
      'INTERNAL_ERROR',
      'An unexpected error occurred',
      500
    ).toResponse()
  }
}

export const GET = createApiHandler(handler)
export const POST = createApiHandler(handler)