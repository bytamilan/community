import { NextRequest } from 'next/server'
import { TagService } from '@/lib/services/tag.service'
import { updateTagSchema } from '@/lib/validation/tag.schema'
import { ApiException } from '@/lib/types/api'
import { withProtectedApi, withPublicApi } from '@/lib/middleware'

const tagService = new TagService()

export async function GET(
  req: NextRequest,
  { params }: { params: { idOrSlug: string } }
) {
  return withPublicApi(async () => {
    if (!params.idOrSlug) {
      throw new ApiException('VALIDATION.ERROR', 'Tag ID or slug is required', 400)
    }
    
    // Try to parse as ID first, if not, treat as slug
    const id = parseInt(params.idOrSlug)
    const tag = !isNaN(id)
      ? await tagService.getTagById(id)
      : await tagService.getTagBySlug(params.idOrSlug)
    
    return tag
  })(req)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { idOrSlug: string } }
) {
  return withProtectedApi(async (userId) => {
    if (!params.idOrSlug) {
      throw new ApiException('VALIDATION.ERROR', 'Tag ID or slug is required', 400)
    }

    const id = parseInt(params.idOrSlug)
    if (isNaN(id)) {
      throw new ApiException('VALIDATION.ERROR', 'Invalid tag ID', 400)
    }

    const data = await req.json()
    const validatedData = updateTagSchema.safeParse(data)
    
    if (!validatedData.success) {
      throw new ApiException(
        'VALIDATION.ERROR',
        'Invalid update data',
        400,
        validatedData.error.issues
      )
    }
    
    // TODO: Add admin check here when role system is implemented
    const tag = await tagService.updateTag(id, validatedData.data)
    return tag
  })(req)
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { idOrSlug: string } }
) {
  return withProtectedApi(async (userId) => {
    if (!params.idOrSlug) {
      throw new ApiException('VALIDATION.ERROR', 'Tag ID or slug is required', 400)
    }

    const id = parseInt(params.idOrSlug)
    if (isNaN(id)) {
      throw new ApiException('VALIDATION.ERROR', 'Invalid tag ID', 400)
    }
    
    // TODO: Add admin check here when role system is implemented
    await tagService.deleteTag(id)
    return { success: true }
  })(req)
}