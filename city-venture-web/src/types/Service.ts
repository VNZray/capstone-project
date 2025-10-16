import type { ShopCategory, ShopCategoryAssignment } from "@/src/types/ShopCategory";

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
  categories?: ShopCategoryAssignment[];
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
