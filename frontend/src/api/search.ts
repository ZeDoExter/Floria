import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

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

  const response = await axios.get<SearchResponse>(`${API_BASE_URL}/search/products`, {
    params: { q: query },
    withCredentials: true
  });

  return response.data.results;
};
