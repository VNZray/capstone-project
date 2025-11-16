import axios from 'axios';
import api from '@/services/api';
import type { Business, BusinessDetails, BusinessType, BusinessCategory } from '@/types/Business';
import type { Address } from '@/types/Address';

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

/** Fetch Businesses by Owner */
export const fetchBusinessesByOwner = async (
  owner_id: string
): Promise<Business[]> => {
  const { data } = await axios.get(`${api}/business/owner/${owner_id}`);
  return Array.isArray(data) ? data : [data];
};

/** Fetch Business Type */
export const fetchBusinessType = async (
  business_type_id: number
): Promise<BusinessType> => {
  const { data } = await axios.get<BusinessType>(
    `${api}/category-and-type/type/${business_type_id}`
  );
  return data;
};

/** Fetch Business Category */
export const fetchBusinessCategory = async (
  business_category_id: number
): Promise<BusinessCategory> => {
  const { data } = await axios.get<BusinessCategory>(
    `${api}/category-and-type/category-by-id/${business_category_id}`
  );
  return data;
};

/** Fetch Address */
export const fetchAddress = async (barangay_id: number): Promise<Address> => {
  const { data } = await axios.get<Address>(`${api}/address/${barangay_id}`);
  return data;
};

/** Fetch Complete Business Data */
export const fetchBusinessData = async (
  id: string
): Promise<BusinessDetails> => {
  const business = await fetchBusinessDetails(id);
  const business_type = await fetchBusinessType(business.business_type_id);
  const business_category = await fetchBusinessCategory(
    business.business_category_id
  );
  const address = await fetchAddress(business.barangay_id);

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
    barangay_id: business.barangay_id,
    business_type_id: business.business_type_id,
    business_category_id: business.business_category_id,
    category: business_category.category,
    type: business_type.type,
    province_name: address.province_name ?? '',
    municipality_name: address.municipality_name ?? '',
    barangay_name: address.barangay_name ?? '',
  };

  return businessDetails;
};
