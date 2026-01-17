// Service Category Types
export interface ServiceCategory {
  id: string;
  business_id: string;
  name: string;
  description?: string | null;
  display_order?: number;
  status?: string;
  created_at?: string;
  updated_at?: string;
  is_primary?: boolean;
}

// Contact method for services
export interface ServiceContactMethod {
  type: 'phone' | 'email' | 'facebook' | 'viber' | 'whatsapp' | string;
  value: string;
}

// Service Types
export interface Service {
  id: string;
  business_id: string;
  shop_category_id?: string;
  name: string;
  description?: string | null;
  image_url?: string | null;
  base_price: number | string; // Can be string from DB (decimal type)
  price_type: 'fixed' | 'per_hour' | 'per_day' | 'per_week' | 'per_month' | 'per_session' | 'per_person' | 'custom';
  requirements?: string | null; // What customers should know/bring
  contact_methods?: ServiceContactMethod[] | string | null; // JSON array or stringified
  contact_notes?: string | null; // Additional contact instructions
  display_order?: number;
  status: 'active' | 'inactive' | 'seasonal';
  created_at?: string;
  updated_at?: string;
  // Joined from shop_category
  category_name?: string;
  categories?: ServiceCategory[];
}
