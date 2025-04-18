import { NextRequest, NextResponse } from 'next/server'
import { CategoryService } from '@/lib/services/category.service'
import { updateCategorySchema } from '@/lib/validation/category.schema'
import { ApiException } from '@/lib/types/api'
import { withProtectedApi, withPublicApi } from '@/lib/middleware'

const categoryService = new CategoryService()

export async function GET(
    req: NextRequest,
    { params }: { params: { idOrSlug: string } }
) {
  return withPublicApi(async (_userId: string | null) => {
    const { idOrSlug } = params
    if (!idOrSlug) {
      throw new ApiException(
          'VALIDATION.ERROR',
          'Category ID or slug is required',
          400
      )
    }

    const id = Number(idOrSlug)
    const category = !Number.isNaN(id)
        ? await categoryService.getCategoryById(id)
        : await categoryService.getCategoryBySlug(idOrSlug)

    return NextResponse.json({ data: category }, { status: 200 })
  })(req)
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: { idOrSlug: string } }
) {
  return withProtectedApi(async (userId: string) => {
    const { idOrSlug } = params
    if (!idOrSlug) {
      throw new ApiException(
          'VALIDATION.ERROR',
          'Category ID or slug is required',
          400
      )
    }

    const id = Number(idOrSlug)
    if (Number.isNaN(id)) {
      throw new ApiException(
          'VALIDATION.ERROR',
          'Invalid category ID',
          400
      )
    }

    const body = await req.json()
    const validated = updateCategorySchema.safeParse(body)
    if (!validated.success) {
      throw new ApiException(
          'VALIDATION.ERROR',
          'Invalid update data',
          400,
          validated.error.issues
      )
    }

    // TODO: verify userId has admin privileges
    const updated = await categoryService.updateCategory(
        id,
        validated.data
    )

    return NextResponse.json({ data: updated }, { status: 200 })
  })(req)
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: { idOrSlug: string } }
) {
  return withProtectedApi(async (userId: string) => {
    const { idOrSlug } = params
    if (!idOrSlug) {
      throw new ApiException(
          'VALIDATION.ERROR',
          'Category ID or slug is required',
          400
      )
    }

    const id = Number(idOrSlug)
    if (Number.isNaN(id)) {
      throw new ApiException(
          'VALIDATION.ERROR',
          'Invalid category ID',
          400
      )
    }

    // TODO: verify userId has admin privileges
    await categoryService.deleteCategory(id)

    return NextResponse.json({ success: true }, { status: 200 })
  })(req)
}
