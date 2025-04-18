import { ApiError } from 'next/dist/server/api-utils'

export type PaginationParams = {
  page?: number
  limit?: number
}

export type PaginatedResponse<T> = {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasMore: boolean
  }
}

export type ApiResponse<T> = {
  success: true
  data: T
  message?: string
} | {
  success: false
  error: {
    code: string
    message: string
    details?: unknown
  }
}

export class ApiException extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number = 500,
    public readonly details?: unknown
  ) {
    super(message)
    this.name = 'ApiException'
  }

  toResponse(): Response {
    return Response.json(
      {
        error: {
          code: this.code,
          message: this.message,
          details: this.details
        }
      },
      { status: this.status }
    )
  }
}