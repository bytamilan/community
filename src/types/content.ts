import type { Category as PrismaCategory, Tag as PrismaTag, Post as PrismaPost } from '@/generated/prisma'
import { Profile } from './user'

export type Category = PrismaCategory & {
  isPremium: boolean // map from is_premium
  creditRequirement: number | null // map from credit_requirement
}

export type Tag = PrismaTag

export type Post = PrismaPost & {
  author?: Profile
  category?: Category
  tags?: Tag[]
  commentCount?: number
}