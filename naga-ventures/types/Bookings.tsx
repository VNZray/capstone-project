export type Booking = {
  id: string;
  pax: number;
  guest_names: string;
  num_children: number;
  num_adults: number;
  foreign_count: number;
  domestic_count: number;
  overseas_count: number;
  local_counts: number;
  trip_purpose: string;
  check_in_date: string; // ISO 8601 date string
  check_out_date: string; // ISO 8601 date string
  total_price: number;
  balance: string;
  payment_status: string;
  created_at: string; // ISO timestamp
  user_id: string;
  room_id: string;
  booking_status: string;
};
