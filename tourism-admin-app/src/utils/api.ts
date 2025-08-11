const API_BASE_URL = 'http://localhost:3000/api';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface TouristSpot {
  id: string;
  name: string;
  description: string;
  opening_hour: string;
  closing_hour: string;
  category: string;
  type: string;
  category_id: number;
  type_id: number;
}

export interface Category {
  id: number;
  category: string;
}

export interface Type {
  id: number;
  type: string;
  category_id: number;
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    const response = await fetch(url, { ...defaultOptions, ...options });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  }

  // Tourist Spots
  async getTouristSpots(): Promise<TouristSpot[]> {
    const response = await this.request<TouristSpot[]>('/tourist-spots');
    return response.data;
  }

  async getTouristSpotById(id: string): Promise<TouristSpot> {
    const response = await this.request<TouristSpot>(`/tourist-spots/${id}`);
    return response.data;
  }

  async createTouristSpot(spotData: {
    name: string;
    description: string;
    opening_hour: string;
    closing_hour: string;
    category_id: number;
    type_id: number;
  }): Promise<TouristSpot> {
    const response = await this.request<TouristSpot>('/tourist-spots', {
      method: 'POST',
      body: JSON.stringify(spotData),
    });
    return response.data;
  }

  async updateTouristSpot(
    id: string,
    spotData: Partial<{
      name: string;
      description: string;
      opening_hour: string;
      closing_hour: string;
      category_id: number;
      type_id: number;
    }>
  ): Promise<TouristSpot> {
    const response = await this.request<TouristSpot>(`/tourist-spots/${id}`, {
      method: 'PUT',
      body: JSON.stringify(spotData),
    });
    return response.data;
  }

  async deleteTouristSpot(id: string): Promise<void> {
    await this.request(`/tourist-spots/${id}`, {
      method: 'DELETE',
    });
  }

  // Categories and Types
  async getCategoriesAndTypes(): Promise<{
    categories: Category[];
    types: Type[];
  }> {
    const response = await this.request<{
      categories: Category[];
      types: Type[];
    }>('/tourist-spots/categories-types');
    return response.data;
  }
}

export const apiService = new ApiService();
