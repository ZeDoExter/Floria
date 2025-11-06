import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async searchProducts(query: string) {
    if (!query) {
      return { results: [] };
    }

    const products = await this.prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } }
        ]
      },
      include: { category: true },
      take: 20
    });

    return {
      results: products.map((product) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        basePrice: Number(product.basePrice),
        category: product.category?.name ?? null
      }))
    };
  }

  async reindexProducts() {
    // In production this would enqueue a job to OpenSearch.
    // For local development we simply acknowledge the request.
    return { status: 'scheduled' };
  }
}
