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

// Service Types
export interface Service {
  id: string;
  business_id: string;
  name: string;
  description?: string | null;
  base_price: number | string; // Can be string from DB (decimal type)
  price_type: "fixed" | "per_hour" | "per_person" | "custom";
  duration_value?: number | string | null; // Can be string from DB
  duration_unit?: "minutes" | "hours" | "days" | "weeks" | null;
  capacity?: number | string | null; // Can be string from DB
  status: "active" | "inactive";
  terms_conditions?: string | null;
  cancellation_policy?: string | null;
  advance_booking_hours?: number | string | null; // Can be string from DB
  created_at?: string;
  updated_at?: string;
  categories?: ServiceCategory[];
}
