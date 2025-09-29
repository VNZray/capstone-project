import type {
  Business,
  BusinessCategory,
  BusinessDetails,
  BusinessType,
  Room,
} from '@/src/types/Business';
import axios from 'axios';

import api from '@/src/services/api';
import type { Address } from '@/src/types/Address';
import type { Bookings } from '../types/Booking';
/** Get stored Business ID */
export const getStoredBusinessId = async (): Promise<string | null> => {
  return localStorage.getItem('selectedBusinessId');
};

/** Set Business ID */
export const setStoredBusinessId = async (id: string) => {
   localStorage.setItem('selectedBusinessId', id);
};

/** Clear stored Business ID */
export const clearStoredBusinessId = async () => {
   localStorage.removeItem('selectedBusinessId');
};

/** Fetch All Listed Business Details from API */
export const fetchAllBusinessDetails = async (): Promise<Business[]> => {
  const { data } = await axios.get<Business[]>(`${api}/business`);
  return data;
};

/** Fetch Specific Business Details from API */
export const fetchBusinessDetails = async (
  business_id: string
): Promise<Business> => {
  const { data } = await axios.get<Business>(`${api}/business/${business_id}`);
  return data;
};

export const fetchBusinessesByOwner = async (
  owner_id: string
): Promise<Business[]> => {
  const { data } = await axios.get(`${api}/business/owner/${owner_id}`);
  return Array.isArray(data) ? data : [data]; // ensure it's always an array
};


export const fetchBusinessType = async (
  business_type_id: number
): Promise<BusinessType> => {
  // Correct endpoint: /api/category-and-type/type/:id
  const res = await axios.get<BusinessType>(
    `${api}/category-and-type/type/${business_type_id}`
  );
  return res.data;
};

export const fetchBusinessCategory = async (
  business_category_id: number
): Promise<BusinessCategory> => {
  // Correct endpoint: /api/category-and-type/category-by-id/:id
  const res = await axios.get<BusinessCategory>(
    `${api}/category-and-type/category-by-id/${business_category_id}`
  );
  return res.data;
};

export const fetchAddress = async (address_id: number): Promise<Address> => {
  const res = await axios.get<Address>(`${api}/address/${address_id}`);
  return res.data;
};

export { api };

export const fetchBusinessData = async (
  id: string
): Promise<BusinessDetails> => {
  const business = await fetchBusinessDetails(id);
  const business_type = await fetchBusinessType(business.business_type_id);
  const business_category = await fetchBusinessCategory(
    business.business_category_id
  );
  const address = await fetchAddress(business.address_id);

  const businessDetails: BusinessDetails = {
    id: business.id,
    owner_id: business.owner_id ?? '',
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
    address_id: business.address_id,
    province_name: address.province_name ?? '',
    municipality_name: address.municipality_name ?? '',
    barangay_name: address.barangay_name ?? '',
    business_type_id: business.business_type_id,
    business_category_id: business.business_category_id,
    type: business_type.type,
    category: business_category.category,
  };

  return businessDetails;
};

export const fetchBookingsByRoomId = async (
  room_id: string
): Promise<Bookings[]> => {
  const { data } = await axios.get<Bookings[]>(`${api}/booking/room/${room_id}`);
  return Array.isArray(data) ? data : [data]; // ensure it's always an array
};

export const fetchRoomById = async (
  room_id: string
): Promise<Room[]> => {
  const { data } = await axios.get<Room[]>(`${api}/room/${room_id}`);
  return Array.isArray(data) ? data : [data]; // ensure it's always an array
};
