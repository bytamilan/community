import { NextRequest } from 'next/server'
import { TagService } from '@/lib/services/tag.service'
import { ApiException } from '@/types/api'
import { withPublicApi } from '@/lib/middleware'

const tagService = new TagService()

export async function GET(
  req: NextRequest,
  { params }: { params: { idOrSlug: string } }
) {
  return withPublicApi(async () => {
    if (!params.idOrSlug) {
      throw new ApiException('VALIDATION.ERROR', 'Tag ID or slug is required', 400)
    }

    const id = parseInt(params.idOrSlug)
    if (isNaN(id)) {
      throw new ApiException('VALIDATION.ERROR', 'Invalid tag ID', 400)
    }
    
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '5')
    
    const relatedTags = await tagService.getRelatedTags(id, limit)
    return relatedTags
  })(req)
}