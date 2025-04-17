import type { Notification as PrismaNotification } from '@/generated/prisma'
import { Profile } from './user'

// Keep the NotificationType enum for type safety in the application
export type NotificationType = "comment" | "reply" | "mention" | "vote" | "credit" | "system"

export type Notification = PrismaNotification & {
  sender?: Profile
}