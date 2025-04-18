import { BaseService } from './base.service'
import { ApiException } from '../../types/api'
import {prisma} from "@/lib/db";
import {Category} from "@/types";

export class CategoryService extends BaseService<Category> {
  constructor() {
    super('category')
  }

  async getCategories(params: {
    page?: number
    limit?: number
    searchQuery?: string
  }) {
    const where: any = {
      ...(params.searchQuery && {
        OR: [
          { name: { contains: params.searchQuery, mode: 'insensitive' } },
          { description: { contains: params.searchQuery, mode: 'insensitive' } },
        ],
      }),
    }

    const include = {
      _count: {
        select: {
          posts: true,
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

  async getCategoryById(id: number) {
    const category = await this.findOne(
      { id },
      {
        _count: {
          select: {
            posts: true,
          },
        },
      }
    )

    if (!category) {
      throw new ApiException('CATEGORY.NOT_FOUND', 'Category not found', 404)
    }

    return category
  }

  async getCategoryBySlug(slug: string) {
    const category = await this.findOne(
      { slug },
      {
        _count: {
          select: {
            posts: true,
          },
        },
      }
    )

    if (!category) {
      throw new ApiException('CATEGORY.NOT_FOUND', 'Category not found', 404)
    }

    return category
  }

  async createCategory(data: {
    name: string
    slug: string
    description?: string
    creditRequirement?: number
    isPremium?: boolean
  }) {
    // Check if category with same name or slug exists
    const existing = await prisma.category.findFirst({
      where: {
        OR: [
          { name: data.name },
          { slug: data.slug }
        ]
      }
    })

    if (existing) {
      throw new ApiException(
        'CATEGORY.ALREADY_EXISTS',
        'A category with this name or slug already exists',
        400
      )
    }

    return this.create(data)
  }

  async updateCategory(
    id: number,
    data: {
      name?: string
      slug?: string
      description?: string
      creditRequirement?: number
      isPremium?: boolean
    }
  ) {
    const category = await this.findOne({ id })

    if (!category) {
      throw new ApiException('CATEGORY.NOT_FOUND', 'Category not found', 404)
    }

    // If updating name or slug, check for uniqueness
    if (data.name || data.slug) {
      const existing = await prisma.category.findFirst({
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
          'CATEGORY.ALREADY_EXISTS',
          'A category with this name or slug already exists',
          400
        )
      }
    }

    return this.update({ id }, data)
  }

  async deleteCategory(id: number) {
    const category = await this.findOne({ id })

    if (!category) {
      throw new ApiException('CATEGORY.NOT_FOUND', 'Category not found', 404)
    }

    // Check if category has any posts
    const postCount = await prisma.post.count({
      where: { categoryId: id }
    })

    if (postCount > 0) {
      throw new ApiException(
        'CATEGORY.HAS_POSTS',
        'Cannot delete category with existing posts',
        400
      )
    }

    return this.delete({ id })
  }
}