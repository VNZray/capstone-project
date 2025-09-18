import axios from 'axios';
import api from '@/services/api';
import type { BusinessHours, BusinessSchedule } from '@/types/Business';

// Fetch all business hours
export const fetchAllBusinessHours = async (): Promise<BusinessSchedule> => {
  const { data } = await axios.get<BusinessHours[]>(`${api}/business-hours`);
  return Array.isArray(data) ? data : [];
};

// Fetch business hours for a specific business by filtering client-side
export const fetchBusinessHoursByBusinessId = async (
  business_id: string
): Promise<BusinessSchedule> => {
  const all = await fetchAllBusinessHours();
  return all.filter((h) => h.business_id === business_id);
};