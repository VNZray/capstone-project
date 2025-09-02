// types/BusinessFormData.ts
export type Business = {
  id: string;
  business_name: string;
  business_type_id: number;
  business_category_id: number;
  phone_number: string;
  email: string;
  barangay_id: number;
  municipality_id: number;
  province_id: number;
  address: string;
  description: string;
  instagram_url: string;
  x_url: string;
  website_url: string;
  facebook_url: string;
  latitude: string;
  longitude: string;
  min_price: string;
  max_price: string;
  owner_id: string;
  status: string;
  business_image: string;
  hasBooking: boolean;
};

export type Room = {
  id: string;
  room_number: string;
  room_type: string;
  capacity: string;
  room_price: string;
  description: string;
  business_id: string;
  status: string;
  room_image: string;
  floor: string;
};

export type BusinessHours = {
  id?: number;
  business_id: string;
  day_of_week: string;
  open_time: string;
  close_time: string;
  is_open: boolean;
};
