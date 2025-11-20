// city-venture/services/AmenityService.tsx
import apiClient from '@/services/apiClient';
import type {
  Amenity,
  BusinessAmenities,
  BusinessAmenity,
  RoomAmenities,
  RoomAmenity,
} from '@/types/Business';

// Fetch all amenities
export const fetchAmenities = async (): Promise<Amenity[]> => {
  const { data } = await apiClient.get<Amenity[]>(`/amenities`);
  return Array.isArray(data) ? data : [];
};

// Fetch all business_amenities join rows
export const fetchAllBusinessAmenityLinks = async (): Promise<BusinessAmenity[]> => {
  const { data } = await apiClient.get<BusinessAmenity[]>(`/business-amenities`);
  return Array.isArray(data) ? data : [];
};

// Fetch all room_amenities join rows
export const fetchAllRoomAmenityLinks = async (): Promise<RoomAmenity[]> => {
  const { data } = await apiClient.get<RoomAmenity[]>(`/room-amenities`);
  return Array.isArray(data) ? data : [];
};

// Enriched business amenities with names for a given business
export const fetchBusinessAmenities = async (
  business_id: string
): Promise<BusinessAmenities> => {
  const [links, amenities] = await Promise.all([
    fetchAllBusinessAmenityLinks(),
    fetchAmenities(),
  ]);
  const amenityById = new Map<number, Amenity>(
    amenities.filter((a): a is Amenity & { id: number } => !!a && typeof a.id === 'number').map((a) => [a.id!, a])
  );
  const filtered = links.filter((l) => l.business_id === business_id);
  return filtered.map((l) => ({
    id: l.id,
    business_id: l.business_id!,
    amenity_id: l.amenity_id!,
    name: amenityById.get(l.amenity_id!)?.name ?? '',
  }));
};

// Enriched room amenities with names for a given room
export const fetchRoomAmenities = async (
  room_id: string
): Promise<RoomAmenities> => {
  const [links, amenities] = await Promise.all([
    fetchAllRoomAmenityLinks(),
    fetchAmenities(),
  ]);
  const amenityById = new Map<number, Amenity>(
    amenities.filter((a): a is Amenity & { id: number } => !!a && typeof a.id === 'number').map((a) => [a.id!, a])
  );
  const filtered = links.filter((l) => l.room_id === room_id);
  return filtered.map((l) => ({
    id: l.id,
    room_id: l.room_id!,
    amenity_id: l.amenity_id!,
    name: amenityById.get(l.amenity_id!)?.name ?? '',
  }));
};
