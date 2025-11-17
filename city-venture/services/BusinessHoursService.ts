
import axios from 'axios';
import api from '@/services/api';
import { getToken } from '@/utils/secureStorage';
import type { BusinessHours, BusinessHoursDisplay, BusinessOperatingStatus, DayOfWeek } from '@/types/BusinessHours';

/**
 * Helper function to get authorized axios instance
 */
const getAuthAxios = async () => {
  const token = await getToken();
  return axios.create({
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
};

/**
 * Fetch business hours for a specific business
 * GET /api/business-hours/:businessId
 */
export const fetchBusinessHours = async (businessId: string): Promise<BusinessHours[]> => {
  try {
    const authAxios = await getAuthAxios();
    const { data } = await authAxios.get<BusinessHours[]>(
      `${api}/business-hours/${businessId}`
    );
    return data;
  } catch (error) {
    console.error('[BusinessHoursService] fetchBusinessHours error:', error);
    return []; // Return empty array instead of throwing
  }
};

/**
 * Convert business hours to display format
 */
export const convertToDisplayFormat = (hours: BusinessHours[]): BusinessHoursDisplay[] => {
  return hours.map(hour => ({
    day: hour.day_of_week,
    open: formatTime(hour.opening_time),
    close: formatTime(hour.closing_time),
    is_closed: hour.is_closed,
  }));
};

/**
 * Format time from HH:MM to 12-hour format
 */
const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
};

/**
 * Check if business is currently open
 */
export const getOperatingStatus = (hours: BusinessHours[]): BusinessOperatingStatus => {
  const now = new Date();
  const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }) as DayOfWeek;
  
  const todayHours = hours.find(h => h.day_of_week === currentDay);
  
  if (!todayHours || todayHours.is_closed) {
    return {
      is_open: false,
      current_day: currentDay,
      today_hours: todayHours,
    };
  }
  
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  const isOpen = currentTime >= todayHours.opening_time && currentTime <= todayHours.closing_time;
  
  return {
    is_open: isOpen,
    current_day: currentDay,
    today_hours: todayHours,
  };
};
