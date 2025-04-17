import { NextRequest } from 'next/server'
import { CategoryService } from '@/lib/services/category.service'
import { createCategorySchema, categoryQuerySchema } from '@/lib/validation/category.schema'
import { ApiException } from '@/lib/types/api'
import { withProtectedApi, withPublicApi, withCustomRateLimit } from '@/lib/middleware'

const categoryService = new CategoryService()

// Categories are public data, but with stricter rate limiting
const withCategoryRateLimit = withCustomRateLimit({
  windowSize: 60 * 1000, // 1 minute
  maxRequests: 100 // Higher limit for public category listing
})

export async function GET(req: NextRequest) {
  return withCategoryRateLimit(async () => {
    const { searchParams } = new URL(req.url)
    const queryParams = Object.fromEntries(searchParams.entries())
    
    const validatedQuery = categoryQuerySchema.safeParse(queryParams)
    
    if (!validatedQuery.success) {
      throw new ApiException(
        'VALIDATION.ERROR',
        'Invalid query parameters',
        400,
        validatedQuery.error.issues
      )
    }
    
    const result = await categoryService.getCategories(validatedQuery.data)
    return result
  })(req)
}

// Only admins can create categories
export async function POST(req: NextRequest) {
  return withProtectedApi(async (userId) => {
    const data = await req.json()
    
    // TODO: Add admin check here when role system is implemented
    // For now, all authenticated users can create categories
    
    const validatedData = createCategorySchema.safeParse(data)
    
    if (!validatedData.success) {
      throw new ApiException(
        'VALIDATION.ERROR',
        'Invalid category data',
        400,
        validatedData.error.issues
      )
    }
    
    const category = await categoryService.createCategory(validatedData.data)
    return category
  })(req)
}