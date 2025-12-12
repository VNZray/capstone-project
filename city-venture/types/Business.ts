import type { EntityCategory } from './Category';

// types/BusinessFormData.ts
export type Business = {
  id?: string | null;
  business_name: string;
  phone_number?: string | "";
  email: string;
  address?: string | "";
  description?: string | "";
  instagram_url?: string | "";
  x_url?: string | "";
  website_url?: string | "";
  facebook_url?: string | "";
  latitude?: string | "";
  longitude?: string | "";
  min_price?: string | "";
  max_price?: string | "";
  owner_id: string;
  status: string;
  business_image?: string | "";
  hasBooking?: boolean | number; // MySQL returns 1/0, JS may have true/false
  barangay_id: number;
  // New hierarchical category system
  categories?: EntityCategory[];
  category_ids?: number[];
  primary_category_id?: number;
};

// Legacy types - kept for backward compatibility during migration
export type BusinessType = {
  id: number;
  type: string;
};

export type BusinessCategory = {
  id: number;
  category: string;
};

export type BusinessDetails = {
  id?: string | null;
  business_name: string;
  phone_number?: string | "";
  email: string;
  address?: string | "";
  description?: string | "";
  instagram_url?: string | "";
  x_url?: string | "";
  website_url?: string | "";
  facebook_url?: string | "";
  latitude?: string | "";
  longitude?: string | "";
  min_price?: string | "";
  max_price?: string | "";
  owner_id: string;
  status: string;
  business_image?: string | "";
  hasBooking?: boolean | number; // MySQL returns 1/0, JS may have true/false
  barangay_id: number;
  province_name?: string | "";
  municipality_name?: string | "";
  barangay_name?: string | "";
  // New hierarchical category system
  categories?: EntityCategory[];
  primary_category?: string;
  ratings?: number;
  reviews?: number;
  // Legacy fields - kept for backward compatibility
  business_type_id?: number;
  business_category_id?: number;
  category?: string;
  type?: string;
};

export type Room = {
  id: string;
  room_number?: string;
  room_type?: string;
  capacity?: string;
  beds?: number;
  room_price?: string;
  description?: string;
  business_id?: string;
  status?: string;
  room_image?: string;
  floor?: string;
};

export type Rooms = Room[];


export type ExternalBooking = {
  id?: number;
  business_id?: string;
  platform_name?: string;
  booking_url?: string;
};

export type Amenity = {
  id?: number;
  name?: string;
};

export type BusinessAmenity = {
  id?: number;          // join row id
  business_id?: string;
  amenity_id?: number;
};

export type BusinessAmenityWithName = {
  id?: number;          // optional join id
  business_id: string;
  amenity_id: number;
  name: string;
};

export type BusinessAmenities = BusinessAmenityWithName[];

export type RoomAmenity = {
  id?: number;          // join row id
  room_id?: string;
  amenity_id?: number;
};

export type RoomAmenityWithName = {
  id?: number;          // optional join id
  room_id: string;
  amenity_id: number;
  name: string;
};


export type RoomAmenities = RoomAmenityWithName[];

export type BusinessHours = {
  id?: number;
  business_id?: string;
  day_of_week?: string;
  open_time?: string;
  close_time?: string;
  is_open?: boolean;
};

export type BusinessSchedule = BusinessHours[];