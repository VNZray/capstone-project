// types/BusinessFormData.ts
export type Business = {
  id: string;
  business_name: string;
  business_type: string;
  category: string;
  phone_number: string;
  business_email: string;
  barangay: string;
  city: string;
  province: string;
  postal_code: string;
  description: string;
  instagram_url: string;
  twitter_url: string;
  facebook_url: string;
  latitude: string;
  longitude: string;
  min_price: string;
  max_price: string;
  owner_id: number;
  status: string;
  image_url: string;
  business_permit: string;
  mayors_permit: string;
  is_business_permit_verified: boolean;
  is_mayors_permit_verified: boolean;
  isFav: boolean
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
