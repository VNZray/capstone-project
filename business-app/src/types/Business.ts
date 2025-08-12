// types/BusinessFormData.ts
export type Business = {
  id: string;
  business_name: string;
  business_type_id: string;
  business_category_id: string;
  phone_number: string;
  email: string;
  barangay_id: string;
  municipality_id: string;
  province_id: string;
  description: string;
  instagram_url: string;
  tiktok_url: string;
  facebook_url: string;
  latitude: string;
  longitude: string;
  min_price: string;
  max_price: string;
  owner_id: number;
  status: string;
  business_image: string;  
};

export type Room = {
  id: string;
  room_number: string;
  room_type: string;
  capacity: string;
  amenities: string | string[];
  room_price: string;
  description: string;
  business_id: number;
  status: string;
  room_image: string;
  room_photos: string | string[];
};
