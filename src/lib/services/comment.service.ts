import { BaseService } from './base.service'
import { ApiException } from '../types/api'
import { NotificationService } from './notification.service'
import {prisma} from "@/lib/db";
import {Comment} from "@/types";

export class CommentService extends BaseService<Comment> {
  private notificationService: NotificationService

  constructor() {
    super('comment')
    this.notificationService = new NotificationService()
  }

  async getComments(params: {
    page?: number
    limit?: number
    postId: string
    parentId?: string
    authorId?: string
  }) {
    const where: any = {
      postId: params.postId,
      ...(params.parentId !== undefined && { parentId: params.parentId }),
      ...(params.authorId && { authorId: params.authorId }),
    }

    const include = {
      author: {
        select: {
          id: true,
          username: true,
          avatarUrl: true,
        },
      },
      _count: {
        select: {
          childComments: true,
        },
      },
      childComments: params.parentId === null ? {
        include: {
          author: {
            select: {
              id: true,
              username: true,
              avatarUrl: true,
            },
          },
        },
        take: 3, // Preview of replies
      } : undefined,
    }

    return this.findMany({ page: params.page, limit: params.limit }, where, include)
  }

  async getCommentById(id: string) {
    const comment = await this.findOne(
      { id },
      {
        author: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        childComments: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
                avatarUrl: true,
              },
            },
          },
        },
      }
    )

    if (!comment) {
      throw new ApiException('COMMENT.NOT_FOUND', 'Comment not found', 404)
    }

    return comment
  }

  async createComment(data: {
    content: string
    authorId: string
    postId: string
    parentId?: string
  }) {
    const [post, parentComment] = await Promise.all([
      // Get post to notify author
      prisma.post.findUnique({
        where: { id: data.postId },
        select: { authorId: true }
      }),
      // Get parent comment if it's a reply
      data.parentId ? prisma.comment.findUnique({
        where: { id: data.parentId },
        select: { authorId: true }
      }) : null
    ])

    if (data.parentId && !parentComment) {
      throw new ApiException('COMMENT.PARENT_NOT_FOUND', 'Parent comment not found', 404)
    }

    if (!post) {
      throw new ApiException('POST.NOT_FOUND', 'Post not found', 404)
    }

    const comment = await prisma.$transaction(async (tx) => {
      // Create the comment
      const newComment = await this.create({
        content: data.content,
        authorId: data.authorId,
        postId: data.postId,
        ...(data.parentId && {
          parentId: data.parentId
        })
      })

      // Create notification for post author (if not self)
      if (post.authorId !== data.authorId) {
        await this.notificationService.createCommentNotification({
          userId: post.authorId,
          senderId: data.authorId,
          postId: data.postId,
          commentId: newComment.id,
          isReply: false
        })
      }

      // If this is a reply, notify parent comment author
      if (parentComment && parentComment.authorId !== data.authorId) {
        await this.notificationService.createCommentNotification({
          userId: parentComment.authorId,
          senderId: data.authorId,
          postId: data.postId,
          commentId: newComment.id,
          isReply: true
        })
      }

      // Check for mentions in content and create notifications
      const mentions = this.extractMentions(data.content)
      if (mentions.length > 0) {
        const users = await prisma.profile.findMany({
          where: {
            username: {
              in: mentions
            }
          },
          select: {
            id: true,
            username: true
          }
        })

        await Promise.all(
          users.map(user => 
            // Don't notify if mentioned user is the author
            user.id !== data.authorId ?
              this.notificationService.createMentionNotification({
                userId: user.id,
                senderId: data.authorId,
                postId: data.postId,
                commentId: newComment.id
              }) : null
          )
        )
      }

      return newComment
    })

    return comment
  }

  private extractMentions(content: string): string[] {
    const mentionRegex = /@([a-zA-Z0-9_-]+)/g
    const matches = content.match(mentionRegex) || []
    return matches.map(match => match.slice(1)) // Remove @ symbol
  }

  async updateComment(
    id: string,
    userId: string,
    data: {
      content: string
    }
  ) {
    const comment = await this.findOne({ id })

    if (!comment) {
      throw new ApiException('COMMENT.NOT_FOUND', 'Comment not found', 404)
    }

    if (comment.authorId !== userId) {
      throw new ApiException('COMMENT.NOT_AUTHORIZED', 'You cannot edit this comment', 403)
    }

    return this.update(
      { id },
      { content: data.content },
      {
        author: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      }
    )
  }

  async deleteComment(id: string, userId: string) {
    const comment = await this.findOne({ id })

    if (!comment) {
      throw new ApiException('COMMENT.NOT_FOUND', 'Comment not found', 404)
    }

    if (comment.authorId !== userId) {
      throw new ApiException('COMMENT.NOT_AUTHORIZED', 'You cannot delete this comment', 403)
    }

    return this.delete({ id })
  }
}