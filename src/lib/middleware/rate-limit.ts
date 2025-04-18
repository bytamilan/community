import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { Redis } from '@upstash/redis'
import { ApiException } from '../../types/api'
import i18next from 'i18next'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

const WINDOW_SIZE = 60 * 1000 // 1 minute
const MAX_REQUESTS = 60 // requests per window

export async function withRateLimit(
  req: NextRequest,
  handler: () => Promise<Response>,
  options: {
    windowSize?: number
    maxRequests?: number
  } = {}
) {
  const ip = req.ip || 'anonymous'
  const key = `rate-limit:${ip}:${req.method}:${req.nextUrl.pathname}`
  
  const window = options.windowSize || WINDOW_SIZE
  const maxRequests = options.maxRequests || MAX_REQUESTS
  
  const [requests, ttl] = await Promise.all([
    redis.incr(key),
    redis.ttl(key)
  ])
  
  if (requests === 1) {
    await redis.expire(key, Math.floor(window / 1000))
  }

  // Add rate limit headers to the response
  const originalResponse = requests <= maxRequests
    ? await handler()
    : undefined

  const remaining = Math.max(0, maxRequests - requests)
  const reset = ttl === -1 ? Math.floor(window / 1000) : ttl

  const headers = {
    'X-RateLimit-Limit': maxRequests.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': reset.toString(),
  }

  if (requests > maxRequests) {
    throw new ApiException(
      'RATE_LIMIT.EXCEEDED',
      i18next.t('errors.api.RATE_LIMIT.EXCEEDED', { time: reset }),
      429,
      {
        limit: maxRequests,
        remaining: 0,
        reset,
      }
    )
  }

  const response = originalResponse instanceof Response
    ? originalResponse
    : new NextResponse()

  // Add rate limit headers to the response
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  return response
}

export type RateLimitHeaders = {
  'X-RateLimit-Limit': string
  'X-RateLimit-Remaining': string
  'X-RateLimit-Reset': string
}