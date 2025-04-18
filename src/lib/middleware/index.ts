import { NextRequest } from 'next/server'
import { ApiException } from '../types/api'
import { withAuth, withOptionalAuth } from './auth'
import { withErrorBoundary } from './error-boundary'
import { withRateLimit } from './rate-limit'
import { composeMiddleware } from './compose'

type ApiHandler = (req: NextRequest) => Promise<Response>
type MiddlewareFunction = (handler: ApiHandler) => ApiHandler

export const withPublicApi = (): MiddlewareFunction => {
  return (handler: ApiHandler) => {
    return async (req: NextRequest) => {
      try {
        return await handler(req)
      } catch (error) {
        if (error instanceof ApiException) {
          return error.toResponse()
        }
        throw error
      }
    }
  }
}

export const withProtectedApi = (roles: string[] = []): MiddlewareFunction => {
  return (handler: ApiHandler) => {
    return async (req: NextRequest) => {
      try {
        // Get auth token from header
        const authHeader = req.headers.get('authorization')
        if (!authHeader) {
          throw new ApiException('UNAUTHORIZED', 'No authorization token provided', 401)
        }

        // Verify token and get user
        const token = authHeader.replace('Bearer ', '')
        // TODO: Implement token verification and user role checking
        // const user = await verifyAuthToken(token)
        
        // Check roles if specified
        if (roles.length > 0) {
          // TODO: Check if user has required roles
          // if (!roles.some(role => user.roles.includes(role))) {
          //   throw new ApiException('FORBIDDEN', 'Insufficient permissions', 403)
          // }
        }

        return await handler(req)
      } catch (error) {
        if (error instanceof ApiException) {
          return error.toResponse()
        }
        throw error
      }
    }
  }
}

export const withCustomRateLimit = (
  windowMs: number,
  maxRequests: number
): MiddlewareFunction => {
  const requests = new Map<string, number[]>()

  return (handler: ApiHandler) => {
    return async (req: NextRequest) => {
      try {
        const ip = req.ip || 'unknown'
        const now = Date.now()
        
        // Get existing requests for this IP
        const requestTimes = requests.get(ip) || []
        
        // Remove requests outside the window
        const windowStart = now - windowMs
        const validRequests = requestTimes.filter(time => time > windowStart)
        
        if (validRequests.length >= maxRequests) {
          throw new ApiException(
            'RATE_LIMIT_EXCEEDED',
            'Too many requests',
            429,
            { retryAfter: Math.ceil((validRequests[0] - windowStart) / 1000) }
          )
        }
        
        // Add current request
        validRequests.push(now)
        requests.set(ip, validRequests)
        
        return await handler(req)
      } catch (error) {
        if (error instanceof ApiException) {
          return error.toResponse()
        }
        throw error
      }
    }
  }
}

export * from './auth'
export * from './error-boundary'
export * from './rate-limit'
export * from './compose'