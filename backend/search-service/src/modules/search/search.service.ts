import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

type DecimalLike = number | string | bigint | { toString(): string };

type ProductWithCategory = {
  id: string;
  name: string;
  description: string | null;
  basePrice: DecimalLike;
  category: { name: string | null } | null;
};

const decimalToNumber = (value: DecimalLike): number => Number.parseFloat(value.toString());

type SearchProductResult = {
  id: string;
  name: string;
  description: string | null;
  basePrice: number;
  category: string | null;
};

type SearchResponse = {
  results: SearchProductResult[];
};

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async searchProducts(query: string): Promise<SearchResponse> {
    if (!query) {
      return { results: [] };
    }

    const products: ProductWithCategory[] = await this.prisma.product.findMany({
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
        basePrice: decimalToNumber(product.basePrice),
        category: product.category?.name ?? null
      }))
    };
  }

  async reindexProducts(): Promise<{ status: string }> {
    // In production this would enqueue a job to OpenSearch.
    // For local development we simply acknowledge the request.
    return { status: 'scheduled' };
  }
}
