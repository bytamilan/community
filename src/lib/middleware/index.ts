import { NextRequest } from 'next/server'
import { withAuth, withOptionalAuth } from './auth'
import { withErrorBoundary } from './error-boundary'
import { withRateLimit } from './rate-limit'
import { composeMiddleware } from './compose'

export const withProtectedApi = (handler: () => Promise<Response>) =>
  composeMiddleware(
    withErrorBoundary,
    withRateLimit,
    withAuth
  )

export const withPublicApi = (handler: () => Promise<Response>) =>
  composeMiddleware(
    withErrorBoundary,
    withRateLimit,
    withOptionalAuth
  )

// Export custom rate limits for specific routes
export const withCustomRateLimit = (options: {
  windowSize?: number
  maxRequests?: number
}) => (handler: () => Promise<Response>) =>
  composeMiddleware(
    withErrorBoundary,
    (req, next) => withRateLimit(req, next, options)
  )

export * from './auth'
export * from './error-boundary'
export * from './rate-limit'
export * from './compose'