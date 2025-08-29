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
  category: string;
  type: string;
  category_id: number;
  type_id: number;
  created_at: string;
  updated_at: string;
  province: string;
  municipality: string;
  barangay: string;
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
  category: string;
}

export interface Type {
  id: number;
  type: string;
  category_id: number;
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
  category_id: string;
  type_id: string;
  spot_status: "" | "pending" | "active" | "inactive";
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
export interface PendingImage {
  id: string;
  file: File;
  preview: string;
  is_primary: boolean;
  alt_text: string;
}
