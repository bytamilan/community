import { NextResponse } from 'next/server'
import { ApiException, ApiResponse, PaginatedResponse, PaginationParams } from './types/api'
import i18next from 'i18next'

export function createSuccessResponse<T>(data: T, message?: string): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    message
  })
}

export function createErrorResponse(error: ApiException): NextResponse<ApiResponse<never>> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: error.code,
        message: i18next.exists(`errors.api.${error.code}`) 
          ? i18next.t(`errors.api.${error.code}`)
          : error.message,
        details: error.details
      }
    },
    { status: error.status }
  )
}

export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  { page = 1, limit = 10 }: Required<PaginationParams>
): PaginatedResponse<T> {
  const totalPages = Math.ceil(total / limit)
  
  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages,
      hasMore: page < totalPages
    }
  }
}

export async function handleApiRoute<T>(handler: () => Promise<T>): Promise<NextResponse> {
  try {
    const data = await handler()
    return createSuccessResponse(data)
  } catch (error) {
    console.error('API Error:', error)
    
    if (error instanceof ApiException) {
      return createErrorResponse(error)
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

export function validateRequestMethod(request: Request, allowedMethods: string[]) {
  if (!allowedMethods.includes(request.method)) {
    throw new ApiException(
      'METHOD_NOT_ALLOWED',
      `Method ${request.method} not allowed`,
      405
    )
  }
}

export function getPaginationParams(searchParams: URLSearchParams) {
  const page = parseInt(searchParams.get('page') || '1')
  const limit = Math.min(
    parseInt(searchParams.get('limit') || '10'),
    100 // Maximum limit
  )
  
  return {
    page: isNaN(page) ? 1 : Math.max(1, page),
    limit: isNaN(limit) ? 10 : Math.max(1, limit)
  }
}