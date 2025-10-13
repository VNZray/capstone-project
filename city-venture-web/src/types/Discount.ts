// Discount Types
export interface Discount {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  discount_type: 'percentage' | 'fixed_amount';
  discount_value: number;
  minimum_order_amount: number;
  maximum_discount_amount: number | null;
  start_datetime: string;
  end_datetime: string | null;
  usage_limit: number | null;
  usage_limit_per_customer: number | null;
  current_usage_count: number;
  status: 'active' | 'inactive' | 'expired' | 'paused';
  created_at: string;
  updated_at: string;
  // Joined fields
  applicable_products?: ApplicableProduct[];
}

export interface ApplicableProduct {
  id: string;
  discount_id: string;
  product_id: string;
  product_name?: string;
  created_at: string;
}

export interface DiscountStats {
  discount: Discount;
  statistics: {
    total_orders: number;
    total_revenue_impact: number;
    average_order_value: number;
    remaining_uses: number | null;
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
    discount_type: 'percentage' | 'fixed_amount';
    discount_value: number;
    discount_amount: number;
  };
  message?: string;
}

export interface CreateDiscountPayload {
  business_id: string;
  name: string;
  description?: string;
  discount_type: 'percentage' | 'fixed_amount';
  discount_value: number;
  minimum_order_amount?: number;
  maximum_discount_amount?: number;
  start_datetime: string;
  end_datetime?: string;
  usage_limit?: number;
  usage_limit_per_customer?: number;
  status?: 'active' | 'inactive' | 'expired' | 'paused';
  applicable_products?: string[];
}

export interface UpdateDiscountPayload {
  name?: string;
  description?: string;
  discount_type?: 'percentage' | 'fixed_amount';
  discount_value?: number;
  minimum_order_amount?: number;
  maximum_discount_amount?: number;
  start_datetime?: string;
  end_datetime?: string;
  usage_limit?: number;
  usage_limit_per_customer?: number;
  status?: 'active' | 'inactive' | 'expired' | 'paused';
  applicable_products?: string[];
}
