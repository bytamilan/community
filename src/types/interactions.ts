import type { Comment as PrismaComment, Vote as PrismaVote, CreditTransaction as PrismaCreditTransaction } from '@/generated/prisma'
import { Profile } from './user'

export type Comment = PrismaComment & {
  author?: Profile
  replies?: Comment[]
}

export type Vote = PrismaVote

export type CreditTransaction = PrismaCreditTransaction