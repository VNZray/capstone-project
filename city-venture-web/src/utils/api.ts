// const API_BASE_URL = 'http://192.168.1.15:3000/api';
const API_BASE_URL = 'http://localhost:3000/api';

import axios, { type AxiosResponse } from 'axios';
import type { ApiResponse, TouristSpot, Province, Municipality, Barangay, Category, Type, TouristSpotSchedule, Report, ReportUpdateRequest } from '../types';
import type { EntityType } from '../types/approval';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Define types for tourist spot images
export interface TouristSpotImage {
  id: string;
  tourist_spot_id: string;
  file_url: string;
  file_format: string;
  file_size?: number;
  is_primary: boolean;
  alt_text?: string;
  uploaded_at: string;
  updated_at?: string;
}

class ApiService {

  // ===== TOURIST SPOT MANAGEMENT =====
  async getTouristSpots(): Promise<TouristSpot[]> {
    const response: AxiosResponse<ApiResponse<TouristSpot[]>> = await api.get('/tourist-spots');
    return response.data.data;
  }

  async getTouristSpotById(id: string): Promise<TouristSpot> {
    const response: AxiosResponse<ApiResponse<TouristSpot>> = await api.get(`/tourist-spots/${id}`);
    return response.data.data;
  }

  async createTouristSpot(
    spotData: Partial<TouristSpot> & { schedules?: TouristSpotSchedule[] }
  ): Promise<ApiResponse<TouristSpot>> {
    const response: AxiosResponse<ApiResponse<TouristSpot>> = await api.post('/tourist-spots', {
      ...spotData,
      spot_status: 'pending',
    });
    return response.data;
  }

  async updateTouristSpot(id: string, spotData: Partial<TouristSpot>): Promise<ApiResponse<TouristSpot>> {
    const response: AxiosResponse<ApiResponse<TouristSpot>> = await api.put(`/tourist-spots/${id}`, spotData);
    return response.data;
  }

  async submitEditRequest(id: string, spotData: Partial<TouristSpot>): Promise<ApiResponse<TouristSpot>> {
    const response: AxiosResponse<ApiResponse<TouristSpot>> = await api.put(`/tourist-spots/${id}`, spotData);
    return response.data;
  }

  async getTouristSpotSchedules(id: string): Promise<TouristSpotSchedule[]> {
    const response: AxiosResponse<ApiResponse<TouristSpotSchedule[]>> = await api.get(`/tourist-spots/${id}/schedules`);
    return response.data.data;
  }

  async saveTouristSpotSchedules(
    id: string,
    schedules: TouristSpotSchedule[]
  ): Promise<ApiResponse<{ updated: boolean }>> {
    const response: AxiosResponse<ApiResponse<{ updated: boolean }>> = await api.put(`/tourist-spots/${id}/schedules`, { schedules });
    return response.data;
  }

  async deleteTouristSpot(id: string): Promise<void> {
    await api.delete(`/tourist-spots/${id}`);
  }

  // ===== TOURIST SPOT IMAGE MANAGEMENT =====

  // Get all images for a tourist spot
  async getTouristSpotImages(touristSpotId: string): Promise<TouristSpotImage[]> {
    const response: AxiosResponse<ApiResponse<TouristSpotImage[]>> = await api.get(`/tourist-spots/${touristSpotId}/images`);
    return response.data.data;
  }

  // Get primary image for a tourist spot
  async getCategoriesAndTypes(): Promise<{
    categories: Category[];
    types: Type[];
  }> {
    const response: AxiosResponse<ApiResponse<{
      categories: Category[];
      types: Type[];
    }>> = await api.get('/tourist-spots/categories-types');
    return response.data.data;
  }

  async getLocationData(): Promise<{
    provinces: Province[];
    municipalities: Municipality[];
    barangays: Barangay[];
  }> {
    const response: AxiosResponse<ApiResponse<{
      provinces: Province[];
      municipalities: Municipality[];
      barangays: Barangay[];
    }>> = await api.get('/tourist-spots/location-data');
    return response.data.data;
  }

  async getMunicipalitiesByProvince(province_id: number): Promise<Municipality[]> {
    const response: AxiosResponse<ApiResponse<Municipality[]>> = await api.get(`/tourist-spots/municipalities/${province_id}`);
    return response.data.data;
  }

