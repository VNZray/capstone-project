// const API_BASE_URL = 'http://192.168.1.15:3000/api';
const API_BASE_URL = 'http://localhost:3000/api';

import axios, { type AxiosResponse } from 'axios';
import type { ApiResponse, TouristSpot, Province, Municipality, Barangay, Category, Type, TouristSpotSchedule, Report, ReportUpdateRequest } from '../types';
import type { UserRoles } from '@/src/types/User';
import type { TourismStaff, CreateTourismStaffRequest, UpdateTourismStaffRequest } from '@/src/types/TourismStaff';
import type { EntityType } from '../types/approval';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization header from storage token if present (supports remember-me)
api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      (config.headers as any).Authorization = `Bearer ${token}`;
    } else if ((config.headers as any).Authorization) {
      // If another place already set Authorization, keep it
    } else if ((axios.defaults.headers as any)?.common?.Authorization) {
      (config.headers as any).Authorization = (axios.defaults.headers as any).common.Authorization;
    } else {
      console.warn('[apiService] No auth token found in storage for request', config.url);
    }
  } catch (e) {
    console.error('[apiService] Interceptor error reading token', e);
  }
  return config;
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

  // Featured management
  async getFeaturedTouristSpots(): Promise<TouristSpot[]> {
    const response: AxiosResponse<ApiResponse<TouristSpot[]>> = await api.get('/tourist-spots/featured/list');
    return response.data.data || [];
  }

  async getNonFeaturedTouristSpots(): Promise<TouristSpot[]> {
    const response: AxiosResponse<ApiResponse<TouristSpot[]>> = await api.get('/tourist-spots/featured/non-featured');
    return response.data.data || [];
  }

  async featureTouristSpot(id: string): Promise<ApiResponse<void>> {
    const response: AxiosResponse<ApiResponse<void>> = await api.put(`/tourist-spots/featured/${id}`);
    return response.data;
  }

  async unfeatureTouristSpot(id: string): Promise<ApiResponse<void>> {
    const response: AxiosResponse<ApiResponse<void>> = await api.delete(`/tourist-spots/featured/${id}`);
    return response.data;
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
      case 'businesses':
        return {
          pendingNew: '/approval/pending-businesses',
          pendingEdits: '/approval/businesses/pending-edits',
          approveNew: (id: string) => `/approval/approve-business/${id}`,
          approveEdit: (id: string) => `/approval/businesses/approve-edit/${id}`,
          rejectNew: (id: string) => `/approval/reject-business/${id}`,
          rejectEdit: (id: string) => `/approval/businesses/reject-edit/${id}`,
        } as const;
      case 'events':
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

  // ===== TOURISM STAFF MANAGEMENT (Admin) =====
  async getTourismStaff(): Promise<TourismStaff[]> {
    try {
      console.debug('[apiService] GET /tourism-staff');
      const response: AxiosResponse<ApiResponse<TourismStaff[]>> = await api.get('/tourism-staff');
      return (response.data as any).data ?? (response.data as any);
    } catch (err: any) {
      console.error('[apiService] Failed GET /tourism-staff', {
        message: err?.message,
        status: err?.response?.status,
        data: err?.response?.data,
        headers: err?.response?.config?.headers,
      });
      throw err;
    }
  }

  async getTourismStaffById(id: string): Promise<TourismStaff> {
    try {
      console.debug('[apiService] GET /tourism-staff/:id', id);
      const response: AxiosResponse<ApiResponse<TourismStaff>> = await api.get(`/tourism-staff/${id}`);
      return (response.data as any).data ?? (response.data as any);
    } catch (err: any) {
      console.error('[apiService] Failed GET /tourism-staff/:id', {
        id,
        message: err?.message,
        status: err?.response?.status,
        data: err?.response?.data,
      });
      throw err;
    }
  }

  async createTourismStaff(payload: CreateTourismStaffRequest): Promise<ApiResponse<any>> {
    try {
      console.debug('[apiService] POST /tourism-staff', payload);
      const response: AxiosResponse<ApiResponse<any>> = await api.post('/tourism-staff', payload);
      return response.data;
    } catch (err: any) {
      console.error('[apiService] Failed POST /tourism-staff', {
        payload,
        message: err?.message,
        status: err?.response?.status,
        data: err?.response?.data,
        headers: err?.response?.config?.headers,
      });
      throw err;
    }
  }

  async updateTourismStaff(id: string, payload: UpdateTourismStaffRequest): Promise<ApiResponse<any>> {
    try {
      console.debug('[apiService] PUT /tourism-staff/:id', { id, payload });
      const response: AxiosResponse<ApiResponse<any>> = await api.put(`/tourism-staff/${id}`, payload);
      return response.data;
    } catch (err: any) {
      console.error('[apiService] Failed PUT /tourism-staff/:id', {
        id,
        payload,
        message: err?.message,
        status: err?.response?.status,
        data: err?.response?.data,
      });
      throw err;
    }
  }

  async setTourismStaffStatus(id: string, status: { is_active?: boolean; is_verified?: boolean }): Promise<ApiResponse<any>> {
    try {
      console.debug('[apiService] PATCH /tourism-staff/:id/status', { id, status });
      const response: AxiosResponse<ApiResponse<any>> = await api.patch(`/tourism-staff/${id}/status`, status);
      return response.data;
    } catch (err: any) {
      console.error('[apiService] Failed PATCH /tourism-staff/:id/status', {
        id,
        status,
        message: err?.message,
        statusCode: err?.response?.status,
        data: err?.response?.data,
      });
      throw err;
    }
  }

  async resetTourismStaffPassword(id: string): Promise<ApiResponse<{ credentials: { temporary_password: string } }>> {
    try {
      console.debug('[apiService] POST /tourism-staff/:id/reset-password', id);
      const response: AxiosResponse<ApiResponse<{ credentials: { temporary_password: string } }>> = await api.post(`/tourism-staff/${id}/reset-password`);
      return response.data;
    } catch (err: any) {
      console.error('[apiService] Failed POST /tourism-staff/:id/reset-password', {
        id,
        message: err?.message,
        status: err?.response?.status,
        data: err?.response?.data,
      });
      throw err;
    }
  }

  // ===== ROLES =====
  async getUserRoles(): Promise<UserRoles[]> {
    try {
      console.debug('[apiService] GET /user-roles');
      const response: AxiosResponse<ApiResponse<UserRoles[]>> = await api.get('/user-roles');
      return (response.data as any).data ?? (response.data as any);
    } catch (err: any) {
      console.error('[apiService] Failed GET /user-roles', {
        message: err?.message,
        status: err?.response?.status,
        data: err?.response?.data,
      });
      throw err;
    }
  }
}

export const apiService = new ApiService();
