import { NextRequest } from 'next/server'
import { createApiHandler, validateRequest } from '../api-route'
import { ApiException } from '../../types/api'
import { z } from 'zod'

const createNextRequest = (path: string, options: RequestInit = {}) => {
  const url = new URL(`http://localhost:3000${path}`)
  return new NextRequest(url, options)
}

describe('API Route Handler', () => {
  const mockHandler = jest.fn().mockImplementation(async () => {
    return Response.json({ success: true })
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Route Configuration', () => {
    it('should handle public routes correctly', async () => {
      const handler = createApiHandler(mockHandler)
      const req = createNextRequest('/api/posts')
      
      await handler(req)
      expect(mockHandler).toHaveBeenCalledWith(expect.any(NextRequest))
    })

    it('should handle protected routes correctly', async () => {
      const handler = createApiHandler(mockHandler)
      const req = createNextRequest('/api/posts', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer test-token'
        }
      })
      
      await handler(req)
      expect(mockHandler).toHaveBeenCalledWith(expect.any(NextRequest))
    })

    it('should handle route parameters correctly', async () => {
      const handler = createApiHandler(mockHandler)
      const req = createNextRequest('/api/posts/123')
      
      await handler(req)
      expect(mockHandler).toHaveBeenCalledWith(expect.any(NextRequest))
    })

    it('should throw NOT_FOUND for invalid routes', async () => {
      const handler = createApiHandler(mockHandler)
      const req = createNextRequest('/api/invalid')
      
      await expect(handler(req)).rejects.toThrow(ApiException)
    })
  })

  describe('Request Validation', () => {
    const schema = z.object({
      title: z.string().min(1),
      content: z.string().min(1)
    })

    it('should validate POST request data', async () => {
      const validData = { title: 'Test', content: 'Content' }
      const req = createNextRequest('/api/posts', {
        method: 'POST',
        body: JSON.stringify(validData)
      })

      const data = await validateRequest(req, schema)
      expect(data).toEqual(validData)
    })

    it('should validate GET request query params', async () => {
      const req = createNextRequest('/api/posts?title=Test&content=Content')
      const data = await validateRequest(req, schema)
      expect(data).toEqual({ title: 'Test', content: 'Content' })
    })

    it('should throw validation error for invalid data', async () => {
      const invalidData = { title: '', content: '' }
      const req = createNextRequest('/api/posts', {
        method: 'POST',
        body: JSON.stringify(invalidData)
      })

      await expect(validateRequest(req, schema)).rejects.toThrow(ApiException)
    })
  })

  describe('Error Handling', () => {
    it('should handle API exceptions properly', async () => {
      const errorHandler = jest.fn().mockImplementation(() => {
        throw new ApiException('TEST_ERROR', 'Test error', 400)
      })
      
      const handler = createApiHandler(errorHandler)
      const req = createNextRequest('/api/posts')
      
      await expect(handler(req)).rejects.toThrow(ApiException)
    })

    it('should wrap unknown errors as internal errors', async () => {
      const errorHandler = jest.fn().mockImplementation(() => {
        throw new Error('Unknown error')
      })
      
      const handler = createApiHandler(errorHandler)
      const req = createNextRequest('/api/posts')
      
      try {
        await handler(req)
        fail('Expected an error to be thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(ApiException)
        expect(error.code).toBe('INTERNAL_ERROR')
      }
    })
  })
})