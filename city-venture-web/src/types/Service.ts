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

export interface CreateServiceCategoryPayload {
  business_id: string;
  name: string;
  description?: string;
  display_order?: number;
  status?: string;
}

export interface UpdateServiceCategoryPayload {
  name?: string;
  description?: string;
  display_order?: number;
  status?: string;
}

// Service Types
export interface Service {
  id: string;
  business_id: string;
  name: string;
  description?: string | null;
  base_price: number;
  price_type: "fixed" | "per_hour" | "per_person" | "custom";
  duration_value?: number | null;
  duration_unit?: "minutes" | "hours" | "days" | "weeks" | null;
  capacity?: number | null;
  status: "active" | "inactive";
  terms_conditions?: string | null;
  cancellation_policy?: string | null;
  advance_booking_hours?: number | null;
  created_at?: string;
  updated_at?: string;
  categories?: ServiceCategory[];
}

export interface CreateServicePayload {
  business_id: string;
  name: string;
  description?: string;
  base_price: number;
  price_type: "fixed" | "per_hour" | "per_person" | "custom";
  duration_value?: number;
  duration_unit?: "minutes" | "hours" | "days" | "weeks";
  capacity?: number;
  status?: "active" | "inactive";
  terms_conditions?: string;
  cancellation_policy?: string;
  advance_booking_hours?: number;
  category_ids: string[];
}

export interface UpdateServicePayload {
  name?: string;
  description?: string;
  base_price?: number;
  price_type?: "fixed" | "per_hour" | "per_person" | "custom";
  duration_value?: number;
  duration_unit?: "minutes" | "hours" | "days" | "weeks";
  capacity?: number;
  status?: "active" | "inactive";
  terms_conditions?: string;
  cancellation_policy?: string;
  advance_booking_hours?: number;
  category_ids?: string[];
}
