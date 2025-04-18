import { BaseService } from './base.service'
import { ApiException } from '../../types/api'
import {Post} from "@/types";
import {prisma} from "@/lib/db";

export class PostService extends BaseService<Post> {
  constructor() {
    super('post')
  }

  async getPosts(params: {
    page?: number
    limit?: number
    categoryId?: number
    authorId?: string
    isPublished?: boolean
    searchQuery?: string
  }) {
    const where: any = {
      isPublished: params.isPublished ?? true,
      ...(params.categoryId && { categoryId: params.categoryId }),
      ...(params.authorId && { authorId: params.authorId }),
      ...(params.searchQuery && {
        OR: [
          { title: { contains: params.searchQuery, mode: 'insensitive' } },
          { content: { contains: params.searchQuery, mode: 'insensitive' } },
        ],
      }),
    }

    const include = {
      author: {
        select: {
          id: true,
          username: true,
          avatarUrl: true,
        },
      },
      category: true,
      postTags: {
        include: {
          tag: true,
        },
      },
      _count: {
        select: {
          comments: true,
        },
      },
    }

    return this.findMany({ page: params.page, limit: params.limit }, where, include)
  }

  async getPostById(id: string, userId?: string) {
    const post = await this.findOne(
      { id },
      {
        author: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        category: true,
        postTags: {
          include: {
            tag: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
                avatarUrl: true,
              },
            },
            _count: {
              select: {
                childComments: true,
              },
            },
          },
          where: {
            parentId: null,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      }
    )

    if (!post) {
      throw new ApiException('POST.NOT_FOUND', 'Post not found', 404)
    }

    if (!post.isPublished && post.authorId !== userId) {
      throw new ApiException('POST.NOT_AUTHORIZED', 'You cannot view this post', 403)
    }

    return post
  }

  async createPost(data: {
    title: string
    content: string
    authorId: string
    categoryId: number
    tagIds?: number[]
    creditCost?: number
    isPublished?: boolean
  }) {
    const postData: any = {
      title: data.title,
      content: data.content,
      creditCost: data.creditCost,
      isPublished: data.isPublished,
      author: {
        connect: { id: data.authorId },
      },
      category: {
        connect: { id: data.categoryId },
      },
      ...(data.tagIds && {
        postTags: {
          create: data.tagIds.map((tagId) => ({
            tag: {
              connect: { id: tagId },
            },
          })),
        },
      }),
    }

    return this.create(postData, {
      author: {
        select: {
          id: true,
          username: true,
        },
      },
      category: true,
      postTags: {
        include: {
          tag: true,
        },
      },
    })
  }

  async updatePost(
    id: string,
    userId: string,
    data: {
      title?: string
      content?: string
      categoryId?: number
      tagIds?: number[]
      creditCost?: number
      isPublished?: boolean
    }
  ) {
    const post = await this.findOne({ id })

    if (!post) {
      throw new ApiException('POST.NOT_FOUND', 'Post not found', 404)
    }

    if (post.authorId !== userId) {
      throw new ApiException('POST.NOT_AUTHORIZED', 'You cannot edit this post', 403)
    }

    const updateData: any = {
      ...data,
      ...(data.categoryId && {
        category: {
          connect: { id: data.categoryId },
        },
      }),
      ...(data.tagIds && {
        postTags: {
          deleteMany: {},
          create: data.tagIds.map((tagId) => ({
            tag: {
              connect: { id: tagId },
            },
          })),
        },
      }),
    }

    return this.update(
      { id },
      updateData,
      {
        author: {
          select: {
            id: true,
            username: true,
          },
        },
        category: true,
        postTags: {
          include: {
            tag: true,
          },
        },
      }
    )
  }

  async deletePost(id: string, userId: string) {
    const post = await this.findOne({ id })

    if (!post) {
      throw new ApiException('POST.NOT_FOUND', 'Post not found', 404)
    }

    if (post.authorId !== userId) {
      throw new ApiException('POST.NOT_AUTHORIZED', 'You cannot delete this post', 403)
    }

    // Delete in a transaction to ensure all related data is cleaned up
    await prisma.$transaction([
      // Delete all notifications related to this post
      prisma.notification.deleteMany({
        where: { postId: id }
      }),
      // Delete all votes for this post
      prisma.vote.deleteMany({
        where: { postId: id }
      }),
      // Delete all comments (and their votes/notifications)
      prisma.comment.deleteMany({
        where: { postId: id }
      }),
      // Delete the post
      prisma.post.delete({
        where: { id }
      })
    ])

    return { success: true }
  }
}