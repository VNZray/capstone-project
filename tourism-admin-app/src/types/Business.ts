export type BusinessStatus = 'Pending' | 'Active' | 'Inactive' | 'Maintenance';

// Core business entity aligned with current migration (min/max price excluded per clarification)
export interface Business {
  id: string;
  business_name: string;
  description: string | null;
  email: string;
  phone_number: string; // backend uses phone_number
  business_category_id: number;
  business_type_id: number;
  province_id: number | null;
  municipality_id: number | null;
  barangay_id: number | null;
  address: string;
  owner_id: string;
  status: BusinessStatus;
  business_image: string | null;
  latitude: string; // stored as string in DB migration
  longitude: string; // stored as string in DB migration
  // Pricing (required in migration)
  min_price: number;
  max_price: number;
  x_url: string | null;
  website_url: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  hasBooking: boolean; // still present though not focus
  created_at?: string;
  // Soft delete support (future) – not yet in schema; placeholder for frontend model compatibility
  deleted_at?: string | null;
}

// Enriched list item (after joins)
export interface BusinessListItem extends Business {
  category?: string;
  type?: string;
  province?: string;
  municipality?: string;
  barangay?: string;
}

export interface BusinessFilters {
  q?: string;
  status?: BusinessStatus | 'All';
  type_id?: number | 'All';
  category_id?: number | 'All';
}

export interface TypeOption {
  id: number;
  type: string;
}

export interface CategoryOption {
  id: number;
  category: string;
  type_id: number;
}

export interface LocationOption { id: number; name: string; }

// Business operating hours (per day)
export interface BusinessHour {
  id?: number;               // present after creation
  business_id: string;       // FK to business.id
  day_of_week: string;       // e.g. 'Monday'
  open_time: string | null;  // 'HH:MM:SS' or null if closed / not set
  close_time: string | null; // 'HH:MM:SS'
  is_open: boolean;          // false means closed for that day
}

// Input shape when creating/updating (business_id supplied separately during create flow)
export type BusinessHourInput = Omit<BusinessHour, 'business_id'>;