  async getBarangaysByMunicipality(municipality_id: number): Promise<Barangay[]> {
    const response: AxiosResponse<ApiResponse<Barangay[]>> = await api.get(`/tourist-spots/barangays/${municipality_id}`);
    return response.data.data;
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
    const response: AxiosResponse<ApiResponse<unknown[]>> = await api.get(paths.pendingNew);
    return response.data.data || [];
  }

  async getPendingEditsByEntity(entity: EntityType): Promise<unknown[]> {
    const paths = this.approvalPathsFor(entity);
    const response: AxiosResponse<ApiResponse<unknown[]>> = await api.get(paths.pendingEdits);
    return response.data.data || [];
  }

  async approveNewEntity(entity: EntityType, id: string): Promise<ApiResponse<void>> {
    const paths = this.approvalPathsFor(entity);
    const response: AxiosResponse<ApiResponse<void>> = await api.put(paths.approveNew(id));
    return response.data;
  }

  async approveEditEntity(entity: EntityType, id: string): Promise<ApiResponse<void>> {
    const paths = this.approvalPathsFor(entity);
    const response: AxiosResponse<ApiResponse<void>> = await api.put(paths.approveEdit(id));
    return response.data;
  }

  async rejectNewEntity(entity: EntityType, id: string, reason?: string): Promise<ApiResponse<void>> {
    const paths = this.approvalPathsFor(entity);
    const response: AxiosResponse<ApiResponse<void>> = await api.put(paths.rejectNew(id), { reason });
    return response.data;
  }

  async rejectEditEntity(entity: EntityType, id: string, reason?: string): Promise<ApiResponse<void>> {
    const paths = this.approvalPathsFor(entity);
    const response: AxiosResponse<ApiResponse<void>> = await api.put(paths.rejectEdit(id), { reason });
    return response.data;
  }

  // ===== REPORT MANAGEMENT =====
  async getReports(): Promise<Report[]> {
    const response: AxiosResponse<ApiResponse<Report[]>> = await api.get('/reports');
    return response.data.data || response.data;
  }

  async getReportById(id: string): Promise<Report> {
    const response: AxiosResponse<ApiResponse<Report>> = await api.get(`/reports/${id}`);
    return response.data.data || response.data;
  }

  async getReportsByStatus(status: string): Promise<Report[]> {
    const response: AxiosResponse<ApiResponse<Report[]>> = await api.get(`/reports/status/${status}`);
    return response.data.data || response.data;
  }

  async getReportsByTarget(targetType: string, targetId: string): Promise<Report[]> {
    const response: AxiosResponse<ApiResponse<Report[]>> = await api.get(`/reports/target/${targetType}/${targetId}`);
    return response.data.data || response.data;
  }

  async updateReportStatus(id: string, updateData: ReportUpdateRequest): Promise<ApiResponse<void>> {
    const response: AxiosResponse<ApiResponse<void>> = await api.put(`/reports/${id}/status`, updateData);
    return response.data;
  }

  async deleteReport(id: string): Promise<ApiResponse<void>> {
    const response: AxiosResponse<ApiResponse<void>> = await api.delete(`/reports/${id}`);
    return response.data;
  }

  // Helper method to get target info for reports
  async getTargetInfo(targetType: string, targetId: string): Promise<{ name: string; type: string }> {
    try {
      switch (targetType) {
        case 'business':
          try {
            const res = await api.get(`/business/${targetId}`);
            const b = (res.data?.data || res.data) as { business_name?: string };
            return { name: b.business_name || `Business ${targetId}`, type: 'Business' };
          } catch {
            return { name: `Business ${targetId}`, type: 'Business' };
          }
        case 'tourist_spot': {
          const spot = await this.getTouristSpotById(targetId);
          return { name: spot.name, type: 'Tourist Spot' };
        }
        case 'event':
          // If event endpoint becomes available, replace this with real call
          return { name: `Event ${targetId}`, type: 'Event' };
        case 'accommodation':
          try {
            const res = await api.get(`/business/${targetId}`);
            const b = (res.data?.data || res.data) as { business_name?: string };
            return { name: b.business_name || `Accommodation ${targetId}`, type: 'Accommodation' };
          } catch {
            return { name: `Accommodation ${targetId}`, type: 'Accommodation' };
          }
        default:
          return { name: `Unknown ${targetId}`, type: 'Unknown' };
      }
    } catch {
      return { name: `${targetType} ${targetId}`, type: targetType };
    }
  }
}

export const apiService = new ApiService();
