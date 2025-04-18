import { PaginationParams } from '@/types/api'
import { prisma } from '@/lib/db'
import { Prisma } from '@prisma/client'

export class BaseService<T> {
  constructor(protected model: Prisma.ModelName) {}

  protected async findMany(
    params: PaginationParams,
    where: any = {},
    include: any = {},
    orderBy: any = { createdAt: 'desc' }
  ) {
    const page = params.page || 1
    const limit = params.limit || 10
    const skip = (page - 1) * limit

    const [total, items] = await Promise.all([
      prisma[this.model].count({ where }),
      prisma[this.model].findMany({
        where,
        include,
        orderBy,
        skip,
        take: limit,
      })
    ])

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasMore: page < Math.ceil(total / limit)
    }
  }

  protected async findOne(where: any, include: any = {}) {
    return prisma[this.model].findUnique({
      where,
      include
    })
  }

  protected async create(data: any, include: any = {}) {
    return prisma[this.model].create({
      data,
      include
    })
  }

  protected async update(where: any, data: any, include: any = {}) {
    return prisma[this.model].update({
      where,
      data,
      include
    })
  }

  protected async delete(where: any) {
    return prisma[this.model].delete({
      where
    })
  }
}