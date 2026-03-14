import { DefaultService } from './index';

export interface SearchProductResult {
  id: string;
  name: string;
  description: string | null;
  basePrice: number;
  category: string | null;
  imageUrl?: string | null;
  categoryId?: string;
  ownerId?: string;
}

export interface SearchResponse {
  results: SearchProductResult[];
}

export const searchProducts = async (query: string): Promise<SearchProductResult[]> => {
  if (!query.trim()) {
    return [];
  }

  const response = await DefaultService.searchControllerSearchProducts(query);
  return response.data.results;
};
