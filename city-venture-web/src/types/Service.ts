import type { ShopCategoryAssignment } from "@/src/types/ShopCategory";

// Contact method type for services
export interface ContactMethod {
  type: "phone" | "email" | "facebook" | "viber" | "whatsapp" | "other";
  value: string;
}

// Service Types
export interface Service {
  id: string;
  business_id: string;
  shop_category_id: string;
  name: string;
  description?: string | null;
  image_url?: string | null;
  base_price: number;
  price_type: "per_hour" | "per_day" | "per_week" | "per_month" | "per_session" | "fixed";
  requirements?: string | null;
  contact_methods: ContactMethod[];
  contact_notes?: string | null;
  display_order: number;
  status: "active" | "inactive" | "seasonal";
  created_at?: string;
  updated_at?: string;
  category_name?: string;
  categories?: ShopCategoryAssignment[];
}

export interface CreateServicePayload {
  business_id: string;
  name: string;
  description?: string;
  image_url?: string;
  base_price: number;
  price_type: "per_hour" | "per_day" | "per_week" | "per_month" | "per_session" | "fixed";
  requirements?: string;
  contact_methods?: ContactMethod[];
  contact_notes?: string;
  display_order?: number;
  status?: "active" | "inactive" | "seasonal";
  category_ids: string[];
}

export interface UpdateServicePayload {
  name?: string;
  description?: string;
  image_url?: string;
  base_price?: number;
  price_type?: "per_hour" | "per_day" | "per_week" | "per_month" | "per_session" | "fixed";
  requirements?: string;
  contact_methods?: ContactMethod[];
  contact_notes?: string;
  display_order?: number;
  status?: "active" | "inactive" | "seasonal";
  category_ids?: string[];
}

