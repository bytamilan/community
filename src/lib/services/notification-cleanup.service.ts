import { prisma } from '../db'
import { NotificationService } from './notification.service'

export class NotificationCleanupService {
  private notificationService: NotificationService

  constructor() {
    this.notificationService = new NotificationService()
  }

  async cleanupOrphanedNotifications() {
    // Delete notifications for deleted posts
    await prisma.notification.deleteMany({
      where: {
        postId: {
          not: null,
        },
        post: null, // Post doesn't exist anymore
      },
    })

    // Delete notifications for deleted comments
    await prisma.notification.deleteMany({
      where: {
        commentId: {
          not: null,
        },
        comment: null, // Comment doesn't exist anymore
      },
    })

    // Delete notifications for deleted users (sender or recipient)
    await prisma.notification.deleteMany({
      where: {
        OR: [
          {
            userId: {
              not: null,
            },
            profile: null, // Recipient user doesn't exist
          },
          {
            senderId: {
              not: null,
            },
            sender: null, // Sender doesn't exist
          },
        ],
      },
    })
  }

  async cleanupOldNotifications(options: {
    readDaysToKeep?: number
    unreadDaysToKeep?: number
  } = {}) {
    const {
      readDaysToKeep = 30,
      unreadDaysToKeep = 90
    } = options

    const readCutoff = new Date()
    readCutoff.setDate(readCutoff.getDate() - readDaysToKeep)

    const unreadCutoff = new Date()
    unreadCutoff.setDate(unreadCutoff.getDate() - unreadDaysToKeep)

    // Delete old read notifications
    await prisma.notification.deleteMany({
      where: {
        isRead: true,
        createdAt: {
          lt: readCutoff,
        },
      },
    })

    // Delete very old unread notifications
    await prisma.notification.deleteMany({
      where: {
        isRead: false,
        createdAt: {
          lt: unreadCutoff,
        },
      },
    })
  }

  async scheduleCleanup() {
    // Run cleanup every day at midnight
    setInterval(async () => {
      try {
        await this.cleanupOrphanedNotifications()
        await this.cleanupOldNotifications()
      } catch (error) {
        console.error('Error during notification cleanup:', error)
      }
    }, 24 * 60 * 60 * 1000) // 24 hours
  }
}