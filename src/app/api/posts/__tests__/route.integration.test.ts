import { NextRequest } from 'next/server'
import { GET, POST } from '../route'
import { db } from '@/lib/db'

jest.mock('@/lib/db', () => ({
  db: {
    post: {
      findMany: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
    },
    postTag: {
      createMany: jest.fn()
    },
    $transaction: jest.fn(callback => callback(db))
  }
}))

const createNextRequest = (path: string, options: RequestInit = {}) => {
  const url = new URL(`http://localhost:3000${path}`)
  return new NextRequest(url, options)
}

describe('Posts API Integration', () => {
  const mockDb = db as jest.Mocked<typeof db>
  
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/posts', () => {
    it('should return paginated posts', async () => {
      const mockPosts = [
        { id: '1', title: 'Test Post', content: 'Content', categoryId: 1 },
        { id: '2', title: 'Another Post', content: 'More content', categoryId: 1 }
      ]
      
      mockDb.post.findMany.mockResolvedValue(mockPosts)
      mockDb.post.count.mockResolvedValue(2)
      
      const req = createNextRequest('/api/posts?page=1&limit=10')
      const res = await GET(req)
      const data = await res.json()
      
      expect(res.status).toBe(200)
      expect(data.posts).toEqual(mockPosts)
      expect(data.meta).toEqual({
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
        hasMore: false
      })
    })

    it('should handle default pagination values', async () => {
      mockDb.post.findMany.mockResolvedValue([])
      mockDb.post.count.mockResolvedValue(0)
      
      const req = createNextRequest('/api/posts')
      const res = await GET(req)
      const data = await res.json()
      
      expect(res.status).toBe(200)
      expect(data.meta).toEqual({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
        hasMore: false
      })
    })
  })

  describe('POST /api/posts', () => {
    it('should create a new post with valid data', async () => {
      const postData = {
        title: 'New Post',
        content: 'Post content',
        categoryId: 1,
        tags: [1, 2]
      }
      
      const createdPost = { 
        id: '123', 
        ...postData,
        authorId: 'test-user-id',
        viewCount: 0,
        upvotes: 0,
        downvotes: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      mockDb.post.create.mockResolvedValue(createdPost)
      mockDb.postTag.createMany.mockResolvedValue({ count: 2 })
      
      const req = createNextRequest('/api/posts', {
        method: 'POST',
        body: JSON.stringify(postData)
      })
      
      const res = await POST(req)
      const data = await res.json()
      
      expect(res.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toEqual(createdPost)
      
      expect(mockDb.post.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: postData.title,
          content: postData.content,
          categoryId: postData.categoryId,
          authorId: expect.any(String),
          viewCount: 0,
          upvotes: 0,
          downvotes: 0
        })
      })
      
      expect(mockDb.postTag.createMany).toHaveBeenCalledWith({
        data: postData.tags.map(tagId => ({
          postId: createdPost.id,
          tagId
        }))
      })
    })

    it('should handle validation errors', async () => {
      const invalidData = {
        title: '', // Invalid: empty title
        content: 'Content',
        categoryId: 1
      }
      
      const req = createNextRequest('/api/posts', {
        method: 'POST',
        body: JSON.stringify(invalidData)
      })
      
      const res = await POST(req)
      expect(res.status).toBe(400)
      
      const data = await res.json()
      expect(data.error).toBeDefined()
      expect(data.error.code).toBe('VALIDATION_ERROR')
      expect(mockDb.post.create).not.toHaveBeenCalled()
    })
  })
})