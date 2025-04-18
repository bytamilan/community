import { GET, POST } from '../route'
import { NextRequest } from 'next/server'

describe('Posts API', () => {
  describe('GET /api/posts', () => {
    it('should return list of posts', async () => {
      const req = new NextRequest(new URL('http://localhost:3000/api/posts'))
      const res = await GET(req)
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data).toHaveProperty('posts')
      expect(Array.isArray(data.posts)).toBe(true)
    })
  })

  describe('POST /api/posts', () => {
    it('should create a new post with valid data', async () => {
      const postData = {
        title: 'Test Post',
        content: 'Test Content'
      }

      const req = new NextRequest('http://localhost:3000/api/posts', {
        method: 'POST',
        body: JSON.stringify(postData)
      })

      const res = await POST(req)
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data).toHaveProperty('success', true)
      expect(data.data).toMatchObject(postData)
    })

    it('should reject invalid post data', async () => {
      const invalidData = {
        title: '', // Empty title should fail validation
        content: 'Test Content'
      }

      const req = new NextRequest('http://localhost:3000/api/posts', {
        method: 'POST',
        body: JSON.stringify(invalidData)
      })

      const res = await POST(req)
      expect(res.status).toBe(400)
    })
  })
})