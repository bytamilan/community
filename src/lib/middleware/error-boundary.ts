import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createErrorResponse } from '../api-utils'
import { ApiException } from '../types/api'
import i18next from 'i18next'

export async function withErrorBoundary(
  req: NextRequest,
  handler: () => Promise<Response>
) {
  try {
    return await handler()
  } catch (error) {
    console.error('API Error:', error)
    
    if (error instanceof ApiException) {
      return createErrorResponse(error)
    }
    
    // Handle Prisma errors
    if (error?.constructor?.name === 'PrismaClientKnownRequestError') {
      const prismaError = error as any
      
      switch (prismaError.code) {
        case 'P2002':
          return createErrorResponse(
            new ApiException(
              'VALIDATION.UNIQUE_CONSTRAINT',
              i18next.t('errors.api.VALIDATION.UNIQUE_CONSTRAINT'),
              400,
              { fields: prismaError.meta?.target }
            )
          )
        case 'P2025':
          return createErrorResponse(
            new ApiException(
              'NOT_FOUND',
              i18next.t('errors.api.NOT_FOUND'),
              404
            )
          )
        default:
          break
      }
    }
    
    return createErrorResponse(
      new ApiException(
        'INTERNAL_SERVER_ERROR',
        i18next.t('errors.api.INTERNAL_SERVER_ERROR'),
        500
      )
    )
  }
}