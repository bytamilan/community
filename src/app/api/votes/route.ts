import { NextRequest } from 'next/server'
import { VoteService } from '@/lib/services/vote.service'
import { createVoteSchema, getVoteSchema } from '@/lib/validation/vote.schema'
import { ApiException } from '@/types/api'
import { withProtectedApi, withCustomRateLimit } from '@/lib/middleware'

const voteService = new VoteService()

// Custom rate limit for voting to prevent spam
const withVoteRateLimit = withCustomRateLimit({
  windowSize: 60 * 1000, // 1 minute
  maxRequests: 30 // 30 votes per minute max
})

export async function GET(req: NextRequest) {
  return withProtectedApi(async (userId) => {
    const { searchParams } = new URL(req.url)
    const queryParams = {
      postId: searchParams.get('postId') || undefined,
      commentId: searchParams.get('commentId') || undefined,
    }
    
    const validatedQuery = getVoteSchema.safeParse(queryParams)
    
    if (!validatedQuery.success) {
      throw new ApiException(
        'VALIDATION.ERROR',
        'Invalid query parameters',
        400,
        validatedQuery.error.issues
      )
    }
    
    const vote = await voteService.getVote({
      userId,
      ...validatedQuery.data
    })
    
    return vote
  })(req)
}

export async function POST(req: NextRequest) {
  return withVoteRateLimit(async () => {
    return withProtectedApi(async (userId) => {
      const data = await req.json()
      
      const validatedData = createVoteSchema.safeParse(data)
      
      if (!validatedData.success) {
        throw new ApiException(
          'VALIDATION.ERROR',
          'Invalid vote data',
          400,
          validatedData.error.issues
        )
      }
      
      const vote = await voteService.createOrUpdateVote({
        userId,
        ...validatedData.data
      })
      
      return vote
    })(req)
  })(req)
}