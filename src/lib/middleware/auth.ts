import type { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ApiException } from '../../types/api'

export async function withAuth(
  req: NextRequest,
  handler: (userId: string) => Promise<Response>
) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    throw new ApiException(
      'AUTH.UNAUTHORIZED',
      'You must be logged in to access this resource',
      401
    )
  }

  return handler(user.id)
}

export async function withOptionalAuth(
  req: NextRequest,
  handler: (userId: string | null) => Promise<Response>
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return handler(user?.id || null)
}