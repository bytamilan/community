import { NextResponse } from 'next/server'
import { ApiException, ApiResponse, PaginatedResponse, PaginationParams } from '@/types/api'
import i18next from 'i18next'
import axios, { AxiosError, AxiosResponse } from 'axios';
import { toast } from 'sonner';

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

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage or other storage
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    const message = getErrorMessage(error);
    toast.error(message);
    return Promise.reject(error);
  }
);

// Error message handler
const getErrorMessage = (error: AxiosError): string => {
  if (error.response) {
    // Server responded with error
    const status = error.response.status;
    switch (status) {
      case 401:
        return 'Please login to continue';
      case 403:
        return 'You do not have permission to perform this action';
      case 404:
        return 'Resource not found';
      case 422:
        return 'Invalid data provided';
      case 429:
        return 'Too many requests. Please try again later';
      case 500:
        return 'Server error. Please try again later';
      default:
        return 'An error occurred. Please try again';
    }
  } else if (error.request) {
    // Request made but no response
    return 'Unable to connect to server';
  }
  return 'An unexpected error occurred';
};

// API hooks for common operations
export const useApiRequest = <T,>(endpoint: string) => {
  const fetchData = async (): Promise<T> => {
    try {
      const response = await apiClient.get<T>(endpoint);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const postData = async (data: any): Promise<T> => {
    try {
      const response = await apiClient.post<T>(endpoint, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const updateData = async (data: any): Promise<T> => {
    try {
      const response = await apiClient.put<T>(endpoint, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const deleteData = async (): Promise<void> => {
    try {
      await apiClient.delete(endpoint);
    } catch (error) {
      throw error;
    }
  };

  return {
    fetchData,
    postData,
    updateData,
    deleteData,
  };
};