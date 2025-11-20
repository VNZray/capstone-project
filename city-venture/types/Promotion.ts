
export interface Promotion {
  id: string;
  business_id: string;
  title: string;
  description: string;
  image_url?: string;
  external_link_url?: string;
  start_date: string;
  end_date?: string;
  is_active: boolean;
  terms_conditions?: string;
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
