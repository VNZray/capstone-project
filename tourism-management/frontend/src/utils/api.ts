import { type AxiosResponse } from 'axios';
import apiClient from '@/src/services/apiClient';
import type { ApiResponse, TouristSpot, Province, Municipality, Barangay, Category, TouristSpotSchedule, Report, ReportUpdateRequest } from '../types';
import type { Type } from '../types/TypeAndCategeory';
import type { UserRoles } from '@/src/types/User';
import type { TourismStaff, CreateTourismStaffRequest, UpdateTourismStaffRequest } from '@/src/types/TourismStaff';
import type { EntityType } from '../types/approval';

// Use apiClient instead of creating a new axios instance
const api = apiClient;

// NOTE: This file is kept for backward compatibility.
// New code should use apiClient directly.

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

  async getMySubmittedTouristSpots(): Promise<TouristSpot[]> {
    const response: AxiosResponse<ApiResponse<TouristSpot[]>> = await api.get('/tourist-spots/my-submissions');
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
        return {
          pendingNew: '/approval/pending-events',
          pendingEdits: '/approval/events/pending-edits',
          approveNew: (id: string) => `/approval/approve-event/${id}`,
          approveEdit: (id: string) => `/approval/events/approve-edit/${id}`,
          rejectNew: (id: string) => `/approval/reject-event/${id}`,
          rejectEdit: (id: string) => `/approval/events/reject-edit/${id}`,
        } as const;
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
      const response = await apiClient.get<ApiResponse<TourismStaff[]>>('/tourism-staff');
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
      const response = await apiClient.get<ApiResponse<TourismStaff>>(`/tourism-staff/${id}`);
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
      const response = await apiClient.post<ApiResponse<any>>('/tourism-staff', payload);
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
      const response = await apiClient.put<ApiResponse<any>>(`/tourism-staff/${id}`, payload);
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
      const response = await apiClient.patch<ApiResponse<any>>(`/tourism-staff/${id}/status`, status);
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
      const response = await apiClient.post<ApiResponse<{ credentials: { temporary_password: string } }>>(`/tourism-staff/${id}/reset-password`);
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

  async deleteTourismStaff(id: string): Promise<void> {
    try {
      console.debug('[apiService] DELETE /tourism-staff/:id', id);
      await apiClient.delete(`/tourism-staff/${id}`);
    } catch (err: any) {
      console.error('[apiService] Failed DELETE /tourism-staff/:id', {
        id,
        message: err?.message,
        status: err?.response?.status,
        data: err?.response?.data,
      });
      throw err;
    }
  }

  // ===== BUSINESS MANAGEMENT =====
  async getBusinesses(): Promise<any[]> {
    try {
      console.debug('[apiService] GET /business');
      const response: AxiosResponse<ApiResponse<any[]>> = await api.get('/business');
      return (response.data as any).data ?? (response.data as any);
    } catch (err: any) {
      console.error('[apiService] Failed GET /business', {
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

  // ===== USER ACCOUNTS =====
  async getUsers(): Promise<any[]> {
    try {
      console.debug('[apiService] GET /users');
      const response: AxiosResponse<ApiResponse<any[]>> = await api.get('/users');
      return (response.data as any).data ?? (response.data as any);
    } catch (err: any) {
      console.error('[apiService] Failed GET /users', {
        message: err?.message,
        status: err?.response?.status,
        data: err?.response?.data,
      });
      throw err;
    }
  }

  async getUserStats(): Promise<any> {
    try {
      console.debug('[apiService] GET /users/stats');
      const response = await api.get('/users/stats');
      return response.data;
    } catch (err: any) {
      console.error('[apiService] Failed GET /users/stats', {
        message: err?.message,
        status: err?.response?.status,
        data: err?.response?.data,
      });
      throw err;
    }
  }

  // ===== EVENT MANAGEMENT =====

  async getEvents(): Promise<any[]> {
    try {
      console.debug('[apiService] GET /events');
      const response: AxiosResponse<ApiResponse<any[]>> = await api.get('/events');
      return (response.data as any).data ?? (response.data as any);
    } catch (err: any) {
      console.error('[apiService] Failed GET /events', {
        message: err?.message,
        status: err?.response?.status,
        data: err?.response?.data,
      });
      throw err;
    }
  }

  async getEventById(id: string): Promise<any> {
    try {
      console.debug('[apiService] GET /events/:id', id);
      const response: AxiosResponse<ApiResponse<any>> = await api.get(`/events/${id}`);
      return (response.data as any).data ?? (response.data as any);
    } catch (err: any) {
      console.error('[apiService] Failed GET /events/:id', {
        id,
        message: err?.message,
        status: err?.response?.status,
        data: err?.response?.data,
      });
      throw err;
    }
  }

  async createEvent(eventData: any): Promise<ApiResponse<any>> {
    try {
      console.debug('[apiService] POST /events', eventData);
      const response: AxiosResponse<ApiResponse<any>> = await api.post('/events', eventData);
      return response.data;
    } catch (err: any) {
      console.error('[apiService] Failed POST /events', {
        message: err?.message,
        status: err?.response?.status,
        data: err?.response?.data,
      });
      throw err;
    }
  }

  async updateEvent(id: string, eventData: any): Promise<ApiResponse<any>> {
    try {
      console.debug('[apiService] PUT /events/:id', { id, eventData });
      const response: AxiosResponse<ApiResponse<any>> = await api.put(`/events/${id}`, eventData);
      return response.data;
    } catch (err: any) {
      console.error('[apiService] Failed PUT /events/:id', {
        id,
        message: err?.message,
        status: err?.response?.status,
        data: err?.response?.data,
      });
      throw err;
    }
  }

  async deleteEvent(id: string): Promise<void> {
    try {
      console.debug('[apiService] DELETE /events/:id', id);
      await api.delete(`/events/${id}`);
    } catch (err: any) {
      console.error('[apiService] Failed DELETE /events/:id', {
        id,
        message: err?.message,
        status: err?.response?.status,
        data: err?.response?.data,
      });
      throw err;
    }
  }

  // Event Categories
  async getEventCategories(): Promise<any[]> {
    try {
      console.debug('[apiService] GET /events/categories');
      const response: AxiosResponse<ApiResponse<any[]>> = await api.get('/events/categories');
      return (response.data as any).data ?? (response.data as any);
    } catch (err: any) {
      console.error('[apiService] Failed GET /events/categories', {
        message: err?.message,
        status: err?.response?.status,
        data: err?.response?.data,
      });
      throw err;
    }
  }

  // Featured Events
  async getFeaturedEvents(): Promise<any[]> {
    try {
      console.debug('[apiService] GET /events/featured/list');
      const response: AxiosResponse<ApiResponse<any[]>> = await api.get('/events/featured/list');
      return (response.data as any).data ?? (response.data as any);
    } catch (err: any) {
      console.error('[apiService] Failed GET /events/featured/list', {
        message: err?.message,
        status: err?.response?.status,
        data: err?.response?.data,
      });
      throw err;
    }
  }

  async getNonFeaturedEvents(): Promise<any[]> {
    try {
      console.debug('[apiService] GET /events/featured/non-featured');
      const response: AxiosResponse<ApiResponse<any[]>> = await api.get('/events/featured/non-featured');
      return (response.data as any).data ?? (response.data as any);
    } catch (err: any) {
      console.error('[apiService] Failed GET /events/featured/non-featured', {
        message: err?.message,
        status: err?.response?.status,
        data: err?.response?.data,
      });
      throw err;
    }
  }

  async featureEvent(id: string, featuredOrder?: number): Promise<ApiResponse<void>> {
    try {
      console.debug('[apiService] PUT /events/featured/:id', { id, featuredOrder });
      const response: AxiosResponse<ApiResponse<void>> = await api.put(`/events/featured/${id}`, { featured_order: featuredOrder });
      return response.data;
    } catch (err: any) {
      console.error('[apiService] Failed PUT /events/featured/:id', {
        id,
        message: err?.message,
        status: err?.response?.status,
        data: err?.response?.data,
      });
      throw err;
    }
  }

  async unfeatureEvent(id: string): Promise<ApiResponse<void>> {
    try {
      console.debug('[apiService] DELETE /events/featured/:id', id);
      const response: AxiosResponse<ApiResponse<void>> = await api.delete(`/events/featured/${id}`);
      return response.data;
    } catch (err: any) {
      console.error('[apiService] Failed DELETE /events/featured/:id', {
        id,
        message: err?.message,
        status: err?.response?.status,
        data: err?.response?.data,
      });
      throw err;
    }
  }

  // ===== EVENT IMAGE MANAGEMENT =====

  async getEventImages(eventId: string): Promise<any[]> {
    try {
      console.debug('[apiService] GET /events/:id/images', eventId);
      const response: AxiosResponse<ApiResponse<any[]>> = await api.get(`/events/${eventId}/images`);
      return (response.data as any).data ?? (response.data as any);
    } catch (err: any) {
      console.error('[apiService] Failed GET /events/:id/images', {
        eventId,
        message: err?.message,
        status: err?.response?.status,
        data: err?.response?.data,
      });
      throw err;
    }
  }

  async addEventImage(eventId: string, imageData: {
    file_url: string;
    file_format?: string;
    file_size?: number;
    is_primary?: boolean;
    alt_text?: string;
    display_order?: number;
  }): Promise<ApiResponse<any>> {
    try {
      console.debug('[apiService] POST /events/:id/images', { eventId, imageData });
      const response: AxiosResponse<ApiResponse<any>> = await api.post(`/events/${eventId}/images`, imageData);
      return response.data;
    } catch (err: any) {
      console.error('[apiService] Failed POST /events/:id/images', {
        eventId,
        message: err?.message,
        status: err?.response?.status,
        data: err?.response?.data,
      });
      throw err;
    }
  }

  async deleteEventImage(eventId: string, imageId: string): Promise<void> {
    try {
      console.debug('[apiService] DELETE /events/:id/images/:imageId', { eventId, imageId });
      await api.delete(`/events/${eventId}/images/${imageId}`);
    } catch (err: any) {
      console.error('[apiService] Failed DELETE /events/:id/images/:imageId', {
        eventId,
        imageId,
        message: err?.message,
        status: err?.response?.status,
        data: err?.response?.data,
      });
      throw err;
    }
  }

  async setEventPrimaryImage(eventId: string, imageId: string): Promise<ApiResponse<any>> {
    try {
      console.debug('[apiService] PUT /events/:id/images/:imageId/set-primary', { eventId, imageId });
      const response: AxiosResponse<ApiResponse<any>> = await api.put(`/events/${eventId}/images/${imageId}/set-primary`);
      return response.data;
    } catch (err: any) {
      console.error('[apiService] Failed PUT /events/:id/images/:imageId/set-primary', {
        eventId,
        imageId,
        message: err?.message,
        status: err?.response?.status,
        data: err?.response?.data,
      });
      throw err;
    }
  }

  // ===== EVENT CATEGORY MAPPINGS (Multiple Categories) =====

  async getEventCategoryMappings(eventId: string): Promise<any[]> {
    try {
      console.debug('[apiService] GET /events/:id/categories', { eventId });
      const response: AxiosResponse<ApiResponse<any[]>> = await api.get(`/events/${eventId}/categories`);
      return response.data.data || [];
    } catch (err: any) {
      console.error('[apiService] Failed GET /events/:id/categories', { eventId, message: err?.message });
      throw err;
    }
  }

  async setEventCategoryMappings(eventId: string, categoryIds: string[]): Promise<ApiResponse<any>> {
    try {
      console.debug('[apiService] PUT /events/:id/categories', { eventId, categoryIds });
      const response: AxiosResponse<ApiResponse<any>> = await api.put(`/events/${eventId}/categories`, { category_ids: categoryIds });
      return response.data;
    } catch (err: any) {
      console.error('[apiService] Failed PUT /events/:id/categories', { eventId, message: err?.message });
      throw err;
    }
  }

  async addEventCategoryMapping(eventId: string, categoryId: string): Promise<ApiResponse<any>> {
    try {
      console.debug('[apiService] POST /events/:id/categories', { eventId, categoryId });
      const response: AxiosResponse<ApiResponse<any>> = await api.post(`/events/${eventId}/categories`, { category_id: categoryId });
      return response.data;
    } catch (err: any) {
      console.error('[apiService] Failed POST /events/:id/categories', { eventId, message: err?.message });
      throw err;
    }
  }

  async removeEventCategoryMapping(eventId: string, categoryId: string): Promise<ApiResponse<any>> {
    try {
      console.debug('[apiService] DELETE /events/:id/categories/:categoryId', { eventId, categoryId });
      const response: AxiosResponse<ApiResponse<any>> = await api.delete(`/events/${eventId}/categories/${categoryId}`);
      return response.data;
    } catch (err: any) {
      console.error('[apiService] Failed DELETE /events/:id/categories/:categoryId', { eventId, message: err?.message });
      throw err;
    }
  }

  // ===== EVENT LOCATIONS (Multiple Locations) =====

  async getEventLocations(eventId: string): Promise<any[]> {
    try {
      console.debug('[apiService] GET /events/:id/locations', { eventId });
      const response: AxiosResponse<ApiResponse<any[]>> = await api.get(`/events/${eventId}/locations`);
      return response.data.data || [];
    } catch (err: any) {
      console.error('[apiService] Failed GET /events/:id/locations', { eventId, message: err?.message });
      throw err;
    }
  }

  async addEventLocation(eventId: string, location: {
    venue_name: string;
    venue_address?: string;
    barangay_id?: number;
    latitude?: number;
    longitude?: number;
    is_primary?: boolean;
    display_order?: number;
  }): Promise<ApiResponse<any>> {
    try {
      console.debug('[apiService] POST /events/:id/locations', { eventId, location });
      const response: AxiosResponse<ApiResponse<any>> = await api.post(`/events/${eventId}/locations`, location);
      return response.data;
    } catch (err: any) {
      console.error('[apiService] Failed POST /events/:id/locations', { eventId, message: err?.message });
      throw err;
    }
  }

  async updateEventLocation(eventId: string, locationId: string, location: {
    venue_name?: string;
    venue_address?: string;
    barangay_id?: number;
    latitude?: number;
    longitude?: number;
    is_primary?: boolean;
    display_order?: number;
  }): Promise<ApiResponse<any>> {
    try {
      console.debug('[apiService] PUT /events/:id/locations/:locationId', { eventId, locationId, location });
      const response: AxiosResponse<ApiResponse<any>> = await api.put(`/events/${eventId}/locations/${locationId}`, location);
      return response.data;
    } catch (err: any) {
      console.error('[apiService] Failed PUT /events/:id/locations/:locationId', { eventId, message: err?.message });
      throw err;
    }
  }

  async deleteEventLocation(eventId: string, locationId: string): Promise<ApiResponse<any>> {
    try {
      console.debug('[apiService] DELETE /events/:id/locations/:locationId', { eventId, locationId });
      const response: AxiosResponse<ApiResponse<any>> = await api.delete(`/events/${eventId}/locations/${locationId}`);
      return response.data;
    } catch (err: any) {
      console.error('[apiService] Failed DELETE /events/:id/locations/:locationId', { eventId, message: err?.message });
      throw err;
    }
  }

  async setPrimaryEventLocation(eventId: string, locationId: string): Promise<ApiResponse<any>> {
    try {
      console.debug('[apiService] PUT /events/:id/locations/:locationId/set-primary', { eventId, locationId });
      const response: AxiosResponse<ApiResponse<any>> = await api.put(`/events/${eventId}/locations/${locationId}/set-primary`);
      return response.data;
    } catch (err: any) {
      console.error('[apiService] Failed PUT /events/:id/locations/:locationId/set-primary', { eventId, message: err?.message });
      throw err;
    }
  }
}

export const apiService = new ApiService();
