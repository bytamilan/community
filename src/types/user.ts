import type { Profile as PrismaProfile, Permission as PrismaPermission } from '@/generated/prisma'

export type Profile = PrismaProfile & {
  avatarUrl: string | null // map from avatar_url
  fullName: string | null // map from full_name
  permissions?: PrismaPermission[]
}

// No need for Role type as it's handled by Permissions in Prisma schema