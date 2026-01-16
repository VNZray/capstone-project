// Discount Types (Simplified MVP Structure)
export interface Discount {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  // Removed: discount_type (always fixed amount)
  // Removed: discount_value (individual prices stored in discount_product table)
  // Removed: minimum_order_amount, maximum_discount_amount, usage_limit_per_customer, usage_limit
  start_datetime: string;
  end_datetime: string | null;
  status: 'active' | 'inactive' | 'expired' | 'paused';
  created_at: string;
  updated_at: string;
  // Joined fields
  applicable_products?: ApplicableProduct[];
}

export interface ApplicableProduct {
  id: string;
  discount_id?: string;
  product_id: string;
  product_name?: string;
  name?: string;
  price?: number;
  image_url?: string;
  discounted_price: number; // Individual discounted price for this product
  stock_limit: number | null; // NULL = unlimited
  current_stock_used: number;
  purchase_limit: number | null; // NULL = unlimited
  created_at: string;
}

export interface DiscountStats {
  discount: Discount;
  statistics: {
    total_orders: number;
    total_revenue_impact: number;
    average_order_value: number;
  };
  recent_orders: RecentOrder[];
}

export interface RecentOrder {
  order_id: string;
  order_date: string;
  customer_name: string | null;
  order_total: number;
  discount_amount: number;
}

export interface ValidateDiscountPayload {
  order_total: number;
  user_id?: string;
  product_ids?: string[];
}

export interface ValidateDiscountResponse {
  valid: boolean;
  discount?: {
    id: string;
    name: string;
    discounted_price: number; // Individual product discount
    discount_amount: number;
  };
  message?: string;
}

export interface CreateDiscountPayload {
  business_id: string;
  name: string;
  description?: string;
  // Removed: discount_value (individual prices in applicable_products)
  start_datetime: string;
  end_datetime?: string;
  status?: 'active' | 'inactive' | 'expired' | 'paused';
  applicable_products?: DiscountProductPayload[]; // Changed from string[] to include limits
}

export interface DiscountProductPayload {
  product_id: string;
  discounted_price: number; // Individual discounted price for this product
  stock_limit?: number | null;
  purchase_limit?: number | null;
}

export interface UpdateDiscountPayload {
  name?: string;
  description?: string;
  // Removed: discount_value (individual prices in applicable_products)
  start_datetime?: string;
  end_datetime?: string;
  status?: 'active' | 'inactive' | 'expired' | 'paused';
  applicable_products?: DiscountProductPayload[]; // Changed from string[] to include limits
}
