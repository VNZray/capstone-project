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
  product_category_id?: string;
  name: string;
  description: string | null;
  price: number | string; // Can be string from DB (decimal type)
  image_url: string | null;
  status: 'active' | 'inactive' | 'out_of_stock';
  created_at: string;
  updated_at: string;
  category_name?: string;
  categories?: ProductCategoryAssignment[];
  current_stock?: number | string; // Can be string from DB
  minimum_stock?: number | string; // Can be string from DB
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
