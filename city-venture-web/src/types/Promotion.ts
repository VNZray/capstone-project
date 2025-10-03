export interface Promotion {
  id: string;
  title: string;
  description: string;
  promo_type: 'Discount' | 'Code';
  discount_value?: number;
  promo_code?: string;
  start_date: string;
  end_date: string;
  usage_limit?: number;
  used_count: number;
  applies_to_all: boolean;
  status: 'Active' | 'Paused' | 'Scheduled' | 'Expired';
  banner_image?: string;
  auto_pause_when_depleted: boolean;
  pause_on_expiry: boolean;
  room_count?: number; // computed if not applies_to_all
  business_id: string;
  created_at: string;
  updated_at: string;
}

// promotions
// id (uuid / serial)
// business_id (fk)
// title
// description
// promo_type (DISCOUNT | CODE | BOGO | FREE_TRIAL …)
// discount_value (nullable)
// promo_code (nullable)
// start_date / end_date (date/timestamp)
// usage_limit (int, nullable)
// used_count (int default 0)
// applies_to_all (boolean default false) ← NEW
// status (ACTIVE | PAUSED | SCHEDULED | EXPIRED)
// banner_image (text)
// auto_pause_when_depleted (boolean)
// pause_on_expiry (boolean)
// created_at / updated_at
// promotion_rooms (junction)

// id
// promotion_id (fk promotions.id ON DELETE CASCADE)
// room_id (fk room.id)
// UNIQUE (promotion_id, room_id)
// (Optional but recommended) promotion_usages (audit)

// id
// promotion_id
// room_id (nullable if global)
// booking_id (nullable)
// user_id (nullable)
// applied_amount (numeric)
// created_at