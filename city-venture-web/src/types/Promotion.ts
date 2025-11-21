export interface Promotion {
  id: string;
  business_id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  external_link: string | null;
  promo_code: string | null;
  discount_percentage: number | null;
  fixed_discount_amount: number | null;
  usage_limit: number | null;
  used_count: number;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  promo_type: number;
  created_at: string;
  updated_at: string;
  business_name?: string;
  promo_name?: string;
}

export interface CreatePromotionPayload {
  business_id: string;
  title: string;
  description?: string | null;
  image_url?: string | null;
  external_link?: string | null;
  promo_code?: string | null;
  discount_percentage?: number | null;
  fixed_discount_amount?: number | null;
  usage_limit?: number | null;
  start_date?: string | null;
  end_date?: string | null;
  promo_type: number;
}

export interface UpdatePromotionPayload {
  title?: string | null;
  description?: string | null;
  image_url?: string | null;
  external_link?: string | null;
  promo_code?: string | null;
  discount_percentage?: number | null;
  fixed_discount_amount?: number | null;
  usage_limit?: number | null;
  start_date?: string | null;
  end_date?: string | null;
  is_active?: boolean | null;
  promo_type?: number | null;
}