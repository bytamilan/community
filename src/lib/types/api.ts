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
    public code: string,
    message: string,
    public status: number = 400,
    public details?: unknown
  ) {
    super(message)
    this.name = 'ApiException'
  }
}