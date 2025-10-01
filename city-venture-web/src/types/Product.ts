// Product Types
export interface ProductCategoryAssignment {
  id: string;
  name: string;
  is_primary: boolean;
  display_order?: number | null;
}

export interface Product {
  id: string;
  business_id: string;
  product_category_id?: string; // primary category reference
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  status: 'active' | 'inactive' | 'out_of_stock';
  created_at: string;
  updated_at: string;
  // Joined fields
  category_name?: string; // legacy field
  categories?: ProductCategoryAssignment[];
  current_stock?: number;
  minimum_stock?: number;
  stock_unit?: string;
}

export interface ProductCategory {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  display_order: number;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface ProductStock {
  id: string;
  product_id: string;
  current_stock: number;
  minimum_stock: number;
  maximum_stock: number | null;
  stock_unit: 'pieces' | 'kg' | 'liters' | 'grams' | 'portions';
  last_restocked_at: string | null;
  updated_at: string;
}

export interface StockHistory {
  id: string;
  product_id: string;
  change_type: 'restock' | 'sale' | 'adjustment' | 'expired';
  quantity_change: number;
  previous_stock: number;
  new_stock: number;
  notes: string | null;
  created_by: string | null;
  created_at: string;
}

export interface CreateProductPayload {
  business_id: string;
  category_ids: string[];
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  status?: 'active' | 'inactive' | 'out_of_stock';
}

export interface UpdateProductPayload {
  category_ids: string[];
  name?: string;
  description?: string;
  price?: number;
  image_url?: string;
  status?: 'active' | 'inactive' | 'out_of_stock';
}

export interface UpdateStockPayload {
  quantity_change: number;
  change_type: 'restock' | 'sale' | 'adjustment' | 'expired';
  notes?: string;
  created_by?: string;
}

export interface CreateCategoryPayload {
  business_id: string;
  name: string;
  description?: string;
  display_order?: number;
  status?: 'active' | 'inactive';
}
