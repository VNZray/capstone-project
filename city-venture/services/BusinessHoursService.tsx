import apiClient from '../services/apiClient';
import type { BusinessHours, BusinessSchedule } from '../types/Business';

// Fetch all business hours
export const fetchAllBusinessHours = async (): Promise<BusinessSchedule> => {
  try {
    const { data } = await apiClient.get<BusinessHours[]>(`/business-hours`);
    return Array.isArray(data) ? data : [];
  } catch (error: any) {
    // If 404 (no hours found), return empty array instead of throwing
    if (error.response?.status === 404) {
      return [];
    }
    // Re-throw other errors
    throw error;
  }
};

// Fetch business hours for a specific business by filtering client-side
export const fetchBusinessHoursByBusinessId = async (
  business_id: string
): Promise<BusinessSchedule> => {
  try {
    const all = await fetchAllBusinessHours();
    return all.filter((h) => h.business_id === business_id);
  } catch (error) {
    // If error occurs, return empty array
    console.error('[BusinessHoursService] fetchBusinessHoursByBusinessId error:', error);
    return [];
  }
};

// Alias for fetchBusinessHoursByBusinessId for backward compatibility
export const fetchBusinessHours = async (
  business_id: string
): Promise<BusinessSchedule> => {
  return fetchBusinessHoursByBusinessId(business_id);
};