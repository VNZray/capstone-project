// const API_BASE_URL = 'http://192.168.1.15:3000/api';
const API_BASE_URL = 'http://localhost:3000/api';

import axios, { type AxiosResponse } from 'axios';
import apiClient from '@/src/services/apiClient';
import type { ApiResponse, TouristSpot, Province, Municipality, Barangay, Category, Type, TouristSpotSchedule, Report, ReportUpdateRequest } from '../types';
import type { 
  Event, 
  EventCategory, 
  EventTag, 
  EventImage, 
  EventSchedule, 
  EventReview, 
  EventRatingStats, 
  EventSearchParams,
  EventFormData,
  CalendarEvent,
  EventDensity,
  EventStats,
  FeaturedEventFormData,
  PendingEvent
} from '../types/Event';
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

// NOTE: This file uses a standalone axios instance for backward compatibility.
// New code should use apiClient from @/src/services/apiClient which supports
// the new authentication system with refresh tokens and HttpOnly cookies.
// This interceptor is kept for legacy endpoints that haven't migrated yet.
// TODO: Gradually migrate all endpoints to use apiClient and remove this file.

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
        return {
          pendingNew: '/approval/pending-events',
          pendingEdits: '/approval/pending-events', // Events don't have separate edit flow yet
          approveNew: (id: string) => `/approval/approve-event/${id}`,
          approveEdit: (id: string) => `/approval/approve-event/${id}`,
          rejectNew: (id: string) => `/approval/reject-event/${id}`,
          rejectEdit: (id: string) => `/approval/reject-event/${id}`,
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

  // ===== EVENT MANAGEMENT =====

  // Get all events with optional status filter
  async getEvents(params?: { status?: string; limit?: number; offset?: number }): Promise<Event[]> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    
    const url = queryParams.toString() ? `/events?${queryParams.toString()}` : '/events';
    const response: AxiosResponse<ApiResponse<Event[]>> = await apiClient.get(url);
    return response.data.data || [];
  }

  // Get event by ID
  async getEventById(id: string): Promise<Event> {
    const response: AxiosResponse<ApiResponse<Event>> = await apiClient.get(`/events/${id}`);
    return response.data.data;
  }

  // Get event by slug
  async getEventBySlug(slug: string): Promise<Event> {
    const response: AxiosResponse<ApiResponse<Event>> = await apiClient.get(`/events/slug/${slug}`);
    return response.data.data;
  }

  // Create new event
  async createEvent(eventData: EventFormData): Promise<ApiResponse<Event>> {
    const response: AxiosResponse<ApiResponse<Event>> = await apiClient.post('/events', eventData);
    return response.data;
  }

  // Update event
  async updateEvent(id: string, eventData: Partial<EventFormData>): Promise<ApiResponse<Event>> {
    const response: AxiosResponse<ApiResponse<Event>> = await apiClient.put(`/events/${id}`, eventData);
    return response.data;
  }

  // Delete event
  async deleteEvent(id: string): Promise<ApiResponse<void>> {
    const response: AxiosResponse<ApiResponse<void>> = await apiClient.delete(`/events/${id}`);
    return response.data;
  }

  // Submit event for approval
  async submitEventForApproval(id: string): Promise<ApiResponse<Event>> {
    const response: AxiosResponse<ApiResponse<Event>> = await apiClient.post(`/events/${id}/submit`);
    return response.data;
  }

  // ===== EVENT CATEGORIES =====

  async getEventCategories(): Promise<EventCategory[]> {
    const response: AxiosResponse<ApiResponse<EventCategory[]>> = await apiClient.get('/events/categories');
    return response.data.data || [];
  }

  async getEventCategoryById(id: number): Promise<EventCategory> {
    const response: AxiosResponse<ApiResponse<EventCategory>> = await apiClient.get(`/events/categories/${id}`);
    return response.data.data;
  }

  async createEventCategory(data: { name: string; slug?: string; description?: string; icon?: string; color?: string }): Promise<ApiResponse<EventCategory>> {
    const response: AxiosResponse<ApiResponse<EventCategory>> = await apiClient.post('/events/categories', data);
    return response.data;
  }

  async updateEventCategory(id: number, data: Partial<EventCategory>): Promise<ApiResponse<EventCategory>> {
    const response: AxiosResponse<ApiResponse<EventCategory>> = await apiClient.put(`/events/categories/${id}`, data);
    return response.data;
  }

  async deleteEventCategory(id: number): Promise<ApiResponse<void>> {
    const response: AxiosResponse<ApiResponse<void>> = await apiClient.delete(`/events/categories/${id}`);
    return response.data;
  }

  // ===== EVENT TAGS =====

  async getEventTags(): Promise<EventTag[]> {
    const response: AxiosResponse<ApiResponse<EventTag[]>> = await apiClient.get('/events/tags');
    return response.data.data || [];
  }

  async getEventTagsForEvent(eventId: string): Promise<EventTag[]> {
    const response: AxiosResponse<ApiResponse<EventTag[]>> = await apiClient.get(`/events/${eventId}/tags`);
    return response.data.data || [];
  }

  async syncEventTags(eventId: string, tagIds: number[]): Promise<ApiResponse<EventTag[]>> {
    const response: AxiosResponse<ApiResponse<EventTag[]>> = await apiClient.put(`/events/${eventId}/tags`, { tag_ids: tagIds });
    return response.data;
  }

  // ===== EVENT IMAGES =====

  async getEventImages(eventId: string): Promise<EventImage[]> {
    const response: AxiosResponse<ApiResponse<EventImage[]>> = await apiClient.get(`/events/${eventId}/images`);
    return response.data.data || [];
  }

  async addEventImage(eventId: string, imageData: {
    file_url: string;
    file_name?: string;
    file_format: string;
    file_size?: number;
    is_primary?: boolean;
    alt_text?: string;
  }): Promise<ApiResponse<EventImage>> {
    const response: AxiosResponse<ApiResponse<EventImage>> = await apiClient.post(`/events/${eventId}/images`, imageData);
    return response.data;
  }

  async updateEventImage(imageId: string, data: { is_primary?: boolean; alt_text?: string; display_order?: number }): Promise<ApiResponse<EventImage>> {
    const response: AxiosResponse<ApiResponse<EventImage>> = await apiClient.put(`/events/images/${imageId}`, data);
    return response.data;
  }

  async deleteEventImage(imageId: string): Promise<ApiResponse<void>> {
    const response: AxiosResponse<ApiResponse<void>> = await apiClient.delete(`/events/images/${imageId}`);
    return response.data;
  }

  async setPrimaryEventImage(imageId: string): Promise<ApiResponse<EventImage[]>> {
    const response: AxiosResponse<ApiResponse<EventImage[]>> = await apiClient.put(`/events/images/${imageId}/primary`);
    return response.data;
  }

  // ===== EVENT SCHEDULES =====

  async getEventSchedules(eventId: string): Promise<EventSchedule[]> {
    const response: AxiosResponse<ApiResponse<EventSchedule[]>> = await apiClient.get(`/events/${eventId}/schedules`);
    return response.data.data || [];
  }

  async addEventSchedule(eventId: string, scheduleData: {
    title?: string;
    description?: string;
    schedule_date: string;
    start_time?: string;
    end_time?: string;
    location_override?: string;
  }): Promise<ApiResponse<EventSchedule>> {
    const response: AxiosResponse<ApiResponse<EventSchedule>> = await apiClient.post(`/events/${eventId}/schedules`, scheduleData);
    return response.data;
  }

  async updateEventSchedule(scheduleId: string, data: Partial<EventSchedule>): Promise<ApiResponse<EventSchedule>> {
    const response: AxiosResponse<ApiResponse<EventSchedule>> = await apiClient.put(`/events/schedules/${scheduleId}`, data);
    return response.data;
  }

  async deleteEventSchedule(scheduleId: string): Promise<ApiResponse<void>> {
    const response: AxiosResponse<ApiResponse<void>> = await apiClient.delete(`/events/schedules/${scheduleId}`);
    return response.data;
  }

  // ===== SEARCH & FILTER =====

  async searchEvents(params: EventSearchParams): Promise<Event[]> {
    const queryParams = new URLSearchParams();
    if (params.keyword) queryParams.append('keyword', params.keyword);
    if (params.category_id) queryParams.append('category_id', params.category_id.toString());
    if (params.start_date) queryParams.append('start_date', params.start_date);
    if (params.end_date) queryParams.append('end_date', params.end_date);
    if (params.is_free !== undefined) queryParams.append('is_free', params.is_free.toString());
    if (params.barangay_id) queryParams.append('barangay_id', params.barangay_id.toString());
    if (params.municipality_id) queryParams.append('municipality_id', params.municipality_id.toString());
    if (params.province_id) queryParams.append('province_id', params.province_id.toString());
    if (params.status) queryParams.append('status', params.status);
    if (params.sort_by) queryParams.append('sort_by', params.sort_by);
    if (params.sort_order) queryParams.append('sort_order', params.sort_order);
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.offset) queryParams.append('offset', params.offset.toString());

    const response: AxiosResponse<ApiResponse<Event[]>> = await apiClient.get(`/events/search?${queryParams.toString()}`);
    return response.data.data || [];
  }

  async getEventsByCategory(categoryId: number, limit?: number): Promise<Event[]> {
    const url = limit ? `/events/category/${categoryId}?limit=${limit}` : `/events/category/${categoryId}`;
    const response: AxiosResponse<ApiResponse<Event[]>> = await apiClient.get(url);
    return response.data.data || [];
  }

  async getEventsByDateRange(startDate: string, endDate: string): Promise<Event[]> {
    const response: AxiosResponse<ApiResponse<Event[]>> = await apiClient.get(`/events/by-date?start=${startDate}&end=${endDate}`);
    return response.data.data || [];
  }

  async getNearbyEvents(latitude: number, longitude: number, radius?: number, limit?: number): Promise<Event[]> {
    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
    });
    if (radius) params.append('radius', radius.toString());
    if (limit) params.append('limit', limit.toString());

    const response: AxiosResponse<ApiResponse<Event[]>> = await apiClient.get(`/events/nearby?${params.toString()}`);
    return response.data.data || [];
  }

  // ===== FEATURED EVENTS =====

  async getFeaturedEvents(limit?: number): Promise<Event[]> {
    const url = limit ? `/events/featured?limit=${limit}` : '/events/featured';
    const response: AxiosResponse<ApiResponse<Event[]>> = await apiClient.get(url);
    return response.data.data || [];
  }

  async setEventFeatured(id: string, data: FeaturedEventFormData): Promise<ApiResponse<Event>> {
    const response: AxiosResponse<ApiResponse<Event>> = await apiClient.put(`/events/${id}/featured`, data);
    return response.data;
  }

  async featureEvent(eventId: string, displayOrder?: number): Promise<ApiResponse<void>> {
    const response: AxiosResponse<ApiResponse<void>> = await apiClient.post(`/events/${eventId}/feature`, { display_order: displayOrder });
    return response.data;
  }

  async unfeatureEvent(eventId: string): Promise<ApiResponse<void>> {
    const response: AxiosResponse<ApiResponse<void>> = await apiClient.delete(`/events/${eventId}/feature`);
    return response.data;
  }

  async updateFeaturedOrder(items: { event_id: string; display_order: number }[]): Promise<ApiResponse<void>> {
    const response: AxiosResponse<ApiResponse<void>> = await apiClient.put('/events/featured/order', { items });
    return response.data;
  }

  async getFeaturedEventsByLocation(location: string): Promise<Event[]> {
    const response: AxiosResponse<ApiResponse<Event[]>> = await apiClient.get(`/events/featured/${location}`);
    return response.data.data || [];
  }

  // ===== EVENT REVIEWS =====

  async getEventReviews(eventId: string, params?: { status?: string; limit?: number; offset?: number }): Promise<EventReview[]> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const url = queryParams.toString() ? `/events/${eventId}/reviews?${queryParams.toString()}` : `/events/${eventId}/reviews`;
    const response: AxiosResponse<ApiResponse<EventReview[]>> = await apiClient.get(url);
    return response.data.data || [];
  }

  async addEventReview(eventId: string, data: { rating: number; review_text?: string }): Promise<ApiResponse<EventReview>> {
    const response: AxiosResponse<ApiResponse<EventReview>> = await apiClient.post(`/events/${eventId}/reviews`, data);
    return response.data;
  }

  async updateEventReview(reviewId: string, data: { rating?: number; review_text?: string; status?: string }): Promise<ApiResponse<EventReview>> {
    const response: AxiosResponse<ApiResponse<EventReview>> = await apiClient.put(`/events/reviews/${reviewId}`, data);
    return response.data;
  }

  async deleteEventReview(reviewId: string): Promise<ApiResponse<void>> {
    const response: AxiosResponse<ApiResponse<void>> = await apiClient.delete(`/events/reviews/${reviewId}`);
    return response.data;
  }

  async getEventAverageRating(eventId: string): Promise<EventRatingStats> {
    const response: AxiosResponse<ApiResponse<EventRatingStats>> = await apiClient.get(`/events/${eventId}/rating`);
    return response.data.data;
  }

  // ===== EVENT BOOKMARKS =====

  async addEventBookmark(eventId: string): Promise<ApiResponse<void>> {
    const response: AxiosResponse<ApiResponse<void>> = await apiClient.post(`/events/${eventId}/bookmark`);
    return response.data;
  }

  async removeEventBookmark(eventId: string): Promise<ApiResponse<void>> {
    const response: AxiosResponse<ApiResponse<void>> = await apiClient.delete(`/events/${eventId}/bookmark`);
    return response.data;
  }

  async getUserBookmarkedEvents(): Promise<Event[]> {
    const response: AxiosResponse<ApiResponse<Event[]>> = await apiClient.get('/events/user/bookmarks');
    return response.data.data || [];
  }

  async isEventBookmarked(eventId: string): Promise<boolean> {
    const response: AxiosResponse<ApiResponse<{ is_bookmarked: boolean }>> = await apiClient.get(`/events/${eventId}/bookmark/check`);
    return response.data.data?.is_bookmarked || false;
  }

  // ===== CALENDAR =====

  async getEventsForCalendar(year?: number, month?: number): Promise<CalendarEvent[]> {
    const params = new URLSearchParams();
    if (year) params.append('year', year.toString());
    if (month) params.append('month', month.toString());

    const url = params.toString() ? `/events/calendar?${params.toString()}` : '/events/calendar';
    const response: AxiosResponse<ApiResponse<CalendarEvent[]>> = await apiClient.get(url);
    return response.data.data || [];
  }

  async getEventDensityByMonth(year?: number, month?: number): Promise<EventDensity[]> {
    const params = new URLSearchParams();
    if (year) params.append('year', year.toString());
    if (month) params.append('month', month.toString());

    const url = params.toString() ? `/events/calendar/density?${params.toString()}` : '/events/calendar/density';
    const response: AxiosResponse<ApiResponse<EventDensity[]>> = await apiClient.get(url);
    return response.data.data || [];
  }

  // ===== EVENT STATS =====

  async getEventStats(eventId: string): Promise<EventStats> {
    const response: AxiosResponse<ApiResponse<EventStats>> = await apiClient.get(`/events/${eventId}/stats`);
    return response.data.data;
  }

  async getPopularEvents(limit?: number): Promise<Event[]> {
    const url = limit ? `/events/popular?limit=${limit}` : '/events/popular';
    const response: AxiosResponse<ApiResponse<Event[]>> = await apiClient.get(url);
    return response.data.data || [];
  }

  // ===== PENDING EVENTS (Admin) =====

  async getPendingEvents(): Promise<PendingEvent[]> {
    const response: AxiosResponse<ApiResponse<PendingEvent[]>> = await apiClient.get('/approval/pending-events');
    return response.data.data || [];
  }

  async approveEvent(id: string): Promise<ApiResponse<Event>> {
    const response: AxiosResponse<ApiResponse<Event>> = await apiClient.put(`/approval/approve-event/${id}`);
    return response.data;
  }

  async rejectEvent(id: string, reason: string): Promise<ApiResponse<Event>> {
    const response: AxiosResponse<ApiResponse<Event>> = await apiClient.put(`/approval/reject-event/${id}`, { reason });
    return response.data;
  }
}

export const apiService = new ApiService();
