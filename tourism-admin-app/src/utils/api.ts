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
  province_id: number;
  municipality_id: number;
  barangay_id: number;
  latitude: number | null;
  longitude: number | null;
  contact_phone: string;
  contact_email: string | null;
  website: string | null;
  entry_fee: number | null;
  spot_status: 'pending' | 'active' | 'inactive';
  is_featured: boolean;
  category: string; // Name of the category
  type: string;     // Name of the type
  category_id: number; // Foreign key
  type_id: number;     // Foreign key
  created_at: string;
  updated_at: string;
  province: string; // Name of the province
  municipality: string; // Name of the municipality
  barangay: string; // Name of the barangay
}

export interface Province {
  id: number;
  province: string;
}

export interface Municipality {
  id: number;
  municipality: string;
  province_id: number;
}

export interface Barangay {
  id: number;
  barangay: string;
  municipality_id: number;
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

  async createTouristSpot(spotData: Partial<TouristSpot>): Promise<ApiResponse<TouristSpot>> {
    const response = await this.request<TouristSpot>('/tourist-spots', {
      method: 'POST',
      body: JSON.stringify({
        ...spotData,
        spot_status: 'pending'
      }),
    });
    return response;
  }

  async updateTouristSpot(id: string, spotData: Partial<TouristSpot>): Promise<ApiResponse<TouristSpot>> {
    const response = await this.request<TouristSpot>(`/tourist-spots/${id}`, {
      method: 'PUT',
      body: JSON.stringify(spotData),
    });
    return response;
  }

  // Submit edit request for tourist spot
  async submitEditRequest(id: string, spotData: Partial<TouristSpot>): Promise<ApiResponse<TouristSpot>> {
    const response = await this.request<TouristSpot>(`/tourist-spots/${id}`, {
      method: 'PUT',
      body: JSON.stringify(spotData),
    });
    return response;
  }

  // Approval system methods
  async getApprovalStats(): Promise<{
    pendingSpots: number;
    pendingBusinesses: number;
    pendingEvents: number;
    pendingAccommodations: number;
    pendingEdits: number;
    approvedEdits: number;
    rejectedEdits: number;
  }> {
    const response = await this.request<{
      pendingSpots: number;
      pendingBusinesses: number;
      pendingEvents: number;
      pendingAccommodations: number;
      pendingEdits: number;
      approvedEdits: number;
      rejectedEdits: number;
    }>('/approval/stats');
    return response.data;
  }

  // Generic approval methods for all content types
  async getPendingItemsByType(contentType: string): Promise<any[]> {
    const response = await this.request<any[]>(`/approval/pending/${contentType}`);
    return response.data;
  }

  async approveItemByType(contentType: string, id: string): Promise<ApiResponse<void>> {
    const response = await this.request<void>(`/approval/approve/${contentType}/${id}`, {
      method: 'PUT',
    });
    return response;
  }

  // Backward compatibility methods (existing functionality)
  async getPendingTouristSpots(): Promise<TouristSpot[]> {
    const response = await this.request<TouristSpot[]>('/approval/pending-spots');
    return response.data;
  }

  async getPendingEditRequests(): Promise<any[]> {
    const response = await this.request<any[]>('/approval/pending-edits');
    return response.data;
  }

  async approveTouristSpot(id: string): Promise<ApiResponse<void>> {
    const response = await this.request<void>(`/approval/approve-spot/${id}`, {
      method: 'PUT',
    });
    return response;
  }

  async approveEditRequest(id: string): Promise<ApiResponse<void>> {
    const response = await this.request<void>(`/approval/approve-edit/${id}`, {
      method: 'PUT',
    });
    return response;
  }

  async rejectEditRequest(id: string, reason?: string): Promise<ApiResponse<void>> {
    const response = await this.request<void>(`/approval/reject-edit/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    });
    return response;
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

  // Location Data
  async getLocationData(): Promise<{
    provinces: Province[];
    municipalities: Municipality[];
    barangays: Barangay[];
  }> {
    const response = await this.request<{
      provinces: Province[];
      municipalities: Municipality[];
      barangays: Barangay[];
    }>('/tourist-spots/location-data');
    return response.data;
  }

  async getMunicipalitiesByProvince(province_id: number): Promise<Municipality[]> {
    const response = await this.request<Municipality[]>(`/tourist-spots/municipalities/${province_id}`);
    return response.data;
  }

  async getBarangaysByMunicipality(municipality_id: number): Promise<Barangay[]> {
    const response = await this.request<Barangay[]>(`/tourist-spots/barangays/${municipality_id}`);
    return response.data;
  }
}

export const apiService = new ApiService();
