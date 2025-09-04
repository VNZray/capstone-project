export type Amenity = {
  id: number;
  name: string;
};

export type RoomAmenity = {
  id: number;
  amenity_id: string;
  room_id: string;
};

export type BusinessAmenity = {
  id: number;
  amenity_id: number;
  business_id: string;
};
