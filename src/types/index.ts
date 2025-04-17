// Re-export base Prisma types
import type {
  Category as PrismaCategory,
  Post as PrismaPost,
  Comment as PrismaComment,
  Vote as PrismaVote,
  CreditTransaction as PrismaCreditTransaction,
  Profile as PrismaProfile,
  Tag as PrismaTag,
  Notification as PrismaNotification,
} from '@/generated/prisma'

export {
  PrismaCategory,
  PrismaPost,
  PrismaComment,
  PrismaVote,
  PrismaCreditTransaction,
  PrismaProfile,
  PrismaTag,
  PrismaNotification,
}

// Export our extended types
export * from './user'
export * from './content'
export * from './interactions'
export * from './notifications'