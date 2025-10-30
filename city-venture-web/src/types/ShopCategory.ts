// Unified Shop Category Types
export interface ShopCategory {
  id: string;
  business_id: string;
  name: string;
  description?: string | null;
  category_type: 'product' | 'service' | 'both';
  display_order?: number;
  status: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
  // Statistics (from stats endpoint)
  product_count?: number;
  service_count?: number;
}

// Category assignment used when categories are attached to products/services
export interface ShopCategoryAssignment {
  id: string;
  name: string;
  is_primary?: boolean;
  display_order?: number | null;
}

export interface CreateShopCategoryPayload {
  business_id: string;
  name: string;
  description?: string;
  category_type?: 'product' | 'service' | 'both';
  display_order?: number;
  status?: 'active' | 'inactive';
}

export interface UpdateShopCategoryPayload {
  name?: string;
  description?: string;
  category_type?: 'product' | 'service' | 'both';
  display_order?: number;
  status?: 'active' | 'inactive';
}

export interface ShopCategoryStats {
  id: string;
  business_id: string;
  name: string;
  description?: string | null;
  category_type: 'product' | 'service' | 'both';
  display_order: number;
  status: 'active' | 'inactive';
  product_count: number;
  service_count: number;
  created_at: string;
  updated_at: string;
}
