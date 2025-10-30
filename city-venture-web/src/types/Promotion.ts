export interface Promotion {
  id: string;
  business_id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  external_link: string | null;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  business_name?: string;
}

export interface CreatePromotionPayload {
  business_id: string;
  title: string;
  description?: string | null;
  image_url?: string | null;
  external_link?: string | null;
  start_date?: string | null;
  end_date?: string | null;
}

export interface UpdatePromotionPayload {
  title?: string | null;
  description?: string | null;
  image_url?: string | null;
  external_link?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  is_active?: boolean | null;
}