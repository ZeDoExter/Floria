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
  imageUrl: string | null;
  categoryId: string;
  ownerId: string;
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
    if (!query || !query.trim()) {
      return { results: [] };
    }

    const searchTerm = query.trim();

    // Use query builder to join with category
    const products = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('Category', 'category', 'category.id = product.categoryId')
      .where('product.name ILIKE :search', { search: `%${searchTerm}%` })
      .orWhere('product.description ILIKE :search', { search: `%${searchTerm}%` })
      .orderBy('product.name', 'ASC')
      .limit(20)
      .getRawMany();

    return {
      results: products.map((row) => ({
        id: row.product_id,
        name: row.product_name,
        description: row.product_description,
        basePrice: Number(row.product_basePrice),
        category: row.category_name ?? null,
        imageUrl: row.product_imageUrl ?? null,
        categoryId: row.product_categoryId,
        ownerId: row.product_ownerId
      }))
    };
  }

  async reindexProducts(): Promise<{ status: string }> {
    // In production this would enqueue a job to OpenSearch.
    // For local development we simply acknowledge the request.
    return { status: 'scheduled' };
  }
}
