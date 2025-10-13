export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "completed"
  | "cancelled";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export type PaymentMethod = "cash_on_pickup" | "card" | "digital_wallet";

export interface Order {
  id: string;
  business_id: string;
  user_id: string;
  order_number: string;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  discount_id?: string | null;
  pickup_datetime?: string | null;
  special_instructions?: string | null;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod;
  arrival_code?: string | null;
  customer_arrived_at?: string | null;
  ready_at?: string | null;
  picked_up_at?: string | null;
  created_at?: string;
  updated_at?: string;
  user_email?: string | null;
  user_name?: string | null;
  user_phone?: string | null;
  business_name?: string | null;
  discount_name?: string | null;
  item_count?: number | null;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  special_requests?: string | null;
  created_at?: string;
  updated_at?: string;
  product_name?: string | null;
  product_image?: string | null;
}

export interface OrderStatsOverview {
  total_orders: number;
  pending_orders: number;
  confirmed_orders: number;
  preparing_orders: number;
  ready_orders: number;
  completed_orders: number;
  cancelled_orders: number;
  total_revenue: number;
  average_order_value: number;
  total_discounts_given: number;
}

export interface OrderStatsDaily {
  date: string;
  order_count: number;
  daily_revenue: number;
}

export interface PopularProductStat {
  product_name: string;
  total_quantity: number;
  order_count: number;
  revenue: number;
}

export interface OrderStats {
  overview: OrderStatsOverview;
  daily_stats: OrderStatsDaily[];
  popular_products: PopularProductStat[];
}

export interface OrderDetails extends Order {
  items: OrderItem[];
}
