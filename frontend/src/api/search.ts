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
  const data = (response as any)?.data ?? response;
  if (Array.isArray(data?.results)) return data.results as SearchProductResult[];
  if (Array.isArray(data)) return data as SearchProductResult[];
  return [];
};
