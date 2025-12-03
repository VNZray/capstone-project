import type { EntityCategory } from './Category';

export interface TouristSpot {
  id: string;
  name: string;
  description: string;
  province_id: number;
  municipality_id: number;
  barangay_id: number;
  latitude: number | null;
  longitude: number | null;
  contact_phone: string;
  contact_email: string | null;
  website: string | null;
  entry_fee: number | null;
  spot_status: 'pending' | 'active' | 'inactive';
  is_featured: boolean;
  categories: EntityCategory[];
  created_at: string;
  updated_at: string;
  province: string;
  municipality: string;
  barangay: string;
  images?: TouristSpotImage[];
}

export interface Province {
  id: number;
  province: string;
}

export interface Municipality {
  id: number;
  municipality: string;
  province_id: number;
}

export interface Barangay {
  id: number;
  barangay: string;
  municipality_id: number;
}

export interface Category {
  id: number;
  title: string;
  alias: string;
  parent_category?: number | null;
}


export interface TouristSpotSchedule {
  id?: string;
  day_of_week: number;
  open_time: string | null;
  close_time: string | null;
  is_closed: boolean;
}

// Form-specific types
export interface TouristSpotFormData {
  name: string;
  description: string;
  province_id: string;
  municipality_id: string;
  barangay_id: string;
  latitude: string;
  longitude: string;
  contact_phone: string;
  contact_email: string;
  website: string;
  entry_fee: string;
  category_ids: number[];
  spot_status: "" | "pending" | "active" | "inactive";
  is_featured: boolean;
}

export interface FormOption {
  id: number;
  label: string;
}

export interface DaySchedule {
  dayIndex: number;
  is_closed: boolean;
  open_time: string;
  close_time: string;
}

// Image-related types
export interface TouristSpotImage {
  id: string;
  tourist_spot_id: string;
  file_url: string;
  file_format: string;
  file_size: number | null;
  is_primary: boolean;
  alt_text: string | null;
  uploaded_at: string;
  updated_at?: string;
}

export interface PendingImage {
  id: string;
  file: File;
  preview: string;
  is_primary: boolean;
  alt_text: string;
}
