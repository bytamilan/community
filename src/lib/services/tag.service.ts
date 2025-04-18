import { BaseService } from './base.service'
import { ApiException } from '@/types/api'
import {Tag} from "@/types";
import {prisma} from "@/lib/db";
import { PostTag } from '@prisma/client';

export class TagService extends BaseService<Tag> {
  constructor() {
    super('tag')
  }

  async getTags(params: {
    page?: number
    limit?: number
    searchQuery?: string
  }) {
    const where: any = {
      ...(params.searchQuery && {
        OR: [
          { name: { contains: params.searchQuery, mode: 'insensitive' } },
          { slug: { contains: params.searchQuery, mode: 'insensitive' } },
        ],
      }),
    }

    const include = {
      _count: {
        select: {
          postTags: true,
        },
      },
    }

    return this.findMany(
      { page: params.page, limit: params.limit },
      where,
      include,
      { name: 'asc' }
    )
  }

  async getTagById(id: number) {
    const tag = await this.findOne(
      { id },
      {
        _count: {
          select: {
            postTags: true,
          },
        },
      }
    )

    if (!tag) {
      throw new ApiException('TAG.NOT_FOUND', 'Tag not found', 404)
    }

    return tag
  }

  async getTagBySlug(slug: string) {
    const tag = await this.findOne(
      { slug },
      {
        _count: {
          select: {
            postTags: true,
          },
        },
      }
    )

    if (!tag) {
      throw new ApiException('TAG.NOT_FOUND', 'Tag not found', 404)
    }

    return tag
  }

  async createTag(data: {
    name: string
    slug: string
  }) {
    // Check if tag with same name or slug exists
    const existing = await prisma.tag.findFirst({
      where: {
        OR: [
          { name: data.name },
          { slug: data.slug }
        ]
      }
    })

    if (existing) {
      throw new ApiException(
        'TAG.ALREADY_EXISTS',
        'A tag with this name or slug already exists',
        400
      )
    }

    return this.create(data)
  }

  async updateTag(
    id: number,
    data: {
      name?: string
      slug?: string
    }
  ) {
    const tag = await this.findOne({ id })

    if (!tag) {
      throw new ApiException('TAG.NOT_FOUND', 'Tag not found', 404)
    }

    // If updating name or slug, check for uniqueness
    if (data.name || data.slug) {
      const existing = await prisma.tag.findFirst({
        where: {
          OR: [
            data.name ? { name: data.name } : undefined,
            data.slug ? { slug: data.slug } : undefined
          ].filter(Boolean),
          NOT: { id }
        }
      })

      if (existing) {
        throw new ApiException(
          'TAG.ALREADY_EXISTS',
          'A tag with this name or slug already exists',
          400
        )
      }
    }

    return this.update({ id }, data)
  }

  async deleteTag(id: number) {
    const tag = await this.findOne({ id })

    if (!tag) {
      throw new ApiException('TAG.NOT_FOUND', 'Tag not found', 404)
    }

    // Check if tag is used in any posts
    const postCount = await prisma.postTag.count({
      where: { tagId: id }
    })

    if (postCount > 0) {
      throw new ApiException(
        'TAG.HAS_POSTS',
        'Cannot delete tag that is used in posts',
        400
      )
    }

    return this.delete({ id })
  }

  async getRelatedTags(tagId: number, limit: number = 5) {
    const tag = await this.findOne({ id: tagId })

    if (!tag) {
      throw new ApiException('TAG.NOT_FOUND', 'Tag not found', 404)
    }

    // Find posts with this tag
    const postIds = await prisma.postTag
      .findMany({
        where: { tagId },
        select: {
          postId: true
        }
      })
      .then((posts:PostTag[]) => posts.map((p:PostTag) => p.postId))

    // Find other tags used in these posts
    const relatedTags = await prisma.tag.findMany({
      where: {
        postTags: {
          some: {
            postId: { in: postIds },
            NOT: { tagId }
          }
        }
      },
      include: {
        _count: {
          select: {
            postTags: true
          }
        }
      },
      orderBy: {
        postTags: {
          _count: 'desc'
        }
      },
      take: limit
    })

    return relatedTags
  }
}