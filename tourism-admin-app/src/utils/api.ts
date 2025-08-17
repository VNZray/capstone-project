const API_BASE_URL = 'http://localhost:3000/api';

import type { ApiResponse, TouristSpot, Province, Municipality, Barangay, Category, Type } from '../types';

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

  // Approval system methods - tourist spots only
  async getPendingTouristSpots(): Promise<TouristSpot[]> {
    const response = await this.request<TouristSpot[]>('/approval/pending-spots');
    return response.data;
  }

  async getPendingEditRequests(): Promise<unknown[]> {
    const response = await this.request<unknown[]>('/approval/pending-edits');
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

  async rejectTouristSpot(id: string, reason?: string): Promise<ApiResponse<void>> {
    const response = await this.request<void>(`/approval/reject-spot/${id}`, {
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
