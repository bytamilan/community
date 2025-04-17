import { z } from 'zod'

export const createVoteSchema = z.object({
  postId: z.string().uuid('VOTE.VALIDATION.INVALID_POST_ID').optional(),
  commentId: z.string().uuid('VOTE.VALIDATION.INVALID_COMMENT_ID').optional(),
  voteType: z.number().int().min(-1).max(1).refine(
    val => val !== 0,
    'VOTE.VALIDATION.INVALID_VOTE_TYPE'
  ),
}).refine(
  data => data.postId || data.commentId,
  'VOTE.VALIDATION.TARGET_REQUIRED'
).refine(
  data => !(data.postId && data.commentId),
  'VOTE.VALIDATION.SINGLE_TARGET_ALLOWED'
)

export const getVoteSchema = z.object({
  postId: z.string().uuid('VOTE.VALIDATION.INVALID_POST_ID').optional(),
  commentId: z.string().uuid('VOTE.VALIDATION.INVALID_COMMENT_ID').optional(),
}).refine(
  data => data.postId || data.commentId,
  'VOTE.VALIDATION.TARGET_REQUIRED'
).refine(
  data => !(data.postId && data.commentId),
  'VOTE.VALIDATION.SINGLE_TARGET_ALLOWED'
)