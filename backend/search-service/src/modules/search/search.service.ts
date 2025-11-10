import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Product } from '../../entities/product.entity.js';
import { Category } from '../../entities/category.entity.js';

type ProductWithCategory = {
  id: string;
  name: string;
  description: string | null;
  basePrice: number;
  category: { name: string | null } | null;
};

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
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>
  ) {}

  async searchProducts(query: string): Promise<SearchResponse> {
    if (!query) {
      return { results: [] };
    }

    const products = await this.productRepository.find({
      where: [
        { name: ILike(`%${query}%`) },
        { description: ILike(`%${query}%`) }
      ],
      relations: ['category'],
      take: 20
    });

    return {
      results: products.map((product) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        basePrice: Number(product.basePrice),
        category: product.categoryId ?? null
      }))
    };
  }

  async reindexProducts(): Promise<{ status: string }> {
    // In production this would enqueue a job to OpenSearch.
    // For local development we simply acknowledge the request.
    return { status: 'scheduled' };
  }
}
