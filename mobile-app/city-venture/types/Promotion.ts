
export interface Promotion {
  id: string;
  business_id: string;
  title: string;
  description: string;
  image_url?: string;
  external_link_url?: string;
  start_date: string;
  end_date?: string;
  is_active: boolean | number; // Database returns 1/0 (number), TypeScript expects boolean
  terms_conditions?: string;
  promo_type: 1 | 2 | 3; // 1 = Discount Coupon, 2 = Room Discount, 3 = Promo Code
  promo_code?: string | null;
  discount_percentage?: number | null;
  fixed_discount_amount?: number | null;
  usage_limit?: number | null;
  used_count?: number;
  created_at: string;
  updated_at: string;
}

export interface PromotionFormData {
  title: string;
  description: string;
  image_url?: string;
  external_link_url?: string;
  start_date: string;
  end_date?: string;
  is_active: boolean;
  terms_conditions?: string;
}
