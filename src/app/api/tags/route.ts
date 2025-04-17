import { NextRequest } from 'next/server'
import { TagService } from '@/lib/services/tag.service'
import { createTagSchema, tagQuerySchema } from '@/lib/validation/tag.schema'
import { ApiException } from '@/lib/types/api'
import { withProtectedApi, withPublicApi, withCustomRateLimit } from '@/lib/middleware'

const tagService = new TagService()

// Tags are public data, but with stricter rate limiting
const withTagRateLimit = withCustomRateLimit({
  windowSize: 60 * 1000, // 1 minute
  maxRequests: 100 // Higher limit for public tag listing
})

export async function GET(req: NextRequest) {
  return withTagRateLimit(async () => {
    const { searchParams } = new URL(req.url)
    const queryParams = Object.fromEntries(searchParams.entries())
    
    const validatedQuery = tagQuerySchema.safeParse(queryParams)
    
    if (!validatedQuery.success) {
      throw new ApiException(
        'VALIDATION.ERROR',
        'Invalid query parameters',
        400,
        validatedQuery.error.issues
      )
    }
    
    const result = await tagService.getTags(validatedQuery.data)
    return result
  })(req)
}

// Only admins can create tags
export async function POST(req: NextRequest) {
  return withProtectedApi(async (userId) => {
    const data = await req.json()
    
    // TODO: Add admin check here when role system is implemented
    // For now, all authenticated users can create tags
    
    const validatedData = createTagSchema.safeParse(data)
    
    if (!validatedData.success) {
      throw new ApiException(
        'VALIDATION.ERROR',
        'Invalid tag data',
        400,
        validatedData.error.issues
      )
    }
    
    const tag = await tagService.createTag(validatedData.data)
    return tag
  })(req)
}