import { BaseService } from './base.service'
import { ApiException } from '../types/api'
import { NotificationService } from './notification.service'
import {Vote} from "@/types";
import {prisma} from "@/lib/db";

export class VoteService extends BaseService<Vote> {
  private notificationService: NotificationService

  constructor() {
    super('vote')
    this.notificationService = new NotificationService()
  }

  async getVote(params: {
    userId: string
    postId?: string
    commentId?: string
  }) {
    if (!params.postId && !params.commentId) {
      throw new ApiException('VALIDATION.ERROR', 'Either postId or commentId is required', 400)
    }

    return this.findOne({
      userId: params.userId,
      ...(params.postId && { postId: params.postId }),
      ...(params.commentId && { commentId: params.commentId }),
    })
  }

  async createOrUpdateVote(data: {
    userId: string
    postId?: string
    commentId?: string
    voteType: number // 1 for upvote, -1 for downvote
  }) {
    if (!data.postId && !data.commentId) {
      throw new ApiException('VALIDATION.ERROR', 'Either postId or commentId is required', 400)
    }

    if (data.voteType !== 1 && data.voteType !== -1) {
      throw new ApiException('VALIDATION.ERROR', 'Invalid vote type', 400)
    }

    let targetUserId: string | undefined

    // Get target user ID (post author or comment author)
    if (data.postId) {
      const post = await prisma.post.findUnique({
        where: { id: data.postId },
        select: { authorId: true }
      })
      targetUserId = post?.authorId
    } else if (data.commentId) {
      const comment = await prisma.comment.findUnique({
        where: { id: data.commentId },
        select: { authorId: true }
      })
      targetUserId = comment?.authorId
    }

    const result = await prisma.$transaction(async (tx) => {
      const existingVote = await this.getVote({
        userId: data.userId,
        postId: data.postId,
        commentId: data.commentId,
      })

      let vote: Vote | null = null

      if (existingVote) {
        if (existingVote.voteType === data.voteType) {
          // Remove vote if same type (toggle off)
          await this.delete({
            userId: data.userId,
            ...(data.postId && { postId: data.postId }),
            ...(data.commentId && { commentId: data.commentId }),
          })
        } else {
          // Update vote if different type
          vote = await this.update(
            {
              userId: data.userId,
              ...(data.postId && { postId: data.postId }),
              ...(data.commentId && { commentId: data.commentId }),
            },
            { voteType: data.voteType }
          )

          // Create notification for vote change
          if (targetUserId) {
            await this.notificationService.createVoteNotification({
              userId: targetUserId,
              senderId: data.userId,
              postId: data.postId,
              commentId: data.commentId,
              voteType: data.voteType
            })
          }
        }
      } else {
        // Create new vote
        vote = await this.create({
          userId: data.userId,
          ...(data.postId && { postId: data.postId }),
          ...(data.commentId && { commentId: data.commentId }),
          voteType: data.voteType,
        })

        // Create notification for new vote
        if (targetUserId) {
          await this.notificationService.createVoteNotification({
            userId: targetUserId,
            senderId: data.userId,
            postId: data.postId,
            commentId: data.commentId,
            voteType: data.voteType
          })
        }
      }

      // Update vote counts
      if (data.postId) {
        await this.updatePostVoteCounts(data.postId)
      } else if (data.commentId) {
        await this.updateCommentVoteCounts(data.commentId)
      }

      return vote
    })

    return result
  }

  private async updatePostVoteCounts(postId: string) {
    const votes = await prisma.vote.groupBy({
      by: ['voteType'],
      where: { postId },
      _count: true,
    })

    const upvotes = votes.find((v:Vote) => v.voteType === 1)?._count || 0
    const downvotes = votes.find((v:Vote) => v.voteType === -1)?._count || 0

    await prisma.post.update({
      where: { id: postId },
      data: {
        upvotes,
        downvotes,
      },
    })
  }

  private async updateCommentVoteCounts(commentId: string) {
    const votes = await prisma.vote.groupBy({
      by: ['voteType'],
      where: { commentId },
      _count: true,
    })

    const upvotes = votes.find((v:Vote) => v.voteType === 1)?._count || 0
    const downvotes = votes.find((v:Vote) => v.voteType === -1)?._count || 0

    await prisma.comment.update({
      where: { id: commentId },
      data: {
        upvotes,
        downvotes,
      },
    })
  }
}