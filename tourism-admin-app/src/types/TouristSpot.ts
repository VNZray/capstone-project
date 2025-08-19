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
  category: string; // Name of the category
  type: string;     // Name of the type
  category_id: number; // Foreign key
  type_id: number;     // Foreign key
  created_at: string;
  updated_at: string;
  province: string; // Name of the province
  municipality: string; // Name of the municipality
  barangay: string; // Name of the barangay
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
  day_of_week: number; // 0 = Monday .. 6 = Sunday
  open_time: string | null; // 'HH:mm' or null if closed
  close_time: string | null; // 'HH:mm' or null if closed
  is_closed: boolean;
}
