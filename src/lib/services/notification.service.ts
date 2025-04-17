import { BaseService } from './base.service'
import {Notification} from "@/types";
import {prisma} from "@/lib/db";

export class NotificationService extends BaseService<Notification> {
  constructor() {
    super('notification')
  }

  async getNotifications(params: {
    userId: string
    page?: number
    limit?: number
    isRead?: boolean
  }) {
    const where: any = {
      userId: params.userId,
      ...(params.isRead !== undefined && { isRead: params.isRead }),
    }

    const include = {
      post: {
        select: {
          id: true,
          title: true,
        },
      },
      comment: {
        select: {
          id: true,
          content: true,
        },
      },
    }

    return this.findMany(
      { page: params.page, limit: params.limit },
      where,
      include,
      { createdAt: 'desc' }
    )
  }

  async createNotification(data: {
    userId: string
    senderId?: string
    type: string
    content: string
    postId?: string
    commentId?: string
  }) {
    return this.create(data)
  }

  async createVoteNotification(data: {
    userId: string // recipient
    senderId: string // voter
    postId?: string
    commentId?: string
    voteType: number
  }) {
    const type = data.voteType === 1 ? 'UPVOTE' : 'DOWNVOTE'
    const targetType = data.postId ? 'post' : 'comment'

    // Don't notify users of their own votes
    if (data.userId === data.senderId) {
      return null
    }

    return this.createNotification({
      userId: data.userId,
      senderId: data.senderId,
      type,
      content: `notification.${targetType}.${type.toLowerCase()}`,
      postId: data.postId,
      commentId: data.commentId,
    })
  }

  async createCommentNotification(data: {
    userId: string // recipient (post/parent comment author)
    senderId: string // commenter
    postId: string
    commentId: string
    isReply?: boolean
  }) {
    // Don't notify users of their own comments
    if (data.userId === data.senderId) {
      return null
    }

    return this.createNotification({
      userId: data.userId,
      senderId: data.senderId,
      type: data.isReply ? 'REPLY' : 'COMMENT',
      content: `notification.${data.isReply ? 'reply' : 'comment'}.new`,
      postId: data.postId,
      commentId: data.commentId,
    })
  }

  async createMentionNotification(data: {
    userId: string // mentioned user
    senderId: string // mentioning user
    postId?: string
    commentId?: string
  }) {
    // Don't notify users of their own mentions
    if (data.userId === data.senderId) {
      return null
    }

    const type = 'MENTION'
    const targetType = data.postId ? 'post' : 'comment'

    return this.createNotification({
      userId: data.userId,
      senderId: data.senderId,
      type,
      content: `notification.${targetType}.mention`,
      postId: data.postId,
      commentId: data.commentId,
    })
  }

  async markAsRead(params: {
    userId: string
    notificationId?: string // If not provided, mark all as read
  }) {
    const where: Prisma.NotificationWhereInput = {
      userId: params.userId,
      ...(params.notificationId && { id: params.notificationId }),
    }

    await prisma.notification.updateMany({
      where,
      data: { isRead: true },
    })
  }

  async getUnreadCount(userId: string) {
    return prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    })
  }

  async deleteOldNotifications(daysToKeep: number = 30) {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

    await prisma.notification.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
        isRead: true,
      },
    })
  }
}