export type Amenity = {
  id: number;
  name: string;
  icon?: string;
};

export type RoomAmenity = {
  id: number;
  amenity_id: string;
  room_id: string;
};

export type BusinessAmenity = {
  id?: number | null;
  amenity_id?: number | null;
  business_id?: string | "";
};
