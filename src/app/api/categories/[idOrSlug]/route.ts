import { NextRequest } from 'next/server'
import { CategoryService } from '@/lib/services/category.service'
import { updateCategorySchema } from '@/lib/validation/category.schema'
import { ApiException } from '@/lib/types/api'
import { withProtectedApi, withPublicApi } from '@/lib/middleware'

const categoryService = new CategoryService()

export async function GET(
  req: NextRequest,
  { params }: { params: { idOrSlug: string } }
) {
  return withPublicApi(async () => {
    if (!params.idOrSlug) {
      throw new ApiException('VALIDATION.ERROR', 'Category ID or slug is required', 400)
    }
    
    // Try to parse as ID first, if not, treat as slug
    const id = parseInt(params.idOrSlug)
    const category = !isNaN(id)
      ? await categoryService.getCategoryById(id)
      : await categoryService.getCategoryBySlug(params.idOrSlug)
    
    return category
  })(req)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { idOrSlug: string } }
) {
  return withProtectedApi(async (userId) => {
    if (!params.idOrSlug) {
      throw new ApiException('VALIDATION.ERROR', 'Category ID or slug is required', 400)
    }

    const id = parseInt(params.idOrSlug)
    if (isNaN(id)) {
      throw new ApiException('VALIDATION.ERROR', 'Invalid category ID', 400)
    }

    const data = await req.json()
    const validatedData = updateCategorySchema.safeParse(data)
    
    if (!validatedData.success) {
      throw new ApiException(
        'VALIDATION.ERROR',
        'Invalid update data',
        400,
        validatedData.error.issues
      )
    }
    
    // TODO: Add admin check here when role system is implemented
    const category = await categoryService.updateCategory(id, validatedData.data)
    return category
  })(req)
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { idOrSlug: string } }
) {
  return withProtectedApi(async (userId) => {
    if (!params.idOrSlug) {
      throw new ApiException('VALIDATION.ERROR', 'Category ID or slug is required', 400)
    }

    const id = parseInt(params.idOrSlug)
    if (isNaN(id)) {
      throw new ApiException('VALIDATION.ERROR', 'Invalid category ID', 400)
    }
    
    // TODO: Add admin check here when role system is implemented
    await categoryService.deleteCategory(id)
    return { success: true }
  })(req)
}