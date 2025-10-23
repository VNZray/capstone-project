// const API_BASE_URL = 'http://192.168.1.15:3000/api';
const API_BASE_URL = 'http://localhost:3000/api';

import type { ApiResponse, TouristSpot, Province, Municipality, Barangay, Category, Type, TouristSpotSchedule } from '../types';
import type { EntityType } from '../types/approval';

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

  async createTouristSpot(
    spotData: Partial<TouristSpot> & { schedules?: TouristSpotSchedule[] }
  ): Promise<ApiResponse<TouristSpot>> {
    const response = await this.request<TouristSpot>('/tourist-spots', {
      method: 'POST',
      body: JSON.stringify({
        ...spotData,
        spot_status: 'pending',
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

  // Schedules
  async getTouristSpotSchedules(id: string): Promise<TouristSpotSchedule[]> {
    const response = await this.request<TouristSpotSchedule[]>(`/tourist-spots/${id}/schedules`);
    return response.data;
  }

  async saveTouristSpotSchedules(
    id: string,
    schedules: TouristSpotSchedule[]
  ): Promise<ApiResponse<{ updated: boolean }>> {
    const response = await this.request<{ updated: boolean }>(`/tourist-spots/${id}/schedules`, {
      method: 'PUT',
      body: JSON.stringify({ schedules }),
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

  // Events
  async getEventCategoriesAndTypes(): Promise<{
    categories: { id: number; category: string }[];
    types?: { id: number; type: string }[];
  }> {
    // Use the new event categories endpoint
    const response = await this.request<{ id: number; category: string }[]>(`/event/categories`);
    const categories = (response as any).data ?? (response as any);
    return {
      categories: Array.isArray(categories) ? categories : [],
      types: []
    };
  }

  async getEvents(): Promise<any[]> {
    const response = await this.request<any[]>(`/event`);
    return (response as any).data ?? (response as any);
  }

  async getEventById(id: string): Promise<any> {
    const response = await this.request<any>(`/event/${id}`);
    return (response as any).data ?? (response as any);
  }

  async createEvent(payload: any): Promise<ApiResponse<any>> {
    return this.request<any>(`/event`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateEvent(id: string, payload: any): Promise<ApiResponse<any>> {
    return this.request<any>(`/event/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  // Multipart upload support for events (photos/files)
  async createEventWithFiles(formData: FormData): Promise<any> {
    const url = `${API_BASE_URL}/event`;
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      // Let the browser set Content-Type with boundary for FormData
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Upload failed');
    return data.data ?? data;
  }

  async updateEventWithFiles(id: string, formData: FormData): Promise<any> {
    const url = `${API_BASE_URL}/event/${id}`;
    const response = await fetch(url, {
      method: 'PUT',
      body: formData,
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Upload failed');
    return data.data ?? data;
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


  private approvalPathsFor(entity: EntityType) {
    switch (entity) {
      case 'tourist_spots':
        return {
          pendingNew: '/approval/pending-spots',
          pendingEdits: '/approval/pending-edits',
          approveNew: (id: string) => `/approval/approve-spot/${id}`,
          approveEdit: (id: string) => `/approval/approve-edit/${id}`,
          rejectNew: (id: string) => `/approval/reject-spot/${id}`,
          rejectEdit: (id: string) => `/approval/reject-edit/${id}`,
        } as const;
      case 'events':
      case 'businesses':
      case 'accommodations':
      default:
        return {
          pendingNew: `/approval/${entity}/pending`,
          pendingEdits: `/approval/${entity}/pending-edits`,
          approveNew: (id: string) => `/approval/${entity}/approve/${id}`,
          approveEdit: (id: string) => `/approval/${entity}/approve-edit/${id}`,
          rejectNew: (id: string) => `/approval/${entity}/reject/${id}`,
          rejectEdit: (id: string) => `/approval/${entity}/reject-edit/${id}`,
        } as const;
    }
  }

  async getPendingItems(entity: EntityType): Promise<unknown[]> {
    const paths = this.approvalPathsFor(entity);
    const response = await this.request<unknown[]>(paths.pendingNew);
    return (response && (response as ApiResponse<unknown[]>).data) || [];
  }

  async getPendingEditsByEntity(entity: EntityType): Promise<unknown[]> {
    const paths = this.approvalPathsFor(entity);
    const response = await this.request<unknown[]>(paths.pendingEdits);
    return (response && (response as ApiResponse<unknown[]>).data) || [];
  }

  async approveNewEntity(entity: EntityType, id: string): Promise<ApiResponse<void>> {
    const paths = this.approvalPathsFor(entity);
    return this.request<void>(paths.approveNew(id), { method: 'PUT' });
  }

  async approveEditEntity(entity: EntityType, id: string): Promise<ApiResponse<void>> {
    const paths = this.approvalPathsFor(entity);
    return this.request<void>(paths.approveEdit(id), { method: 'PUT' });
  }

  async rejectNewEntity(entity: EntityType, id: string, reason?: string): Promise<ApiResponse<void>> {
    const paths = this.approvalPathsFor(entity);
    return this.request<void>(paths.rejectNew(id), { method: 'PUT', body: JSON.stringify({ reason }) });
  }

  async rejectEditEntity(entity: EntityType, id: string, reason?: string): Promise<ApiResponse<void>> {
    const paths = this.approvalPathsFor(entity);
    return this.request<void>(paths.rejectEdit(id), { method: 'PUT', body: JSON.stringify({ reason }) });
  }
}

export const apiService = new ApiService();
