import type {
  Business,
  BusinessDetails,
} from '@/types/Business';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '@/services/apiClient';

import api from '@/services/api';
import { Address } from '@/types/Address';
import { Bookings } from '@/types/Booking';
import debugLogger from '@/utils/debugLogger';
import { fetchEntityCategories } from '@/services/BusinessService';

/** Get stored Business ID */
export const getStoredBusinessId = async (): Promise<string | null> => {
  return await AsyncStorage.getItem('selectedBusinessId');
};

/** Set Business ID */
export const setStoredBusinessId = async (id: string) => {
  await AsyncStorage.setItem('selectedBusinessId', id);
};

/** Clear stored Business ID */
export const clearStoredBusinessId = async () => {
  await AsyncStorage.removeItem('selectedBusinessId');
};

/** Fetch Business Details from API */
export const fetchAllBusinessDetails = async (): Promise<Business[]> => {
  const { data } = await apiClient.get<Business[]>(`/business`);
  return data;
};

/** Fetch Business Details from API */
export const fetchBusinessDetails = async (
  business_id: string
): Promise<Business> => {
  const { data } = await apiClient.get<Business>(`/business/${business_id}`);
  return data;
};

export const fetchBusinessesByOwner = async (
  owner_id: string
): Promise<Business[]> => {
  const { data } = await apiClient.get(`/business/owner/${owner_id}`);
  return Array.isArray(data) ? data : [data]; // ensure it's always an array
};

export const fetchBusinessesByStatus = async (
  status: string
): Promise<Business[]> => {
  const { data } = await apiClient.get(`/business/status/${status}`);
  return Array.isArray(data) ? data : [data]; // ensure it's always an array
};

export const fetchAddress = async (barangay_id: number): Promise<Address> => {
  const res = await apiClient.get<Address>(`/address/${barangay_id}`);
  return res.data;
};

export { api };

/** Fetch Complete Business Data with categories from entity_categories */
export const fetchBusinessData = async (
  id: string
): Promise<BusinessDetails> => {
  const business = await fetchBusinessDetails(id);
  const address = await fetchAddress(business.barangay_id);
  
  // Fetch categories from entity_categories
  const categories = await fetchEntityCategories('business', id);
  const primaryCategory = categories.find(c => c.is_primary) || categories[0];

  const businessDetails: BusinessDetails = {
    id: business.id,
    owner_id: business.owner_id,
    business_name: business.business_name,
    phone_number: business.phone_number ?? '',
    email: business.email,
    address: business.address ?? '',
    description: business.description ?? '',
    instagram_url: business.instagram_url ?? '',
    x_url: business.x_url ?? '',
    website_url: business.website_url ?? '',
    facebook_url: business.facebook_url ?? '',
    latitude: business.latitude ?? '',
    longitude: business.longitude ?? '',
    min_price: business.min_price ?? '',
    max_price: business.max_price ?? '',
    status: business.status,
    business_image: business.business_image ?? '',
    hasBooking: business.hasBooking ?? false,
    barangay_id: business.barangay_id,
    province_name: address.province_name ?? '',
    municipality_name: address.municipality_name ?? '',
    barangay_name: address.barangay_name ?? '',
    categories: categories,
    primary_category: primaryCategory?.category_title ?? '',
  };

  return businessDetails;
};

export const fetchBookings = async (
  tourist_id: string
): Promise<Bookings[]> => {
  try {
    const response = await apiClient.get(`/booking/tourist/${tourist_id}`);
    return response.data;
  } catch (err: any) {
    debugLogger({
      title: 'AuthService: Fetch bookings failed',
      error: err.message,
    });
    return [];
  }
};

export const fetchAllBookings = async (): Promise<Bookings[]> => {
  try {
    const response = await apiClient.get(`/booking`);
    return response.data;
  } catch (err: any) {
    debugLogger({
      title: 'AccommodationService: Fetch room bookings failed',
      error: err.message,
    });
    return [];
  }
};

